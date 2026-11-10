const { test } = require('node:test')
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
const { Pool } = require('pg')
const { openDatabase } = require('./database')
const { sqliteAdapter } = require('./databaseAdapter')
const { openPostgres, postgresSql, connectionOptions } = require('./postgres')
const { openConfiguredDatabase } = require('./configuredDatabase')
const { migrate } = require('./migrateSqlite')

test('PostgreSQL parameters and private-schema qualification leave quoted SQL alone', () => {
  assert.equal(postgresSql("SELECT '?' AS literal, \"users\" FROM users WHERE email = ?"),
    "SELECT '?' AS literal, \"users\" FROM linkfolio.users WHERE email = $1")
  assert.equal(postgresSql('UPDATE plans SET enabled = ? WHERE id = ?'),
    'UPDATE linkfolio.plans SET enabled = $1 WHERE id = $2')
})

test('remote PostgreSQL uses verified TLS and production cannot silently use a temporary database', async () => {
  const options = connectionOptions({ DATABASE_URL:'postgresql://test:dummy@example.com:5432/postgres?sslmode=require',DATABASE_SSL_CA:'certificate\\ncontent' })
  assert.equal(options.ssl.rejectUnauthorized, true)
  assert.equal(options.ssl.ca, 'certificate\ncontent')
  assert.equal(new URL(options.connectionString).searchParams.has('sslmode'), false)
  assert.throws(() => connectionOptions({ DATABASE_URL:'postgresql://test:dummy@example.com:5432/postgres',DATABASE_SSL:'false' }), /TLS/)
  await assert.rejects(openConfiguredDatabase({NODE_ENV:'production'}), /ephemeral production database/)
})

test('SQLite transactions roll back and concurrent requests cannot join another transaction', async (t) => {
  const raw = openDatabase(':memory:')
  t.after(() => raw.close())
  const db = sqliteAdapter(raw)
  let started
  const ready = new Promise((resolve) => { started = resolve })
  let release
  const resume = new Promise((resolve) => { release = resolve })
  const transaction = db.transaction(async () => {
    await db.prepare("INSERT INTO users (id, full_name, email, password_hash, created_at) VALUES ('rollback', 'Test', 'test@example.com', 'hash', 'now')").run()
    started()
    await resume
    throw new Error('rollback fixture')
  })
  await ready
  const outsideQuery = db.prepare('SELECT COUNT(*) AS n FROM users').get()
  release()
  await assert.rejects(transaction, /rollback fixture/)
  assert.equal((await outsideQuery).n, 0)
})

async function postgresFixture(t) {
  const name = `linkfolio_test_${randomUUID().replaceAll('-', '')}`
  const admin = new Pool(connectionOptions({ DATABASE_URL:process.env.TEST_DATABASE_URL }))
  await admin.query(`CREATE DATABASE "${name}"`)
  const url = new URL(process.env.TEST_DATABASE_URL)
  url.pathname = `/${name}`
  let db = await openPostgres({DATABASE_URL:url.toString()})
  t.after(async () => {
    await db.close()
    await admin.query(`DROP DATABASE "${name}"`)
    await admin.end()
  })
  return {
    get db() { return db },
    async restart() {
      await db.close()
      db = await openPostgres({DATABASE_URL:url.toString()})
    },
  }
}

test('PostgreSQL imports SQLite data, rolls back invalid imports, and preserves data after reconnecting', {skip:!process.env.TEST_DATABASE_URL}, async (t) => {
  const fixture = await postgresFixture(t)
  const source = openDatabase(':memory:')
  t.after(() => source.close())
  source.prepare("INSERT INTO users (id, full_name, email, password_hash, plan, created_at) VALUES ('source', 'Source Owner', 'source@example.com', 'preserved-hash', 'premium', 'now')").run()
  // An invalid foreign key fails after the first imported account. The whole
  // import must roll back, allowing a clean retry without manual cleanup.
  source.exec('PRAGMA foreign_keys = OFF')
  source.prepare("INSERT INTO documents VALUES ('doc', 'missing-user', 'portfolio', ?, 'now')").run(JSON.stringify({personal:{fullName:'Source Owner'},portfolio:{images:{portrait:'data:image/png;base64,image-data'}}}))
  await assert.rejects(migrate(source,fixture.db), (error) => error.code === '23503')
  assert.equal((await fixture.db.prepare('SELECT COUNT(*) AS n FROM users').get()).n, 0)
  source.prepare("UPDATE documents SET user_id = 'source'").run()
  source.prepare("INSERT INTO publications VALUES ('doc', 'source-owner-123456', 'public', 'now')").run()
  const totals = await migrate(source,fixture.db)
  assert.equal(totals.users, 1)
  assert.equal(totals.documents, 1)
  await assert.rejects(migrate(source,fixture.db), /already has accounts/)
  await fixture.restart()
  const user = await fixture.db.prepare("SELECT * FROM users WHERE id = 'source'").get()
  assert.equal(user.password_hash, 'preserved-hash')
  assert.equal(user.plan, 'premium')
  const doc = await fixture.db.prepare("SELECT * FROM documents WHERE id = 'doc'").get()
  assert.deepEqual(JSON.parse(doc.data), JSON.parse(source.prepare("SELECT data FROM documents WHERE id = 'doc'").get().data))
  assert.equal((await fixture.db.prepare("SELECT slug FROM publications WHERE document_id = 'doc'").get()).slug, 'source-owner-123456')
})
