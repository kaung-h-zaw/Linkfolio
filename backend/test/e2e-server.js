const { createApp } = require('../app')

// Playwright's disposable API server always uses in-memory SQLite and demo
// billing. It intentionally does not load .env or any external credentials.
const app = createApp({
  databasePath: ':memory:',
  origin: 'http://127.0.0.1:5174',
  env: { DEMO_PAYMENTS: 'true' },
})
const port = Number(process.env.LINKFOLIO_TEST_PORT || 38371)
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Playwright API ready on 127.0.0.1:${port} (in-memory SQLite)`)
})
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  server.close(async () => { await app.locals.db.close?.(); process.exit(0) })
})
