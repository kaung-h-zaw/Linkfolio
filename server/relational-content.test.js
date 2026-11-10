const { test } = require('node:test')
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
const { mkdtempSync, rmSync } = require('node:fs')
const { join } = require('node:path')
const { tmpdir } = require('node:os')
const { Pool } = require('pg')
const { openDatabase } = require('./database')
const { sqliteAdapter } = require('./databaseAdapter')
const { openPostgres, connectionOptions, postgresSql } = require('./postgres')
const createModels = require('./models')
const { relationalTables, relationalSchema, backfillRelationalDocuments, materializeDocument } = require('./relationalContent')
const { migrate } = require('./migrateSqlite')

const rich = { type:'doc', content:[{type:'paragraph',content:[{type:'text',text:'Keep rich text',marks:[{type:'bold'}]}]}] }
function document(id = 'resume') {
  return {
    id, kind:'resume', name:'Tailored application', templateId:'essential', origin:'import',
    personal:{fullName:'Original Name',email:'owner@example.com',headline:'Developer',summary:'Summary',phone:'123',customField:'Preserve me',links:[{id:'web',label:'Website',url:'https://example.com',type:'Website'}]},
    design:{font:'serif',layout:'columns',color:'#123456',margin:38,capitals:false},
    portfolio:{template:'essential',color:'#abcdef',surface:'#ffffff',contact:false,resumeDownload:true,design:{font:'serif'},images:{cover:'data:image/png;base64,AAAA'},resumeFile:{name:'Resume.pdf',data:'preserve-attachment'}},
    experienceSection:{heading:'Work history',customHeading:true,entries:[{id:'job',visible:false,jobTitle:'Developer',company:'Company',startDate:'2020-01',endDate:'',current:true,location:'Remote',employerUrl:'',content:rich}]},
    educationSection:{heading:'Education',entries:[{id:'school',visible:true,degree:'Computing',school:'College',schoolUrl:'',startDate:'2020',endDate:'2023',current:false,location:'City',content:rich}]},
    skillsSection:{heading:'Skills',entries:[{id:'skill',visible:true,name:'JavaScript',level:'Expert',content:rich}]},
    projectsSection:{heading:'Projects',entries:[{id:'project',visible:true,name:'Portfolio',url:'https://example.com',github:'',subtitle:'React',startDate:'',endDate:'',current:false,content:rich}]},
    certificationsSection:{heading:'Certificates',entries:[{id:'cert',visible:true,name:'Certificate',issuer:'College',url:'',issueDate:'2023',expiryDate:'',noExpiry:true,content:rich}]},
    // Keep older representations too; modern data takes precedence in renderers.
    experience:[{id:'legacy-job',company:'Old company',description:'Legacy entry'}],
    education:[{institution:'Old college',field:'Computing'}], skills:['JavaScript','SQL'],
    projects:[{name:'Old project',technologies:'CSS'}], certificates:[{name:'Old certificate'}],
    links:[{id:'old-link',label:'Old link',url:'https://old.example.com'}],
    summarySection:{heading:'Summary',entries:[{id:'summary',visible:true,content:rich}]},
    languagesSection:{heading:'Languages',entries:[]}, extraContent:[{type:'custom',entries:[]}],removedSections:['languages'],
  }
}
async function fixture(t, engine) {
  if (engine === 'sqlite') {
    const raw = openDatabase(':memory:')
    t.after(() => raw.close())
    const db = sqliteAdapter(raw)
    return { db, raw, models:createModels(db) }
  }
  const name = `linkfolio_test_${randomUUID().replaceAll('-','')}`
  const admin = new Pool(connectionOptions({DATABASE_URL:process.env.TEST_DATABASE_URL}))
  await admin.query(`CREATE DATABASE "${name}"`)
  const url = new URL(process.env.TEST_DATABASE_URL); url.pathname = `/${name}`
  let db
  try { db = await openPostgres({DATABASE_URL:url.toString()}) }
  catch (error) { await admin.query(`DROP DATABASE "${name}"`); await admin.end(); throw error }
  t.after(async () => { await db.close(); await admin.query(`DROP DATABASE "${name}"`); await admin.end() })
  return { db, models:createModels(db) }
}
async function account(db) {
  await db.prepare("INSERT INTO users (id,full_name,email,password_hash,created_at) VALUES ('owner','Owner','owner@example.com','preserved-hash','now')").run()
}
for (const engine of ['sqlite','postgres']) {
  const options = {skip:engine==='postgres'&&!process.env.TEST_DATABASE_URL}
  test(`${engine}: normalized rows round-trip modern/legacy content, order and privacy flags`, options, async (t) => {
    const {db,models} = await fixture(t,engine); await account(db)
    const original = document()
    await models.Document.save(original.id,'owner','resume',JSON.stringify(original),'now')
    assert.deepEqual(JSON.parse((await models.Document.findOwned(original.id,'owner')).data),original)
    for (const table of ['resumes','portfolios','profiles','themes','portfolio_settings','experiences','educations','skills','projects','certificates','links']) {
      assert.ok(Number((await db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get()).n)>0,table)
    }
    assert.equal((await db.prepare('SELECT visible FROM experiences WHERE section_key = ?').get('experienceSection')).visible,0)
    assert.equal((await db.prepare('SELECT contact FROM portfolio_settings').get()).contact,0)
    assert.equal((await db.prepare('SELECT resume_id FROM portfolios').get()).resume_id,original.id)
    const sqlEdit = 'Name edited in relational profile'
    await db.prepare('UPDATE profiles SET full_name = ? WHERE document_id = ?').run(sqlEdit,original.id)
    await db.prepare("UPDATE projects SET name = 'Updated project' WHERE section_key = 'projectsSection'").run()
    const canonical = JSON.parse((await models.Document.findById(original.id)).data)
    assert.equal(canonical.personal.fullName,sqlEdit)
    assert.equal(canonical.projectsSection.entries[0].name,'Updated project')
    assert.equal((await backfillRelationalDocuments(db)),0,'unchanged snapshots must not overwrite canonical rows')
    assert.equal(JSON.parse((await models.Document.findById(original.id)).data).personal.fullName,sqlEdit)
    await models.Publication.save(original.id,'owner-portfolio','public','now')
    assert.equal(JSON.parse((await models.Publication.findPublic('owner-portfolio')).data).personal.fullName,sqlEdit)
    assert.equal(JSON.parse((await models.Analytics.findByUserId('owner'))[0].data).personal.fullName,sqlEdit)
    await assert.rejects(db.prepare("INSERT INTO profiles (document_id,extra_data,present_fields) VALUES ('missing','{}','[]')").run())
  })
  test(`${engine}: saves replace sections atomically and deletion cleans up real relationships`, options, async (t) => {
    const {db,models} = await fixture(t,engine);await account(db)
    const initial=document();await models.Document.save(initial.id,'owner','resume',JSON.stringify(initial),'first')
    const updated=structuredClone(initial)
    updated.skillsSection.entries = [{...updated.skillsSection.entries[0],id:'second',name:'SQL'},updated.skillsSection.entries[0]]
    updated.projectsSection.entries=[]
    await models.transaction(() => models.Document.save(updated.id,'owner','resume',JSON.stringify(updated),'second'))
    assert.deepEqual(JSON.parse((await models.Document.findById(updated.id)).data),updated)
    assert.deepEqual((await db.prepare("SELECT name FROM skills WHERE section_key = 'skillsSection' ORDER BY position").all()).map(r=>r.name),['SQL','JavaScript'])
    assert.equal(Number((await db.prepare("SELECT COUNT(*) AS n FROM projects WHERE section_key = 'projectsSection'").get()).n),0)
    await assert.rejects(models.transaction(async()=>{
      await models.Document.updateData(JSON.stringify({...updated,name:'Rolled back'}),'third',updated.id)
      throw new Error('rollback')
    }),/rollback/)
    assert.deepEqual(JSON.parse((await models.Document.findById(updated.id)).data),updated)
    const resumeOnly={...updated}
    delete resumeOnly.portfolio
    await models.Document.updateData(JSON.stringify(resumeOnly),'third',updated.id)
    assert.equal(Number((await db.prepare('SELECT COUNT(*) AS n FROM portfolios').get()).n),0)
    assert.equal(Number((await db.prepare('SELECT COUNT(*) AS n FROM portfolio_settings').get()).n),0)
    assert.equal(Number((await db.prepare('SELECT COUNT(*) AS n FROM resumes').get()).n),1)
    assert.equal(Number((await db.prepare('SELECT COUNT(*) AS n FROM themes').get()).n),1)
    await models.Document.destroy(updated.id)
    for(const table of relationalTables.filter(n=>!['admins','reports'].includes(n))) {
      assert.equal(Number((await db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get()).n),0,table)
    }
  })
  test(`${engine}: standalone portfolios, computed reports and admin roles do not duplicate accounts`,options,async(t)=>{
    const {db,models}=await fixture(t,engine);await account(db)
    const standalone={...document('portfolio-only'),kind:'portfolio'}
    await models.Document.save(standalone.id,'owner','portfolio',JSON.stringify(standalone),'now')
    assert.equal(Number((await db.prepare('SELECT COUNT(*) AS n FROM resumes').get()).n),0)
    assert.equal((await db.prepare('SELECT resume_id FROM portfolios').get()).resume_id,null)
    await db.prepare("UPDATE users SET role = 'admin' WHERE id = 'owner'").run()
    assert.equal((await db.prepare('SELECT user_id FROM admins').get()).user_id,'owner')
    const admin=await db.prepare('SELECT * FROM admins').get()
    assert.equal(admin.password_hash,undefined)
    const report=await models.Report.summary()
    assert.equal(report.resume_count,0);assert.equal(report.portfolio_count,1);assert.equal(report.user_count,1)
  })
}

test('SQLite upgrade backfills saved documents once and preserves data after restart',async(t)=>{
  const dir=mkdtempSync(join(tmpdir(),'linkfolio-upgrade-'));const path=join(dir,'database.sqlite');t.after(()=>rmSync(dir,{recursive:true,force:true}))
  let raw=openDatabase(path);await account(sqliteAdapter(raw))
  const original=document();raw.prepare('INSERT INTO documents VALUES (?, ?, ?, ?, ?)').run(original.id,'owner','resume',JSON.stringify(original),'now')
  raw.prepare("INSERT INTO publications VALUES (?, 'existing-url', 'public', 'now')").run(original.id)
  raw.close();raw=openDatabase(path)
  let db=sqliteAdapter(raw)
  assert.deepEqual(JSON.parse((await materializeDocument(db,await db.prepare('SELECT * FROM documents').get())).data),original)
  assert.equal((await db.prepare('SELECT slug FROM publications').get()).slug,'existing-url')
  assert.equal((await db.prepare('SELECT password_hash FROM users').get()).password_hash,'preserved-hash')
  await db.prepare("UPDATE profiles SET full_name = 'Relational owner'").run()
  raw.close();raw=openDatabase(path);db=sqliteAdapter(raw)
  assert.equal(JSON.parse((await materializeDocument(db,await db.prepare('SELECT * FROM documents').get())).data).personal.fullName,'Relational owner')
  assert.deepEqual(raw.prepare('PRAGMA foreign_key_check').all(),[])
  raw.close()
})

test('a failed standalone normalized write rolls back both the snapshot and structured content',async(t)=>{
  const {db,raw,models}=await fixture(t,'sqlite');await account(db)
  const original=document();await models.Document.save(original.id,'owner','resume',JSON.stringify(original),'now')
  raw.exec("CREATE TRIGGER reject_project BEFORE INSERT ON projects WHEN NEW.name = 'Rejected' BEGIN SELECT RAISE(ABORT, 'project rejected'); END;")
  const invalid=structuredClone(original);invalid.projectsSection.entries[0].name='Rejected'
  await assert.rejects(models.Document.save(invalid.id,'owner','resume',JSON.stringify(invalid),'later'),/project rejected/)
  assert.equal((await db.prepare('SELECT data FROM documents').get()).data,JSON.stringify(original))
  assert.deepEqual(JSON.parse((await models.Document.findById(original.id)).data),original)
})

test('PostgreSQL schema and queries qualify new tables without changing literal values',()=>{
  const sql=relationalSchema('postgres')
  assert.ok(sql.includes('REFERENCES linkfolio.documents(id)'))
  assert.ok(sql.includes('CREATE OR REPLACE VIEW linkfolio.reports AS SELECT'))
  assert.ok(sql.includes("WHERE role = 'admin'"))
  assert.equal(postgresSql('SELECT * FROM projects WHERE document_id = ?'),'SELECT * FROM linkfolio.projects WHERE document_id = $1')
})

test('PostgreSQL import rebuilds structured rows from an old SQLite snapshot',{skip:!process.env.TEST_DATABASE_URL},async(t)=>{
  const {db,models}=await fixture(t,'postgres');const raw=openDatabase(':memory:');t.after(()=>raw.close());await account(sqliteAdapter(raw))
  const original=document();raw.prepare('INSERT INTO documents VALUES (?, ?, ?, ?, ?)').run(original.id,'owner','resume',JSON.stringify(original),'now')
  const totals=await migrate(raw,db);assert.equal(totals.structuredDocuments,1)
  assert.deepEqual(JSON.parse((await models.Document.findById(original.id)).data),original)
  assert.equal(Number((await db.prepare("SELECT COUNT(*) AS n FROM projects WHERE section_key = 'projectsSection'").get()).n),1)
})
