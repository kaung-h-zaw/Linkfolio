const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createHmac, randomUUID } = require('node:crypto')
const { mkdtempSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const { createApp } = require('./app.js')
const { Pool } = require('pg')
const { openPostgres, connectionOptions } = require('./postgres')

const origin = 'http://localhost:5173'
const settings = {
  template: 'essential',
  color: '#137763',
  surface: '#f1f6f2',
  headline: '',
  introduction: '',
  availability: '',
  about: true,
  projects: true,
  experience: true,
  education: true,
  skills: true,
  contact: true,
}
const rich = (text) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
})
function draft(overrides = {}) {
  return {
    id: randomUUID(),
    kind: 'resume',
    name: 'Test Resume',
    templateId: 'essential',
    personal: {
      fullName: 'Test Owner',
      email: 'owner@example.com',
      phone: '',
      headline: '',
      summary: '',
      links: [{ id: 'website', label: 'Website', url: 'https://example.com' }],
    },
    summarySection: {
      heading: 'Summary',
      entries: [
        { id: 'visible', visible: true, content: rich('Public introduction') },
        { id: 'hidden', visible: false, content: rich('Private hidden text') },
      ],
    },
    ...overrides,
  }
}
async function fixture(t, options = {}) {
  let database
  let cleanup = async () => {}
  // Each PostgreSQL fixture gets a new disposable database. Never run destructive
  // tests inside a shared Supabase application database.
  if (process.env.TEST_DATABASE_URL && !options.databasePath) {
    const name = `linkfolio_test_${randomUUID().replaceAll('-', '')}`
    const admin = new Pool(connectionOptions({ DATABASE_URL:process.env.TEST_DATABASE_URL }))
    await admin.query(`CREATE DATABASE "${name}"`)
    const url = new URL(process.env.TEST_DATABASE_URL)
    url.pathname = `/${name}`
    database = await openPostgres({ DATABASE_URL:url.toString() })
    cleanup = async () => {
      await admin.query(`DROP DATABASE "${name}"`)
      await admin.end()
    }
  }
  const app = createApp({ origin, env: {}, ...options, ...(database ? {database} : {}) })
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const base = `http://127.0.0.1:${server.address().port}/api`
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await app.locals.db.close()
    await cleanup()
  })
  function client() {
    let cookie = ''
    return async (path, method = 'GET', body, extraHeaders = {}) => {
      const response = await fetch(base + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Linkfolio-Request': '1',
          Origin: origin,
          Cookie: cookie,
          ...extraHeaders,
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      })
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) cookie = setCookie.split(';')[0]
      return { status: response.status, data: await response.json(), cookieHeader: setCookie }
    }
  }
  async function register(
    call,
    address = `${randomUUID()}@example.com`,
    secret = 'correct password',
  ) {
    const result = await call('/auth/register', 'POST', {
      fullName: 'Test Owner',
      email: address,
      password: secret,
    })
    assert.equal(result.status, 201)
    return result.data.user
  }
  return { app, client, register }
}

test('registration, duplicate email, hashed passwords, exact password login and logout', async (t) => {
  const { app, client, register } = await fixture(t)
  const call = client()
  const user = await register(call, 'test@example.com', ' leading and trailing ')
  assert.notEqual(
    (await app.locals.db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id)).password_hash,
    ' leading and trailing ',
  )
  assert.equal((await call('/auth/me')).status, 200)
  assert.equal(
    (
      await call('/auth/register', 'POST', {
        fullName: 'Test',
        email: 'TEST@example.com',
        password: 'password',
      })
    ).status,
    409,
  )
  await call('/auth/logout', 'POST')
  assert.equal((await call('/documents')).status, 401)
  assert.equal(
    (await call('/auth/login', 'POST', { email: 'test@example.com', password: 'wrong' })).status,
    401,
  )
  const login = await call('/auth/login', 'POST', {
    email: 'test@example.com',
    password: ' leading and trailing ',
  })
  assert.equal(login.status, 200)
  assert.match(login.cookieHeader, /HttpOnly/)
  assert.match(login.cookieHeader, /SameSite=Lax/)
})
test('invalid registration and cross-origin mutations are rejected', async (t) => {
  const { client } = await fixture(t)
  const call = client()
  assert.equal(
    (await call('/auth/register', 'POST', { fullName: '', email: 'bad', password: 'short' }))
      .status,
    400,
  )
  assert.equal(
    (await call('/auth/register', 'POST', {}, { Origin: 'https://evil.example' })).status,
    403,
  )
  assert.equal((await call('/auth/logout', 'POST', {}, { 'X-Linkfolio-Request': '' })).status, 403)
})
test('concurrent saves respect limits and a reset link can be consumed only once', async (t) => {
  const { client, register } = await fixture(t)
  const owner = client()
  const user = await register(owner)
  const first = draft(), second = draft()
  const saves = await Promise.all([
    owner(`/documents/${first.id}`, 'PUT', first),
    owner(`/documents/${second.id}`, 'PUT', second),
  ])
  assert.deepEqual(saves.map((result) => result.status).sort(), [200,403])
  assert.equal((await owner('/documents')).data.documents.length, 1)
  const reset = await owner('/auth/forgot-password','POST',{email:user.email})
  const token = new URL(reset.data.demoResetUrl).searchParams.get('token')
  const submissions = await Promise.all([
    owner('/auth/reset-password','POST',{token,password:'new password one'}),
    owner('/auth/reset-password','POST',{token,password:'new password two'}),
  ])
  assert.deepEqual(submissions.map((result) => result.status).sort(), [200,400])
})
test('documents are isolated between users and free limits are enforced', async (t) => {
  const { client, register } = await fixture(t)
  const alice = client(),
    bob = client()
  await register(alice)
  await register(bob)
  const doc = draft()
  assert.equal((await alice(`/documents/${doc.id}`, 'PUT', doc)).status, 200)
  assert.equal((await bob('/documents')).data.documents.length, 0)
  assert.equal((await bob(`/documents/${doc.id}`, 'PUT', doc)).status, 404)
  assert.equal((await bob(`/documents/${doc.id}`, 'DELETE')).status, 404)
  const second = draft()
  assert.equal((await alice(`/documents/${second.id}`, 'PUT', second)).status, 403)
  assert.equal(
    (await alice(`/documents/${doc.id}`, 'PUT', { ...doc, templateId: 'studio' })).status,
    403,
  )
  assert.equal(
    (await alice(`/documents/${doc.id}`, 'PUT', { ...doc, portfolio: settings })).status,
    200,
  )
  const standalone = draft({ kind: 'portfolio', portfolio: settings })
  assert.equal((await alice(`/documents/${standalone.id}`, 'PUT', standalone)).status, 403)
})
test('private portfolios stay inaccessible and public projection removes hidden content', async (t) => {
  const { client, register } = await fixture(t)
  const owner = client(),
    visitor = client()
  await register(owner)
  const doc = draft({ portfolio: { ...settings, contact: false } })
  await owner(`/documents/${doc.id}`, 'PUT', doc)
  await owner(`/documents/${doc.id}/publication`, 'PUT', {
    slug: 'test-owner',
    visibility: 'private',
  })
  assert.equal((await visitor('/public/portfolios/test-owner')).status, 404)
  await owner(`/documents/${doc.id}/publication`, 'PUT', {
    slug: 'test-owner',
    visibility: 'public',
  })
  const result = await visitor('/public/portfolios/test-owner')
  assert.equal(result.status, 200)
  assert.equal(result.data.profile.summarySection.entries.length, 1)
  assert.equal(result.data.profile.personal.email, undefined)
  assert.equal(JSON.stringify(result.data).includes('Private hidden text'), false)
  assert.equal(
    (
      await visitor('/public/portfolios/test-owner/messages', 'POST', {
        name: 'Visitor',
        email: 'visitor@example.com',
        message: 'Hello',
      })
    ).status,
    403,
  )
  await owner(`/documents/${doc.id}/publication`, 'PUT', {
    slug: 'test-owner',
    visibility: 'private',
  })
  assert.equal((await visitor('/public/portfolios/test-owner')).status, 404)
})
test('custom URLs validate and collisions cannot overwrite another portfolio', async (t) => {
  const { client, register } = await fixture(t)
  const one = client(),
    two = client()
  await register(one)
  await register(two)
  const a = draft({ portfolio: settings }),
    b = draft({ portfolio: settings })
  await one(`/documents/${a.id}`, 'PUT', a)
  await two(`/documents/${b.id}`, 'PUT', b)
  assert.equal(
    (await one(`/documents/${a.id}/publication`, 'PUT', { slug: 'bad url', visibility: 'public' }))
      .status,
    400,
  )
  assert.equal(
    (await one(`/documents/${a.id}/publication`, 'PUT', { slug: 'same-url', visibility: 'public' }))
      .status,
    200,
  )
  assert.equal(
    (await two(`/documents/${b.id}/publication`, 'PUT', { slug: 'same-url', visibility: 'public' }))
      .status,
    409,
  )
})
test('portfolio addresses are assigned privately, stay stable, and allow custom names without numbers', async (t) => {
  const { client, register } = await fixture(t)
  const owner = client()
  await register(owner)
  const resume = draft()
  const firstSave = await owner(`/documents/${resume.id}`, 'PUT', resume)
  assert.equal(firstSave.data.document.publication, null)
  resume.portfolio = settings
  const created = await owner(`/documents/${resume.id}`, 'PUT', resume)
  const assigned = created.data.document.publication
  assert.match(assigned.slug, /^test-owner-\d{6}$/)
  assert.equal(assigned.visibility, 'private')
  assert.equal((await owner(`/public/portfolios/${assigned.slug}`)).status, 404)
  const updated = await owner(`/documents/${resume.id}`, 'PUT', resume)
  assert.deepEqual(updated.data.document.publication, assigned)
  const published = await owner(`/documents/${resume.id}/publication`, 'PUT', { slug:'',visibility:'public' })
  assert.equal(published.data.publication.slug, assigned.slug)
  const custom = await owner(`/documents/${resume.id}/publication`, 'PUT', { slug:'my-custom-name',visibility:'public' })
  assert.equal(custom.status, 200)
  assert.equal(custom.data.publication.slug, 'my-custom-name')
  const secondOwner = client()
  await register(secondOwner)
  const standalone = draft({ kind:'portfolio',portfolio:settings })
  const another = await secondOwner(`/documents/${standalone.id}`, 'PUT', standalone)
  assert.match(another.data.document.publication.slug, /^test-owner-\d{6}$/)
  assert.notEqual(another.data.document.publication.slug, assigned.slug)
})
test('public contact validation, owner inbox, read status and analytics', async (t) => {
  const { client, register } = await fixture(t)
  const owner = client(),
    outsider = client(),
    visitor = client()
  await register(owner)
  await register(outsider)
  const doc = draft({ portfolio: settings })
  await owner(`/documents/${doc.id}`, 'PUT', doc)
  await owner(`/documents/${doc.id}/publication`, 'PUT', {
    slug: 'contact-owner',
    visibility: 'public',
  })
  await visitor('/public/portfolios/contact-owner')
  assert.equal(
    (
      await visitor('/public/portfolios/contact-owner/events', 'POST', {
        type: 'click',
        href: 'https://example.com',
      })
    ).status,
    200,
  )
  assert.equal(
    (
      await visitor('/public/portfolios/contact-owner/events', 'POST', {
        type: 'click',
        href: 'https://unknown.example',
      })
    ).status,
    400,
  )
  assert.equal(
    (
      await visitor('/public/portfolios/contact-owner/messages', 'POST', {
        name: '',
        email: 'bad',
        message: '',
      })
    ).status,
    400,
  )
  assert.equal(
    (
      await visitor('/public/portfolios/contact-owner/messages', 'POST', {
        name: 'Visitor',
        email: 'visitor@example.com',
        message: 'Hello owner!',
      })
    ).status,
    201,
  )
  const messages = (await owner('/messages')).data.messages
  assert.equal(messages.length, 1)
  assert.equal(messages[0].status, 'unread')
  assert.equal(
    (await outsider(`/messages/${messages[0].id}`, 'PATCH', { status: 'read' })).status,
    404,
  )
  await owner(`/messages/${messages[0].id}`, 'PATCH', { status: 'read' })
  assert.equal((await owner('/messages')).data.messages[0].status, 'read')
  assert.equal((await outsider('/messages')).data.messages.length, 0)
  const stats = (await owner('/analytics')).data.analytics[0]
  assert.equal(stats.views, 1)
  assert.equal(stats.clicks, 1)
  assert.ok(stats.lastViewedAt)
})
test('password reset is single-use, invalidates sessions, and never returns tokens in production', async (t) => {
  const { client, register } = await fixture(t)
  const call = client(),
    otherSession = client()
  await register(call, 'reset@example.com')
  await otherSession('/auth/login', 'POST', {
    email: 'reset@example.com',
    password: 'correct password',
  })
  const result = await call('/auth/forgot-password', 'POST', { email: 'reset@example.com' })
  const token = new URL(result.data.demoResetUrl).searchParams.get('token')
  assert.equal(
    (await call('/auth/reset-password', 'POST', { token, password: 'new password' })).status,
    200,
  )
  assert.equal((await otherSession('/auth/me')).status, 401)
  assert.equal(
    (await call('/auth/reset-password', 'POST', { token, password: 'new password' })).status,
    400,
  )
  assert.equal(
    (await call('/auth/login', 'POST', { email: 'reset@example.com', password: 'new password' }))
      .status,
    200,
  )
  const production = await fixture(t, { production: true })
  const prod = production.client()
  assert.equal(
    (await prod('/auth/forgot-password', 'POST', { email: 'reset@example.com' })).status,
    503,
  )
})
test('admin-only management, template gating and disabled user sessions', async (t) => {
  const { app, client, register } = await fixture(t)
  const admin = client(),
    normal = client()
  const administrator = await register(admin),
    user = await register(normal)
  assert.equal((await normal('/admin')).status, 403)
  await app.locals.db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(administrator.id)
  assert.equal((await admin('/admin')).status, 200)
  await admin('/admin/templates/resume/essential', 'PATCH', { enabled: false, premium: false })
  const doc = draft()
  assert.equal((await normal(`/documents/${doc.id}`, 'PUT', doc)).status, 400)
  await admin('/admin/templates/resume/essential', 'PATCH', { enabled: true, premium: false })
  assert.equal((await normal(`/documents/${doc.id}`, 'PUT', doc)).status, 200)
  assert.equal(
    (await admin(`/admin/users/${administrator.id}`, 'PATCH', { disabled: true })).status,
    400,
  )
  await admin(`/admin/users/${user.id}`, 'PATCH', { disabled: true })
  assert.equal((await normal('/documents')).status, 401)
  assert.equal(
    (await normal('/auth/login', 'POST', { email: user.email, password: 'correct password' }))
      .status,
    401,
  )
})
test('demo failed payments do not upgrade; success unlocks limits and premium templates', async (t) => {
  const { client, register } = await fixture(t)
  const call = client(),
    outsider = client()
  await register(call)
  await register(outsider)
  const failed = (await call('/billing/checkout', 'POST')).data.id
  assert.equal(
    (await outsider(`/billing/demo/${failed}`, 'POST', { outcome: 'success' })).status,
    409,
  )
  assert.equal(
    (await call(`/billing/demo/${failed}`, 'POST', { outcome: 'failed' })).data.user.plan,
    'free',
  )
  const success = (await call('/billing/checkout', 'POST')).data.id
  assert.equal(
    (await call(`/billing/demo/${success}`, 'POST', { outcome: 'success' })).data.user.plan,
    'premium',
  )
  assert.equal((await call(`/billing/demo/${success}`, 'POST', { outcome: 'success' })).status, 409)
  for (let i = 0; i < 2; i++) {
    const doc = draft({ templateId: 'studio' })
    assert.equal((await call(`/documents/${doc.id}`, 'PUT', doc)).status, 200)
  }
  const prod = await fixture(t, { production: true })
  const prodClient = prod.client()
  await prod.register(prodClient)
  assert.equal((await prodClient('/billing/checkout', 'POST')).status, 503)
  assert.equal(
    (await prodClient('/billing/demo/anything', 'POST', { outcome: 'success' })).status,
    404,
  )
})
test('removing a linked portfolio preserves the resume and deletion cascades', async (t) => {
  const { app, client, register } = await fixture(t)
  const call = client(),
    visitor = client()
  await register(call)
  const doc = draft({ portfolio: settings })
  await call(`/documents/${doc.id}`, 'PUT', doc)
  await call(`/documents/${doc.id}/publication`, 'PUT', {
    slug: 'deleted-owner',
    visibility: 'public',
  })
  await visitor('/public/portfolios/deleted-owner')
  await visitor('/public/portfolios/deleted-owner/messages', 'POST', {
    name: 'Visitor',
    email: 'visitor@example.com',
    message: 'Hello',
  })
  const removed = await call(`/documents/${doc.id}/portfolio`, 'DELETE')
  assert.equal(removed.data.document.portfolio, undefined)
  assert.equal((await visitor('/public/portfolios/deleted-owner')).status, 404)
  assert.equal((await call('/messages')).data.messages.length, 0)
  assert.equal((await call('/documents')).data.documents.length, 1)
  await call(`/documents/${doc.id}`, 'DELETE')
  assert.equal((await app.locals.db.prepare('SELECT COUNT(*) AS n FROM documents').get()).n, 0)
})
test('invalid nested editor data cannot corrupt saved documents', async (t) => {
  const { client, register } = await fixture(t)
  const call = client()
  await register(call)
  const doc = draft({
    summarySection: {
      heading: 'Summary',
      entries: [{ id: 'bad', visible: true, content: { type: 'doc', content: 'not-an-array' } }],
    },
  })
  assert.equal((await call(`/documents/${doc.id}`, 'PUT', doc)).status, 400)
  assert.equal((await call('/documents')).data.documents.length, 0)
})
test('SQLite saves survive reopening the database', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'linkfolio-test-'))
  const path = join(directory, 'data.sqlite')
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const first = await fixture(t, { databasePath: path })
  const call = first.client()
  await first.register(call, 'persist@example.com')
  const doc = draft()
  await call(`/documents/${doc.id}`, 'PUT', doc)
  const second = await fixture(t, { databasePath: path })
  const next = second.client()
  await next('/auth/login', 'POST', { email: 'persist@example.com', password: 'correct password' })
  assert.equal((await next('/documents')).data.documents[0].id, doc.id)
})

test('Stripe fulfillment requires a valid signature and a paid, owned session', async (t) => {
  const secret = 'whsec_test_fixture'
  const { app, client, register } = await fixture(t, {
    env: {
      STRIPE_SECRET_KEY: 'sk_test_fixture',
      STRIPE_WEBHOOK_SECRET: secret,
      STRIPE_PRICE_ID: 'price_test_fixture',
    },
  })
  const owner = client(),
    outsider = client()
  const user = await register(owner)
  await register(outsider)
  await app.locals.db
    .prepare(
      "INSERT INTO payments (id, user_id, provider, created_at) VALUES ('cs_test_fixture', ?, 'stripe', ?)",
    )
    .run(user.id, new Date().toISOString())
  const event = (paid) => ({
    id: 'evt_fixture',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_fixture',
        client_reference_id: user.id,
        payment_status: paid ? 'paid' : 'unpaid',
      },
    },
  })
  function signature(body) {
    const time = Math.floor(Date.now() / 1000)
    const hash = createHmac('sha256', secret)
      .update(`${time}.${JSON.stringify(body)}`)
      .digest('hex')
    return `t=${time},v1=${hash}`
  }
  assert.equal(
    (await outsider('/billing/verify', 'POST', { sessionId: 'cs_test_fixture' })).status,
    404,
  )
  assert.equal(
    (await owner('/billing/webhook', 'POST', event(true), { 'Stripe-Signature': 'invalid' }))
      .status,
    400,
  )
  const unpaid = event(false)
  assert.equal(
    (await owner('/billing/webhook', 'POST', unpaid, { 'Stripe-Signature': signature(unpaid) }))
      .status,
    200,
  )
  assert.equal((await owner('/auth/me')).data.user.plan, 'free')
  const paid = event(true)
  for (let i = 0; i < 2; i++)
    assert.equal(
      (await owner('/billing/webhook', 'POST', paid, { 'Stripe-Signature': signature(paid) }))
        .status,
      200,
    )
  assert.equal((await owner('/auth/me')).data.user.plan, 'premium')
  assert.equal(
    (await app.locals.db.prepare("SELECT COUNT(*) AS n FROM payments WHERE status = 'paid'").get()).n,
    1,
  )
  assert.equal((await owner('/billing/downgrade', 'POST')).data.user.plan, 'free')
  assert.equal((await owner('/billing/webhook', 'POST', paid, { 'Stripe-Signature': signature(paid) })).status, 200)
  app.locals.config.stripe.checkout.sessions.retrieve = async () => event(true).data.object
  assert.equal((await owner('/billing/verify', 'POST', { sessionId: 'cs_test_fixture' })).data.user.plan, 'free')
  assert.equal((await owner('/auth/me')).data.user.plan, 'free')
})

test('administrators can change plan limits and disable new upgrades', async (t) => {
  const { app, client, register } = await fixture(t)
  const admin = client(),
    owner = client()
  const administrator = await register(admin)
  await register(owner)
  await app.locals.db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(administrator.id)
  assert.equal(
    (
      await admin('/admin/plans/free', 'PATCH', {
        resumeLimit: 0,
        portfolioLimit: 1,
        enabled: true,
      })
    ).status,
    400,
  )
  await admin('/admin/plans/free', 'PATCH', { resumeLimit: 2, portfolioLimit: 2, enabled: true })
  for (let i = 0; i < 2; i++) {
    const doc = draft()
    assert.equal((await owner(`/documents/${doc.id}`, 'PUT', doc)).status, 200)
  }
  await admin('/admin/plans/premium', 'PATCH', {
    resumeLimit: 20,
    portfolioLimit: 20,
    enabled: false,
  })
  assert.equal((await owner('/billing/checkout', 'POST')).status, 503)
})

test('resume imports have no plan quota and cannot convert an existing manual resume', async (t) => {
  const { client, register } = await fixture(t)
  const call = client()
  await register(call, 'unlimited-imports@example.com')
  for (let i = 0; i < 3; i++) {
    const imported = draft({ origin: 'import' })
    assert.equal((await call(`/documents/${imported.id}`, 'PUT', imported)).status, 200)
  }
  const manual = draft()
  assert.equal((await call(`/documents/${manual.id}`, 'PUT', manual)).status, 200)
  const converted = await call(`/documents/${manual.id}`, 'PUT', { ...manual, origin: 'import' })
  assert.equal(converted.status, 200)
  assert.equal(converted.data.document.origin, undefined)
  const secondManual = draft()
  assert.equal((await call(`/documents/${secondManual.id}`, 'PUT', secondManual)).status, 403)
  assert.equal((await call('/resume-import/capabilities')).data.ai, false)
  assert.equal((await call('/resume-import/parse', 'POST', { text: 'Example resume', useAI: true })).status, 503)
})


test('removing Premium is authenticated, affects only the owner and preserves documents', async (t) => {
  const { app, client, register } = await fixture(t)
  const owner = client(), other = client(), guest = client()
  const ownerUser = await register(owner)
  const otherUser = await register(other)
  await app.locals.models.User.upgrade(ownerUser.id)
  await app.locals.models.User.upgrade(otherUser.id)
  const document = draft()
  assert.equal((await owner(`/documents/${document.id}`, 'PUT', document)).status, 200)
  assert.equal((await guest('/billing/downgrade', 'POST')).status, 401)
  const result = await owner('/billing/downgrade', 'POST', { userId: otherUser.id })
  assert.equal(result.status, 200)
  assert.equal(result.data.user.plan, 'free')
  assert.equal((await other('/auth/me')).data.user.plan, 'premium')
  assert.equal((await owner('/documents')).data.documents.some((saved) => saved.id === document.id), true)
  assert.equal((await owner('/billing/downgrade', 'POST')).data.user.plan, 'free')
})
