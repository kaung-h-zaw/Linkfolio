const { test } = require('node:test')
const assert = require('node:assert/strict')
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const express = require('express')
const { createApp } = require('./app')
const { serveClient } = require('./web')
const errorMiddleware = require('./middleware/errorMiddleware')

async function listen(t, app) {
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    app.locals.db?.close()
  })
  return `http://127.0.0.1:${server.address().port}`
}

test('production headers protect HTML, SPA routes, API errors and webhook responses', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'linkfolio-production-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  writeFileSync(join(directory, 'index.html'), '<!doctype html><title>Linkfolio</title>')
  const app = createApp({ production: true, env: {} })
  serveClient(app, directory)
  const base = await listen(t, app)
  for (const path of ['/', '/p/public-portfolio', '/api/missing', '/api/health']) {
    const response = await fetch(base + path)
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN')
    assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin')
    assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'self'/)
    assert.match(response.headers.get('content-security-policy'), /worker-src 'self' blob:/)
    assert.match(response.headers.get('strict-transport-security'), /max-age=31536000/)
    assert.equal(response.headers.get('x-powered-by'), null)
  }
  const webhook = await fetch(base + '/api/billing/webhook', { method: 'POST' })
  assert.equal(webhook.status, 503)
  assert.ok(webhook.headers.get('content-security-policy'))
})

test('missing production view build is rejected; development can run the API alone', () => {
  const production = createApp({ production: true, env: {} })
  const development = createApp({ env: {} })
  try {
    assert.throws(() => serveClient(production, join(tmpdir(), 'linkfolio-no-build', 'missing')), /Client build is missing/)
    assert.doesNotThrow(() => serveClient(development, join(tmpdir(), 'linkfolio-no-build', 'missing')))
  } finally {
    production.locals.db.close()
    development.locals.db.close()
  }
})

test('AI import limits are per account, preserve authentication and include Retry-After', async (t) => {
  const app = createApp({ env: {} })
  const base = await listen(t, app)
  const headers = { 'Content-Type': 'application/json', 'X-Linkfolio-Request': '1' }
  async function request(path, body, cookie) {
    return fetch(base + '/api' + path, {
      method: 'POST', headers: { ...headers, ...(cookie ? { Cookie: cookie } : {}) },
      body: JSON.stringify(body),
    })
  }
  const body = { text: 'Sample resume text', useAI: true }
  assert.equal((await request('/resume-import/parse', body)).status, 401)
  async function register(email) {
    const response = await request('/auth/register', { email, fullName: 'Owner', password: 'correct password' })
    assert.equal(response.status, 201)
    return response.headers.get('set-cookie').split(';')[0]
  }
  const first = await register('first@example.com')
  const second = await register('second@example.com')
  for (let index = 0; index < 10; index++) {
    assert.equal((await request('/resume-import/parse', body, first)).status, 503)
  }
  const limited = await request('/resume-import/parse', body, first)
  assert.equal(limited.status, 429)
  assert.ok(Number(limited.headers.get('retry-after')) > 0)
  assert.equal((await request('/resume-import/parse', body, second)).status, 503)
})

test('unexpected errors expose neither provider secrets to clients nor sensitive messages to logs', async (t) => {
  const logged = []
  t.mock.method(console, 'error', (...args) => logged.push(args))
  const app = express()
  app.get('/', () => { throw new Error('provider credential: confidential-value') })
  app.use(errorMiddleware)
  const base = await listen(t, app)
  const response = await fetch(base)
  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { error: 'Something went wrong. Please try again.' })
  assert.equal(logged.length, 1)
  assert.equal(JSON.stringify(logged).includes('confidential-value'), false)
})
