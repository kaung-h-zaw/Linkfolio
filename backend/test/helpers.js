const { createApp } = require('../app')
const { once } = require('node:events')
const { defaultPortfolio } = require('../../frontend/src/lib/portfolio.js')

async function fixture(options = {}) {
  const app = createApp({
    databasePath: options.databasePath || ':memory:',
    origin: 'http://localhost:5173',
    env: { DEMO_PAYMENTS: 'true', ...options.env },
    production: options.production || false,
  })
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${server.address().port}`
  async function request(path, { method = 'GET', body, cookie, headers = {} } = {}) {
    const response = await fetch(`${base}/api${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(method === 'GET' ? {} : { 'X-Linkfolio-Request': '1', Origin: 'http://localhost:5173' }),
        ...(cookie ? { Cookie: cookie } : {}),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    const data = await response.json().catch(() => null)
    return { response, data, cookie: response.headers.get('set-cookie') }
  }
  async function register(email = `user-${crypto.randomUUID()}@example.com`, name = 'Test User') {
    const result = await request('/auth/register', {
      method: 'POST', body: { fullName: name, email, password: 'TestPassword123!' },
    })
    return { ...result, setCookie: result.cookie, cookie: result.cookie?.split(';')[0], email }
  }
  async function admin() {
    const result = await register(`admin-${crypto.randomUUID()}@example.com`, 'Test Admin')
    await app.locals.db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(result.email)
    return result
  }
  async function close() {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    await app.locals.db.close?.()
  }
  return { app, request, register, admin, close }
}

function resume(id, overrides = {}) {
  const value = {
    id, kind: 'resume', name: 'Test Resume', templateId: 'flowcv-classic-serif',
    personal: { fullName: 'Test User', email: 'user@example.com', headline: 'Engineer' },
    summarySection: { heading: 'Summary', entries: [{ id: 'summary-1', content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Builds useful software.' }] }] }, visible: true }] },
    experienceSection: { heading: 'Experience', entries: [{ id: 'job-1', jobTitle: 'Engineer', company: 'Example Co', employerUrl: '', startDate: '', endDate: '', current: false, location: '', content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Built tools.' }] }] }, visible: true }] },
    ...overrides,
  }
  if (overrides.kind === 'portfolio' || overrides.portfolio)
    value.portfolio = { ...defaultPortfolio, template: 'miniport', ...(overrides.portfolio || {}) }
  return value
}

module.exports = { fixture, resume }
