const { AsyncLocalStorage } = require('node:async_hooks')

// Keep async transactions isolated on SQLite's single connection, including
// queries from other requests that arrive while a transaction is awaiting work.
function sqliteAdapter(db) {
  const context = new AsyncLocalStorage()
  let pending = Promise.resolve()
  function queue(work) {
    const result = pending.then(work)
    pending = result.catch(() => {})
    return result
  }
  function execute(work) {
    return context.getStore()?.active ? Promise.resolve().then(work) : queue(work)
  }
  const adapter = {
    engine: 'sqlite',
    prepare(sql) {
      const statement = db.prepare(sql)
      return Object.fromEntries(['get', 'all', 'run'].map((method) => [method,
        (...values) => execute(() => statement[method](...values)),
      ]))
    },
    transaction(work) {
      if (context.getStore()?.active) throw new Error('Nested transactions are not supported.')
      return queue(() => context.run({ active: true }, async () => {
        db.exec('BEGIN IMMEDIATE')
        try {
          const result = await work()
          db.exec('COMMIT')
          return result
        } catch (error) {
          db.exec('ROLLBACK')
          throw error
        } finally {
          context.getStore().active = false
        }
      }))
    },
    // Model writes can join an existing controller transaction, or create one
    // when invoked independently. Public transaction() still rejects nesting.
    atomic(work) {
      return context.getStore()?.active ? Promise.resolve().then(work) : adapter.transaction(work)
    },
  }
  return adapter
}

module.exports = { sqliteAdapter }
