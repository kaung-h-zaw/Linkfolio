const { test } = require('node:test')
const assert = require('node:assert/strict')
const { openDatabase } = require('../database/database.js')
const { sqliteAdapter } = require('../database/adapter.js')
const createModels = require('../models')
const controller = require('../controllers/AdminController')
const { requireAdmin } = require('../middleware/AuthMiddleware')

function fixture(t) {
  const db = openDatabase(':memory:')
  t.after(() => db.close())
  const models = createModels(sqliteAdapter(db))
  for (const [id,role] of [['owner','user'],['admin','admin']]) db.prepare('INSERT INTO users(id,full_name,email,password_hash,role,created_at) VALUES(?,?,?,?,?,?)').run(id,id,`${id}@example.com`,'unused',role,'2026-11-16T00:00:00Z')
  return {db,models,req:{app:{locals:{models}},params:{id:'owner'},user:{id:'admin',role:'admin'},body:{}},res:{json(value){this.body=value}}}
}
test('deleting a user requires exact confirmation and protects administrators',async t => {
  const {models,req,res} = fixture(t)
  req.body.email='wrong@example.com'
  await assert.rejects(controller.deleteUser(req,res),/exactly/)
  assert.ok(await models.User.findById('owner'))
  req.params.id='admin'; req.body.email='admin@example.com'
  await assert.rejects(controller.deleteUser(req,res),/cannot be deleted/)
  assert.ok(await models.User.findById('admin'))
})
test('deleting a confirmed user removes their documents, messages, analytics and sessions',async t => {
  const {db,req,res}=fixture(t)
  db.prepare('INSERT INTO documents VALUES(?,?,?,?,?)').run('doc','owner','portfolio','{}','2026-11-16')
  db.prepare('INSERT INTO publications VALUES(?,?,?,?)').run('doc','test','public','2026-11-16')
  db.prepare('INSERT INTO analytics VALUES(?,?,?,?)').run('doc',3,1,'2026-11-16')
  db.prepare('INSERT INTO analytics_daily VALUES(?,?,?,?)').run('doc','2026-11-16',3,1)
  db.prepare('INSERT INTO messages(id,document_id,sender_name,sender_email,message,status,created_at) VALUES(?,?,?,?,?,?,?)').run('msg','doc','Visitor','visitor@example.com','Hello','unread','2026-11-16')
  db.prepare('INSERT INTO sessions VALUES(?,?,?)').run('token','owner',Date.now()+60000)
  req.body.email='owner@example.com'
  await controller.deleteUser(req,res)
  assert.deepEqual(res.body,{ok:true})
  for(const table of ['documents','publications','analytics','analytics_daily','messages','sessions']) assert.equal(db.prepare(`SELECT count(*) AS count FROM ${table}`).get().count,0,table)
  assert.equal(db.prepare("SELECT count(*) AS count FROM users WHERE id='owner'").get().count,0)
})
test('disabling a user revokes sessions and re-enabling restores sign-in eligibility',async t => {
  const {db,models,req,res}=fixture(t)
  db.prepare('INSERT INTO sessions VALUES(?,?,?)').run('token','owner',Date.now()+60000)
  req.body.disabled=true
  await controller.updateUser(req,res)
  assert.equal((await models.User.findById('owner')).disabled,1)
  assert.equal(db.prepare('SELECT count(*) AS count FROM sessions').get().count,0)
  req.body.disabled=false
  await controller.updateUser(req,res)
  assert.equal((await models.User.findById('owner')).disabled,0)
})
test('template edits persist names and access flags; invalid names do not alter settings',async t => {
  const {models,req,res}=fixture(t)
  req.params={id:'miniport',kind:'portfolio'}
  req.body={name:'Studio',enabled:false,premium:true}
  await controller.updateTemplate(req,res)
  let row=await models.Template.findById('miniport','portfolio')
  assert.equal(row.name,'Studio');assert.equal(row.enabled,0);assert.equal(row.premium,1)
  req.body={name:'',enabled:true,premium:false}
  await assert.rejects(controller.updateTemplate(req,res))
  row=await models.Template.findById('miniport','portfolio')
  assert.equal(row.name,'Studio');assert.equal(row.enabled,0)
})
test('Free and Premium limits are editable and invalid limits are rejected',async t => {
  const {models,req,res}=fixture(t)
  for(const id of ['free','premium']) {
    req.params.id=id;req.body={resumeLimit:2,portfolioLimit:3,enabled:true}
    await controller.updatePlan(req,res)
    assert.equal((await models.Plan.findById(id)).resume_limit,2)
    req.body.resumeLimit=0
    await assert.rejects(controller.updatePlan(req,res),/whole numbers/)
    assert.equal((await models.Plan.findById(id)).resume_limit,2)
  }
})
test('admin middleware denies ordinary users',() => {
  let next=false, status
  const res={status(value){status=value;return this},json(){}}
  requireAdmin({user:{role:'user'}},res,()=>{next=true})
  assert.equal(status,403);assert.equal(next,false)
  requireAdmin({user:{role:'admin'}},res,()=>{next=true})
  assert.equal(next,true)
})
test('admin reports include every required total without exposing password hashes',async t => {
  const {db,req,res}=fixture(t)
  db.prepare("UPDATE users SET plan='premium' WHERE role='admin'").run()
  await controller.index(req,res)
  for (const key of ['users','resumes','portfolios','published','messages','views','paidUpgrades']) assert.equal(typeof res.body.report[key],'number',key)
  assert.equal(res.body.users.length,2)
  assert.equal(res.body.report.users,1)
  assert.equal(res.body.report.administrators,1)
  assert.equal(res.body.report.premiumUsers,0)
  assert.deepEqual(res.body.accountSummary.users,{total:1,active:1,disabled:0,premium:0,free:1})
  assert.deepEqual(res.body.accountSummary.administrators,{total:1,active:1,disabled:0})
  for (const user of res.body.users) {
    assert.equal(user.password_hash,undefined)
    assert.equal(typeof user.disabled,'boolean')
  }
})
test('Premium users and paid upgrades exclude admins and count members separately from payment events',async t => {
  const {db,models,req,res}=fixture(t)
  db.prepare("UPDATE users SET plan='premium'").run()
  for(const [id,userId] of [['admin-payment','admin'],['member-payment-1','owner'],['member-payment-2','owner']]) db.prepare('INSERT INTO payments(id,user_id,provider,status,created_at) VALUES(?,?,?,?,?)').run(id,userId,'demo','paid','2026-11-16')
  await controller.index(req,res)
  assert.equal(res.body.report.premiumUsers,1)
  assert.equal(res.body.accountSummary.users.premium,1)
  assert.equal(res.body.report.administrators,1)
  assert.equal(res.body.report.paidUpgrades,2)
  assert.equal((await models.Payment.countPaid()).n,2)
})
