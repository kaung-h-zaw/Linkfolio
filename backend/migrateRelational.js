require('dotenv').config({ path: require('node:path').resolve(__dirname, '.env'), quiet: true })
const { DatabaseSync, backup } = require('node:sqlite')
const { existsSync, mkdirSync } = require('node:fs')
const { dirname, join, resolve } = require('node:path')
const { parseArgs, isDeepStrictEqual } = require('node:util')
const { openConfiguredDatabase } = require('./configuredDatabase')
const { sqliteAdapter } = require('./databaseAdapter')
const { materializeDocument } = require('./relationalContent')

async function main() {
  const { values } = parseArgs({ options: { sqlite: {type:'string'}, 'backup-dir': {type:'string'} } })
  const env = { ...process.env }
  if (values.sqlite) { env.DATABASE_URL = ''; env.DATABASE_PATH = resolve(values.sqlite) }
  const path = resolve(env.DATABASE_PATH || join(__dirname, 'data/linkfolio.sqlite'))
  let snapshots = []
  if (!env.DATABASE_URL && existsSync(path)) {
    const before = new DatabaseSync(path, {readOnly:true})
    try {
      const hasStructured = before.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='relational_documents'").get()
      // Only compare unconverted editor snapshots: structured records may have
      // legitimate SQL edits newer than their retained compatibility snapshot.
      snapshots = before.prepare(hasStructured
        ? 'SELECT d.* FROM documents d LEFT JOIN relational_documents r ON r.document_id = d.id WHERE r.document_id IS NULL'
        : 'SELECT * FROM documents').all()
      const dir = resolve(values['backup-dir'] || join(dirname(path), 'backups'))
      mkdirSync(dir, {recursive:true})
      const destination = join(dir, `before-relational-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`)
      await backup(before, destination)
      console.log(`SQLite backup: ${destination}`)
    } finally { before.close() }
  }
  const db = await openConfiguredDatabase(env)
  try {
    const storage = db.engine === 'postgres' ? db : sqliteAdapter(db)
    for (const snapshot of snapshots) {
      const loaded = await materializeDocument(storage, snapshot)
      if (!isDeepStrictEqual(JSON.parse(loaded.data), JSON.parse(snapshot.data))) {
        throw new Error(`Document ${snapshot.id} did not round-trip exactly. Restore the backup before continuing.`)
      }
    }
    if (db.engine !== 'postgres' && db.prepare('PRAGMA foreign_key_check').all().length) {
      throw new Error('Foreign-key validation failed. Review the backup before continuing.')
    }
    const counts = {}
    for (const table of ['documents','resumes','portfolios','profiles','experiences','educations','skills','projects','certificates','links']) {
      counts[table] = Number((await storage.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get()).n)
    }
    console.log(`Relational migration ready (${db.engine || 'sqlite'}).`)
    console.log('Record counts:', JSON.stringify(counts))
    console.log(`Verified ${snapshots.length} previously unconverted editor snapshots.`)
  } finally { await db.close() }
}
main().catch((error) => {
  console.error('Migration failed:', error.message?.replace(/postgres(?:ql)?:\/\/\S+/gi, '[database URL]'))
  process.exitCode = 1
})
