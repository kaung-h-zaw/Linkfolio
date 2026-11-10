const { createHash } = require('node:crypto')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const VERSION = 1
const relationalTables = ['relational_documents', 'resumes', 'portfolios', 'profiles', 'themes',
  'portfolio_settings', 'document_sections', 'experiences', 'educations', 'skills', 'projects',
  'certificates', 'links', 'admins', 'reports']
const allTables = ['users', 'documents', 'templates', 'publications', 'messages', 'analytics', 'payments', ...relationalTables]
function relationalSchema(engine = 'sqlite') {
  const sql = readFileSync(join(__dirname, 'schema/relational-content.sql'), 'utf8')
  if (engine !== 'postgres') return sql
  // PostgreSQL lacks CREATE VIEW IF NOT EXISTS. CREATE OR REPLACE is idempotent
  // for these stable, read-only projections. Qualify identifiers, not literals.
  return sql.replaceAll('CREATE VIEW IF NOT EXISTS', 'CREATE OR REPLACE VIEW')
    .replace(/--[^\n]*|'(?:''|[^'])*'|[a-z_][a-z_0-9]*/gi,
      (token) => allTables.includes(token.toLowerCase()) ? `linkfolio.${token}` : token)
}
const hash = (data) => createHash('sha256').update(data).digest('hex')
const field = (name, column = name, type = 'string') => ({ name, column, type })
const profileFields = [field('fullName', 'full_name'), ...['headline','email','phone','location','photo','summary','website','linkedin','github'].map((name) => field(name))]
const themeFields = ['color','surface','font','layout'].map((name) => field(name))
const settingsFields = [field('contact', 'contact', 'boolean'), field('resumeDownload', 'resume_download', 'boolean')]
const entryFields = [field('id', 'entry_id'), field('visible', 'visible', 'boolean')]
const content = field('content', 'content', 'json')
const collections = {
  experiences: [...entryFields, field('jobTitle','job_title'), field('company'), field('employerUrl','employer_url'), field('startDate','start_date'), field('endDate','end_date'), field('current','current','boolean'), field('location'), content],
  educations: [...entryFields, field('degree'), field('school'), field('schoolUrl','school_url'), field('startDate','start_date'), field('endDate','end_date'), field('current','current','boolean'), field('location'), content],
  skills: [...entryFields, field('name'), field('level'), content],
  projects: [...entryFields, field('name'), field('url'), field('github'), field('subtitle'), field('startDate','start_date'), field('endDate','end_date'), field('current','current','boolean'), content],
  certificates: [...entryFields, field('name'), field('url'), field('issuer'), field('issueDate','issue_date'), field('expiryDate','expiry_date'), field('noExpiry','no_expiry','boolean'), content],
  links: [field('id','entry_id'), ...['type','name','label','url'].map((name) => field(name))],
}
const sections = {
  experienceSection: 'experiences', experience: 'experiences',
  educationSection: 'educations', education: 'educations',
  skillsSection: 'skills', skills: 'skills',
  projectsSection: 'projects', projects: 'projects',
  certificationsSection: 'certificates', certificates: 'certificates',
  links: 'links', 'personal.links': 'links',
}
const object = (value) => value && typeof value === 'object' && !Array.isArray(value)
function encode(value, fields) {
  const extra = { ...value }
  const present = []
  const values = {}
  for (const f of fields) {
    const v = value[f.name]
    const valid = v !== undefined && (f.type === 'json' || typeof v === f.type)
    values[f.column] = valid ? (f.type === 'boolean' ? Number(v) : f.type === 'json' ? JSON.stringify(v) : v) : null
    if (valid) { delete extra[f.name]; present.push(f.name) }
  }
  return { ...values, extra_data: JSON.stringify(extra), present_fields: JSON.stringify(present) }
}
function decode(row, fields) {
  const result = JSON.parse(row.extra_data)
  const present = new Set(JSON.parse(row.present_fields))
  for (const f of fields) if (present.has(f.name)) {
    result[f.name] = f.type === 'boolean' ? Boolean(row[f.column])
      : f.type === 'json' ? JSON.parse(row[f.column]) : row[f.column]
  }
  return result
}
function insert(table, values) {
  const columns = Object.keys(values)
  return { sql: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`, values: Object.values(values) }
}
function documentStatements(row) {
  const data = JSON.parse(row.data)
  if (!object(data)) throw new Error(`Document ${row.id} does not contain an editor object.`)
  const id = row.id
  const statements = []
  const run = (sql, ...values) => statements.push({ sql, values })
  // Children cascade from section metadata. Keep the core document and existing
  // publications/messages/analytics intact during a complete section replace.
  for (const table of ['document_sections','profiles','themes','portfolio_settings','portfolios','resumes']) {
    run(`DELETE FROM ${table} WHERE document_id = ?`, id)
  }
  const isResume = row.kind === 'resume'
  if (isResume) statements.push(insert('resumes', { document_id: id, title: data.name ?? null, template_id: data.templateId ?? null }))
  if (object(data.personal)) {
    const personal = { ...data.personal }
    if (Array.isArray(personal.links)) delete personal.links
    statements.push(insert('profiles', { document_id: id, ...encode(personal, profileFields) }))
  }
  if (object(data.design)) statements.push(insert('themes', { document_id:id, scope:'resume', ...encode(data.design, themeFields) }))
  if (object(data.portfolio)) {
    statements.push(insert('portfolios', { document_id:id, resume_id:isResume ? id : null, title:data.name ?? null, template_id:data.portfolio.template ?? null }))
    const settings = { ...data.portfolio }
    const theme = {}
    for (const key of ['color','surface']) if (Object.hasOwn(settings, key)) { theme[key] = settings[key]; delete settings[key] }
    // The template reference has its own relational column.
    delete settings.template
    statements.push(insert('themes', { document_id:id, scope:'portfolio', ...encode(theme, themeFields) }))
    statements.push(insert('portfolio_settings', { document_id:id, ...encode(settings, settingsFields) }))
  }
  for (const [key, table] of Object.entries(sections)) {
    const value = key === 'personal.links' ? data.personal?.links : data[key]
    const modern = object(value) && Array.isArray(value.entries)
    if (!modern && !Array.isArray(value)) continue
    const entries = modern ? value.entries : value
    const options = modern ? { ...value } : {}
    delete options.entries
    statements.push(insert('document_sections', { document_id:id, section_key:key, format:modern?'object':'array', options_data:JSON.stringify(options) }))
    entries.forEach((entry, position) => {
      const record = encode(object(entry) ? entry : {}, collections[table])
      if (table === 'skills' && typeof entry === 'string') record.name = entry
      statements.push(insert(table, { document_id:id, section_key:key, position, ...record, primitive_data:object(entry)?null:JSON.stringify(entry) }))
    })
  }
  run('INSERT INTO relational_documents (document_id, version, snapshot_hash) VALUES (?, ?, ?) ON CONFLICT(document_id) DO UPDATE SET version = excluded.version, snapshot_hash = excluded.snapshot_hash', id, VERSION, hash(row.data))
  return statements
}
async function saveRelationalDocument(db, row) {
  for (const statement of documentStatements(row)) await db.prepare(statement.sql).run(...statement.values)
}
async function backfillRelationalDocuments(db) {
  const rows = await db.prepare(`SELECT * FROM documents${db.engine === 'postgres' ? ' FOR UPDATE' : ''}`).all()
  // Compare hashes in JS, avoiding engine-specific JSON/hash functions.
  let migrated = 0
  for (const row of rows) {
    const marker = await db.prepare('SELECT * FROM relational_documents WHERE document_id = ?').get(row.id)
    if (marker?.version === VERSION && marker.snapshot_hash === hash(row.data)) continue
    await saveRelationalDocument(db, row)
    migrated++
  }
  return migrated
}
function initializeSqliteContent(db) {
  db.exec('BEGIN IMMEDIATE')
  try {
    db.exec(relationalSchema())
    const rows = db.prepare('SELECT * FROM documents').all()
    const marker = db.prepare('SELECT * FROM relational_documents WHERE document_id = ?')
    for (const row of rows) {
      const saved = marker.get(row.id)
      if (saved?.version === VERSION && saved.snapshot_hash === hash(row.data)) continue
      for (const statement of documentStatements(row)) db.prepare(statement.sql).run(...statement.values)
    }
    db.exec('COMMIT')
  } catch (error) { db.exec('ROLLBACK'); db.close(); throw error }
}
async function materializeDocument(db, row) {
  if (!row) return row
  return db.atomic(async () => {
    // App writes lock the root row before replacing child records. Hold a
    // matching read lock so a public response cannot mix two section versions.
    if (db.engine === 'postgres') {
      await db.prepare('SELECT id FROM documents WHERE id = ? FOR SHARE').get(row.id)
    }
    return readRelationalDocument(db, row)
  })
}
async function readRelationalDocument(db, row) {
  if (!row) return row
  const marker = await db.prepare('SELECT * FROM relational_documents WHERE document_id = ?').get(row.id)
  // Direct SQL imports and pre-migration snapshots remain readable. Normal
  // application writes and the importer always update their structured records.
  if (!marker || marker.version !== VERSION || marker.snapshot_hash !== hash(row.data)) return row
  const data = JSON.parse(row.data)
  const extractedSections = new Set(Object.keys(sections).filter((key) => {
    const value = key === 'personal.links' ? data.personal?.links : data[key]
    return Array.isArray(value) || (object(value) && Array.isArray(value.entries))
  }))
  const [profile, resume, portfolio, settings, themes, sectionRows] = await Promise.all([
    db.prepare('SELECT * FROM profiles WHERE document_id = ?').get(row.id),
    db.prepare('SELECT * FROM resumes WHERE document_id = ?').get(row.id),
    db.prepare('SELECT * FROM portfolios WHERE document_id = ?').get(row.id),
    db.prepare('SELECT * FROM portfolio_settings WHERE document_id = ?').get(row.id),
    db.prepare('SELECT * FROM themes WHERE document_id = ?').all(row.id),
    db.prepare('SELECT * FROM document_sections WHERE document_id = ?').all(row.id),
  ])
  if (profile) data.personal = decode(profile, profileFields)
  const metadata = resume || portfolio
  if (metadata?.title !== null && metadata?.title !== undefined) data.name = metadata.title
  if (resume?.template_id !== null && resume?.template_id !== undefined) data.templateId = resume.template_id
  if (object(data.design)) delete data.design
  if (object(data.portfolio)) delete data.portfolio
  if (portfolio && settings) {
    data.portfolio = decode(settings, settingsFields)
    if (portfolio.template_id !== null) data.portfolio.template = portfolio.template_id
  }
  for (const theme of themes) {
    if (theme.scope === 'resume') data.design = decode(theme, themeFields)
    else if (data.portfolio) Object.assign(data.portfolio, decode(theme, themeFields))
  }
  for (const key of Object.keys(sections)) {
    if (!extractedSections.has(key)) continue
    if (key === 'personal.links') { if (data.personal) delete data.personal.links }
    else delete data[key]
  }
  await Promise.all(sectionRows.map(async (section) => {
    const table = sections[section.section_key]
    if (!table) return
    const rows = await db.prepare(`SELECT * FROM ${table} WHERE document_id = ? AND section_key = ? ORDER BY position`).all(row.id, section.section_key)
    const entries = rows.map((entry) => entry.primitive_data !== null
      ? (table === 'skills' && typeof JSON.parse(entry.primitive_data) === 'string' ? entry.name : JSON.parse(entry.primitive_data))
      : decode(entry, collections[table]))
    const value = section.format === 'object' ? { ...JSON.parse(section.options_data), entries } : entries
    if (section.section_key === 'personal.links') data.personal.links = value
    else data[section.section_key] = value
  }))
  return { ...row, data: JSON.stringify(data) }
}
module.exports = { relationalTables, relationalSchema, documentStatements, saveRelationalDocument,
  backfillRelationalDocuments, initializeSqliteContent, materializeDocument }
