require('dotenv').config({ path: require('node:path').resolve(__dirname, '.env') })
const { openConfiguredDatabase } = require('./configuredDatabase')

async function check() {
  const db = await openConfiguredDatabase()
  try {
    await db.prepare('SELECT 1 AS ready').get()
    const { n } = await db.prepare('SELECT COUNT(*) AS n FROM templates').get()
    console.log(`Database ready (${db.engine || 'sqlite'}). ${n} templates available.`)
  } finally { await db.close() }
}
check().catch((error) => {
  console.error('Database check failed:', error.message?.replace(/postgres(?:ql)?:\/\/\S+/gi, '[database URL]'))
  process.exitCode = 1
})
