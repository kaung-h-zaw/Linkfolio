const { Pool } = require('pg')
const { AsyncLocalStorage } = require('node:async_hooks')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')
const { seedDatabase } = require('./databaseSeeds')
const { relationalTables, relationalSchema, backfillRelationalDocuments } = require('./relationalContent')

// Model queries use SQLite's question-mark parameters. Translate only SQL
// tokens, leaving quoted strings alone, and qualify our private schema tables.
function postgresSql(sql) {
  let parameter = 0
  let relation = false
  const tables = new Set(['users','sessions','password_resets','documents','publications',
    'analytics','analytics_daily','messages','templates','plans','payments', ...relationalTables])
  return sql.replace(/'(?:''|[^'])*'|"(?:""|[^"])*"|\?|[a-z_][a-z_0-9]*|\S/gi, (token) => {
    if (token === '?') return `$${++parameter}`
    const lower = token.toLowerCase()
    if (relation) {
      relation = false
      if (tables.has(lower)) return `linkfolio.${token}`
    }
    if (['from','join','into','update'].includes(lower)) relation = true
    return token
  })
}

function connectionOptions(env) {
  const url = new URL(env.DATABASE_URL)
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('DATABASE_URL must be a PostgreSQL connection URL.')
  const local = ['localhost','127.0.0.1','[::1]'].includes(url.hostname)
  // pg's connection-string SSL settings override its ssl object. Configure
  // verification here so an optional Supabase CA certificate is respected.
  for (const key of ['sslmode','sslcert','sslkey','sslrootcert']) url.searchParams.delete(key)
  if (env.DATABASE_SSL === 'false' && !local) throw new Error('Remote database connections require TLS.')
  return {
    connectionString: url.toString(),
    max: 3,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    ssl: local && env.DATABASE_SSL !== 'true' ? false : {
      rejectUnauthorized: true,
      ...(env.DATABASE_SSL_CA ? { ca: env.DATABASE_SSL_CA.replace(/\\n/g, '\n') } : {}),
    },
  }
}

async function openPostgres(env) {
  const pool = new Pool(connectionOptions(env))
  pool.on('error', () => console.error('An idle database connection closed; the pool will reconnect.'))
  const context = new AsyncLocalStorage()
  async function query(sql, values) {
    const state = context.getStore()
    const execute = () => (state?.client || pool).query(postgresSql(sql), values)
    // Promise.all reads share one connection inside a transaction. pg requires
    // calls on that connection to be serialized rather than implicitly queued.
    const pending = state ? state.pending.then(execute) : execute()
    if (state) state.pending = pending.catch(() => {})
    const result = await pending
    // PostgreSQL COUNT/SUM can return bigint strings. Keep the API's numeric
    // counters consistent with SQLite without globally changing pg type parsers.
    for (const row of result.rows) {
      for (const key of ['n','views','clicks']) if (typeof row[key] === 'string') row[key] = Number(row[key])
    }
    return result
  }
  const db = {
    engine: 'postgres',
    prepare(sql) {
      return {
        async get(...values) { return (await query(sql, values)).rows[0] },
        async all(...values) { return (await query(sql, values)).rows },
        async run(...values) { return { changes: (await query(sql, values)).rowCount } },
      }
    },
    async transaction(work) {
      if (context.getStore()?.client) throw new Error('Nested transactions are not supported.')
      const client = await pool.connect()
      const state = { client, pending: Promise.resolve() }
      try {
        await client.query('BEGIN')
        const result = await context.run(state, work)
        await state.pending
        await client.query('COMMIT')
        return result
      } catch (error) {
        await state.pending
        await client.query('ROLLBACK')
        throw error
      } finally { client.release() }
    },
    atomic(work) {
      return context.getStore()?.client ? Promise.resolve().then(work) : db.transaction(work)
    },
    close() { return pool.end() },
  }
  try {
    // Serialize idempotent startup DDL across deploys sharing this database.
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('SELECT pg_advisory_xact_lock(78194620)')
      await client.query(readFileSync(join(__dirname, 'postgres-schema.sql'), 'utf8'))
      await client.query(relationalSchema('postgres'))
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally { client.release() }
    await seedDatabase(db)
    await db.transaction(async () => {
      await db.prepare('SELECT pg_advisory_xact_lock(78194620)').run()
      await backfillRelationalDocuments(db)
    })
    return db
  } catch (error) {
    await pool.end()
    throw error
  }
}

module.exports = { openPostgres, postgresSql, connectionOptions }
