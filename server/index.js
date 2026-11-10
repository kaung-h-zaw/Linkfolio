require('dotenv').config({ path: require('node:path').resolve(__dirname, '.env') })
const { resolve } = require('node:path')
const { existsSync } = require('node:fs')
const { createApp } = require('./app')
const { serveClient } = require('./web')
const { openConfiguredDatabase } = require('./configuredDatabase')

async function start() {
  const port = Number(process.env.PORT || 3001)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535.')
  const production = process.env.NODE_ENV === 'production'
  const origin = process.env.APP_ORIGIN || (!production && 'http://localhost:5173')
  if (!origin) throw new Error('Set APP_ORIGIN to the HTTPS address of your Render app.')
  const url = new URL(origin)
  if (origin !== url.origin || (production && url.protocol !== 'https:')) {
    throw new Error('APP_ORIGIN must be an origin without a path or trailing slash, using HTTPS in production.')
  }
  const client = resolve(__dirname, '../client/dist')
  if (production && !existsSync(resolve(client, 'index.html'))) {
    throw new Error('Client build is missing. Run npm run build before starting production.')
  }
  const database = await openConfiguredDatabase()
  const app = createApp({ database, origin, production })
  serveClient(app, client)
  const server = app.listen(port, '0.0.0.0', () =>
    console.log(`Linkfolio listening on port ${port} (${database.engine || 'sqlite'} database)`))
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
    server.close(async () => {
      await database.close()
      process.exit(0)
    })
  })
}

start().catch((error) => {
  // Connection URLs and credentials must not appear in deployment logs.
  const message = error.message?.replace(/postgres(?:ql)?:\/\/\S+/gi, '[database URL]')
  console.error('Linkfolio could not start:', message)
  process.exitCode = 1
})
