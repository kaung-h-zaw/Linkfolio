require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') })
const { DatabaseSync } = require('node:sqlite')
const { resolve } = require('node:path')
const { openPostgres } = require('../database/postgres.js')
const { backfillRelationalDocuments } = require('../database/relationalContent.js')

const tables = ['plans','templates','users','documents','publications','analytics','analytics_daily','messages','payments']

async function migrate(source, destination) {
  const totals = {}
  await destination.transaction(async () => {
    const { n } = await destination.prepare('SELECT COUNT(*) AS n FROM users').get()
    if (n) throw new Error('The destination already has accounts. Use an empty Supabase project for this import.')
    const hasEvents = source.prepare("SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'analytics_events'").get()
    for (const table of hasEvents ? [...tables, 'analytics_events'] : tables) {
      const rows = source.prepare(`SELECT * FROM ${table}`).all()
      for (const row of rows) {
        const columns = Object.keys(row)
        const quoted = columns.map((key) => `"${key.replaceAll('"', '""')}"`)
        const conflict = table === 'plans' || table === 'templates'
          ? ` ON CONFLICT (${table === 'templates' ? 'id, kind' : 'id'}) DO UPDATE SET ${columns.filter((key) => key !== 'id' && key !== 'kind').map((key) => `"${key}" = excluded."${key}"`).join(', ')}`
          : ''
        await destination.prepare(`INSERT INTO ${table} (${quoted.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})${conflict}`).run(...Object.values(row))
      }
      totals[table] = rows.length
    }
    // Rebuild from editor snapshots; old SQLite sources need not already have
    // the relational tables. Security sessions are intentionally not imported.
    totals.structuredDocuments = await backfillRelationalDocuments(destination)
  })
  return totals
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL to the destination Supabase database first.')
  const path = resolve(process.env.SQLITE_IMPORT_PATH || resolve(__dirname, '../data/linkfolio.sqlite'))
  // Read-only: never create, modify, or remove the source database.
  const source = new DatabaseSync(path, { readOnly: true })
  let destination
  try {
    destination = await openPostgres(process.env)
    const totals = await migrate(source, destination)
    console.log('SQLite import complete:', totals)
    console.log('Accounts keep their passwords. Sign in again to create new sessions.')
  } finally {
    source.close()
    await destination?.close()
  }
}

if (require.main === module) main().catch((error) => {
  console.error('Import failed:', error.message?.replace(/postgres(?:ql)?:\/\/\S+/gi, '[database URL]'))
  process.exitCode = 1
})
module.exports = { migrate }
