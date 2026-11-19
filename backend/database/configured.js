const { resolve } = require('node:path')
const { openDatabase } = require('./database.js')
const { openPostgres } = require('./postgres.js')

async function openConfiguredDatabase(env = process.env) {
  if (env.DATABASE_URL) return openPostgres(env)
  if (env.NODE_ENV === 'production' && !env.DATABASE_PATH) {
    throw new Error('Set DATABASE_URL for Supabase, or DATABASE_PATH on persistent storage. Refusing to use an ephemeral production database.')
  }
  return openDatabase(env.DATABASE_PATH || resolve(__dirname, '../data/linkfolio.sqlite'))
}

module.exports = { openConfiguredDatabase }
