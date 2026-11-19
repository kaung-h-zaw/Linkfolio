import process from 'node:process'
import { createApp } from '../../backend/app.js'
import { serveClient } from '../../backend/web.js'

const app = createApp({ production: process.argv[2] === 'production', env: {} })
serveClient(app)
const server = app.listen(0, '127.0.0.1', () => {
  const baseURL = `http://localhost:${server.address().port}`
  app.locals.config.origin = baseURL
  process.send({ baseURL })
})
process.once('SIGTERM', () => server.close(() => {
  app.locals.db.close()
  process.exit(0)
}))
