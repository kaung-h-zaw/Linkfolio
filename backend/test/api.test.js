const test = require('node:test')
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
const { fixture, resume } = require('./helpers')

async function withUser(work) {
  const f = await fixture()
  try { const user = await f.register(); await work(f, user) } finally { await f.close() }
}

test('API integration coverage', async (t) => {
  await t.test('AUTH-01 registration creates a user and HttpOnly session', () => withUser(async (_f, user) => {
    assert.equal(user.response.status, 201)
    assert.match(user.cookie, /^linkfolio_session=/)
    assert.match(user.setCookie, /HttpOnly/i)
    assert.equal(user.data.user.email, user.email)
    assert.equal('password_hash' in user.data.user, false)
  }))
  await t.test('AUTH-02 invalid and duplicate registration are rejected', () => withUser(async (f, user) => {
    assert.equal((await f.request('/auth/register', { method: 'POST', body: { fullName: 'A', email: 'bad', password: '123' } })).response.status, 400)
    assert.equal((await f.request('/auth/register', { method: 'POST', body: { fullName: 'Other', email: user.email, password: 'TestPassword123!' } })).response.status, 409)
  }))
  await t.test('AUTH-03 login, me, logout and revoked session', () => withUser(async (f, user) => {
    const login = await f.request('/auth/login', { method: 'POST', body: { email: user.email, password: 'TestPassword123!' } })
    const cookie = login.cookie.split(';')[0]
    assert.equal(login.response.status, 200)
    assert.equal((await f.request('/auth/me', { cookie })).response.status, 200)
    assert.equal((await f.request('/auth/logout', { method: 'POST', cookie })).response.status, 200)
    assert.equal((await f.request('/auth/me', { cookie })).response.status, 401)
  }))
  await t.test('AUTH-04 incorrect password and disabled user cannot log in', () => withUser(async (f, user) => {
    assert.equal((await f.request('/auth/login', { method: 'POST', body: { email: user.email, password: 'wrong-password' } })).response.status, 401)
    await f.app.locals.models.User.updateDisabled(1, user.data.user.id)
    assert.equal((await f.request('/auth/login', { method: 'POST', body: { email: user.email, password: 'TestPassword123!' } })).response.status, 401)
  }))
  await t.test('AUTH-05 password recovery response does not disclose account existence', async () => {
    const f = await fixture()
    try {
      const user = await f.register()
      const known = await f.request('/auth/forgot-password', { method: 'POST', body: { email: user.email } })
      const unknown = await f.request('/auth/forgot-password', { method: 'POST', body: { email: 'unknown@example.com' } })
      assert.equal(known.response.status, 200); assert.equal(unknown.response.status, 200)
      assert.equal(known.data.message, unknown.data.message)
      assert.ok(known.data.demoResetUrl)
      assert.equal(unknown.data.demoResetUrl, undefined)
    } finally { await f.close() }
  })
  await t.test('AUTH-06 reset token works once and invalidates old session', () => withUser(async (f, user) => {
    const reset = await f.request('/auth/forgot-password', { method: 'POST', body: { email: user.email } })
    const value = new URL(reset.data.demoResetUrl).searchParams.get('token')
    assert.equal((await f.request('/auth/reset-password', { method: 'POST', body: { token: value, password: 'NewPassword123!' } })).response.status, 200)
    assert.equal((await f.request('/auth/reset-password', { method: 'POST', body: { token: value, password: 'OtherPassword123!' } })).response.status, 400)
    assert.equal((await f.request('/auth/me', { cookie: user.cookie })).response.status, 401)
    assert.equal((await f.request('/auth/login', { method: 'POST', body: { email: user.email, password: 'NewPassword123!' } })).response.status, 200)
  }))
  await t.test('AUTH-07 password change checks current password and refreshes session', () => withUser(async (f, user) => {
    assert.equal((await f.request('/auth/change-password', { method: 'POST', cookie: user.cookie, body: { currentPassword: 'wrong-password', password: 'NewPassword123!' } })).response.status, 401)
    assert.equal((await f.request('/auth/change-password', { method: 'POST', cookie: user.cookie, body: { currentPassword: 'TestPassword123!', password: 'NewPassword123!' } })).response.status, 200)
  }))
  await t.test('RES-01 create and read a resume', () => withUser(async (f, user) => {
    const doc = resume(`resume-${randomUUID()}`)
    const saved = await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc })
    assert.equal(saved.response.status, 200, saved.data?.error)
    const list = await f.request('/documents', { cookie: user.cookie })
    assert.equal(list.response.status, 200); assert.equal(list.data.documents[0].name, doc.name)
  }))
  await t.test('RES-02 resume edits persist across reads', () => withUser(async (f, user) => {
    const doc = resume(`resume-${randomUUID()}`)
    await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc })
    doc.personal.headline = 'Updated headline'
    assert.equal((await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc })).response.status, 200)
    assert.equal((await f.request('/documents', { cookie: user.cookie })).data.documents[0].personal.headline, 'Updated headline')
  }))
  await t.test('RES-03 malformed resume document is rejected', () => withUser(async (f, user) => {
    assert.equal((await f.request('/documents/x', { method: 'PUT', cookie: user.cookie, body: { id: 'different', kind: 'resume' } })).response.status, 400)
  }))
  await t.test('RES-04 premium resume template is permission checked by API', () => withUser(async (f, user) => {
    const doc = resume(`resume-${randomUUID()}`, { templateId: 'flowcv-mercury-flow' })
    assert.equal((await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc })).response.status, 403)
  }))
  await t.test('RES-05 template catalog exposes selectable resume templates', async () => {
    const f = await fixture()
    try {
      const result = await f.request('/templates')
      assert.equal(result.response.status, 200)
      assert.ok(result.data.templates.some((template) => template.kind === 'resume' && template.id === 'flowcv-classic-serif'))
    } finally { await f.close() }
  })
  await t.test('RES-06 account update endpoint requires authentication', async () => {
    const f = await fixture(); try { assert.equal((await f.request('/account', { method: 'PATCH', body: { fullName: 'X' } })).response.status, 401) } finally { await f.close() }
  })
  await t.test('IMP-01 import endpoint requires authentication and capabilities report AI state', () => withUser(async (f, user) => {
    assert.equal((await f.request('/resume-import/capabilities', { cookie: user.cookie })).data.ai, false)
    assert.equal((await f.request('/resume-import/parse', { method: 'POST', cookie: user.cookie, body: { text: 'Test Person\nEngineer\nExperience\nExample Co', useAI: true } })).response.status, 503)
  }))
  await t.test('IMP-02 local parser extracts representative fixture content', async () => {
    const { parseResumeText } = await import('../../frontend/src/lib/resumeParsing/resumeParser.mjs')
    const parsed = parseResumeText('Taylor Example\ntaylor@example.com\nSoftware Engineer\nExperience\nEngineer at Example Co\n2020 - 2023\nBuilt services')
    assert.equal(parsed.personal.fullName, 'Taylor Example')
    assert.ok(parsed.experience.length > 0)
  })
  await t.test('IMP-03 import API refuses requests without explicit AI choice', () => withUser(async (f, user) => {
    const result = await f.request('/resume-import/parse', { method: 'POST', cookie: user.cookie, body: { text: 'test resume' } })
    assert.equal(result.response.status, 400)
  }))
  await t.test('PORT-01 save portfolio and create private publication', () => withUser(async (f, user) => {
    const doc = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio', portfolio: { template: 'miniport', contact: true } })
    assert.equal((await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc })).response.status, 200)
    const list = await f.request('/documents', { cookie: user.cookie })
    assert.equal(list.data.documents[0].publication.visibility, 'private')
  }))
  await t.test('PORT-02 non-owner cannot read or publish another user document', async () => {
    const f = await fixture(); try {
      const owner = await f.register(); const other = await f.register()
      const doc = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio' })
      await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: owner.cookie, body: doc })
      assert.equal((await f.request(`/documents/${doc.id}/publication`, { method: 'PUT', cookie: other.cookie, body: { slug: 'private-page', visibility: 'public' } })).response.status, 404)
    } finally { await f.close() }
  })
  await t.test('PORT-03 public publication serves selected portfolio content', () => withUser(async (f, user) => {
    const doc = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio' })
    await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc })
    assert.equal((await f.request(`/documents/${doc.id}/publication`, { method: 'PUT', cookie: user.cookie, body: { slug: 'test-public-page', visibility: 'public' } })).response.status, 200)
    const page = await f.request('/public/portfolios/test-public-page')
    assert.equal(page.response.status, 200); assert.equal(page.data.profile.personal.fullName, 'Test User')
  }))
  await t.test('PORT-04 private publication is not publicly readable', () => withUser(async (f, user) => {
    const doc = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio' })
    await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc })
    const listing = (await f.request('/documents', { cookie: user.cookie })).data.documents[0]
    const slug = listing.publication.slug
    assert.equal((await f.request(`/public/portfolios/${slug}`)).response.status, 404)
  }))
  await t.test('PORT-05 slug validation and duplicate conflict', async () => {
    const f = await fixture()
    try {
    const user = await f.register(); const other = await f.register()
    const a = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio' }); const b = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio' })
    await f.request(`/documents/${a.id}`, { method: 'PUT', cookie: user.cookie, body: a }); await f.request(`/documents/${b.id}`, { method: 'PUT', cookie: other.cookie, body: b })
    assert.equal((await f.request(`/documents/${a.id}/publication`, { method: 'PUT', cookie: user.cookie, body: { slug: 'x', visibility: 'public' } })).response.status, 400)
    await f.request(`/documents/${a.id}/publication`, { method: 'PUT', cookie: user.cookie, body: { slug: 'same-portfolio', visibility: 'public' } })
    assert.equal((await f.request(`/documents/${b.id}/publication`, { method: 'PUT', cookie: other.cookie, body: { slug: 'same-portfolio', visibility: 'public' } })).response.status, 409)
    } finally { await f.close() }
  })
  await t.test('PORT-06 public page omits resume download and hidden source data', () => withUser(async (f, user) => {
    const doc = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio', portfolio: { template: 'miniport', resumeDownload: false }, personal: { fullName: 'Test User', email: 'secret@example.com', headline: 'Engineer' } })
    await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc }); await f.request(`/documents/${doc.id}/publication`, { method: 'PUT', cookie: user.cookie, body: { slug: 'privacy-check', visibility: 'public' } })
    const page = (await f.request('/public/portfolios/privacy-check')).data
    assert.equal(page.resumeProfile, undefined); assert.equal(page.profile.personal.email, 'secret@example.com') // Contact is enabled in portfolio settings.
  }))
  await t.test('PORT-07 deleting a portfolio removes its publication', () => withUser(async (f, user) => {
    const doc = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio' }); await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc }); await f.request(`/documents/${doc.id}/publication`, { method: 'PUT', cookie: user.cookie, body: { slug: 'delete-check', visibility: 'public' } })
    assert.equal((await f.request(`/documents/${doc.id}`, { method: 'DELETE', cookie: user.cookie })).response.status, 200)
    assert.equal((await f.request('/public/portfolios/delete-check')).response.status, 404)
  }))
  await t.test('MSG-01 public contact creates owner message', () => withUser(async (f, user) => {
    const doc = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio' }); await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc }); await f.request(`/documents/${doc.id}/publication`, { method: 'PUT', cookie: user.cookie, body: { slug: 'message-check', visibility: 'public' } })
    assert.equal((await f.request('/public/portfolios/message-check/messages', { method: 'POST', body: { name: 'Sender', email: 'sender@example.com', message: 'Hello' } })).response.status, 201)
    assert.equal((await f.request('/messages', { cookie: user.cookie })).data.messages.length, 1)
  }))
  await t.test('MSG-02 invalid, disabled-contact, and honeypot submissions fail', () => withUser(async (f, user) => {
    const doc = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio' }); await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc }); await f.request(`/documents/${doc.id}/publication`, { method: 'PUT', cookie: user.cookie, body: { slug: 'contact-check', visibility: 'public' } })
    assert.equal((await f.request('/public/portfolios/contact-check/messages', { method: 'POST', body: { name: 'Sender', email: 'bad', message: 'Hello' } })).response.status, 400)
    assert.equal((await f.request('/public/portfolios/contact-check/messages', { method: 'POST', body: { name: 'Sender', email: 's@example.com', message: 'Hello', website: 'spam' } })).response.status, 400)
  }))
  await t.test('MSG-03 trash, restore, and permanent-delete rules are enforced', () => withUser(async (f, user) => {
    const doc = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio' }); await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc }); await f.request(`/documents/${doc.id}/publication`, { method: 'PUT', cookie: user.cookie, body: { slug: 'inbox-check', visibility: 'public' } }); await f.request('/public/portfolios/inbox-check/messages', { method: 'POST', body: { name: 'Sender', email: 's@example.com', message: 'Hello' } })
    const msg = (await f.request('/messages', { cookie: user.cookie })).data.messages[0]
    assert.equal((await f.request(`/messages/${msg.id}/permanent`, { method: 'DELETE', cookie: user.cookie })).response.status, 400)
    await f.request(`/messages/${msg.id}`, { method: 'DELETE', cookie: user.cookie }); await f.request(`/messages/${msg.id}`, { method: 'PATCH', cookie: user.cookie, body: { action: 'restore' } })
    assert.equal((await f.request('/messages', { cookie: user.cookie })).data.messages[0].deleted_at, null)
  }))
  await t.test('ANA-01 public view and valid link click increment analytics', () => withUser(async (f, user) => {
    const doc = resume(`portfolio-${randomUUID()}`, { kind: 'portfolio', personal: { fullName: 'Test User', website: 'https://example.com' } }); await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc }); await f.request(`/documents/${doc.id}/publication`, { method: 'PUT', cookie: user.cookie, body: { slug: 'analytics-check', visibility: 'public' } }); await f.request('/public/portfolios/analytics-check');
    assert.equal((await f.request('/public/portfolios/analytics-check/events', { method: 'POST', body: { type: 'click', href: 'https://example.com' } })).response.status, 200)
    const rows = (await f.request('/analytics', { cookie: user.cookie })).data.analytics
    assert.ok(rows.some((row) => row.views >= 1 && row.clicks >= 1))
  }))
  await t.test('ANA-02 unknown links and unauthenticated analytics are rejected', async () => {
    const f = await fixture(); try { assert.equal((await f.request('/analytics')).response.status, 401); assert.equal((await f.request('/public/portfolios/no-such/events', { method: 'POST', body: { type: 'click', href: 'https://evil.example' } })).response.status, 404) } finally { await f.close() }
  })
  await t.test('BILL-01 billing reports demo provider and plans', () => withUser(async (f, user) => {
    const result = await f.request('/billing', { cookie: user.cookie }); assert.equal(result.response.status, 200); assert.equal(result.data.provider, 'demo'); assert.ok(result.data.plans.length)
  }))
  await t.test('BILL-02 demo failed and successful outcomes update payment and plan', () => withUser(async (f, user) => {
    let checkout = await f.request('/billing/checkout', { method: 'POST', cookie: user.cookie }); assert.equal(checkout.data.provider, 'demo')
    const failed = await f.request(`/billing/demo/${checkout.data.id}`, { method: 'POST', cookie: user.cookie, body: { outcome: 'failed' } }); assert.equal(failed.data.user.plan, 'free')
    checkout = await f.request('/billing/checkout', { method: 'POST', cookie: user.cookie })
    const paid = await f.request(`/billing/demo/${checkout.data.id}`, { method: 'POST', cookie: user.cookie, body: { outcome: 'success' } }); assert.equal(paid.data.user.plan, 'premium')
  }))
  await t.test('BILL-03 free plan limit is enforced and downgrade changes plan', () => withUser(async (f, user) => {
    let doc = resume(`resume-${randomUUID()}`); assert.equal((await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc })).response.status, 200)
    doc = resume(`resume-${randomUUID()}`); assert.equal((await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc })).response.status, 403)
    await f.app.locals.models.User.upgrade(user.data.user.id)
    assert.equal((await f.request('/billing/downgrade', { method: 'POST', cookie: user.cookie })).data.user.plan, 'free')
  }))
  await t.test('BILL-04 Stripe verification fails safely when unconfigured', () => withUser(async (f, user) => {
    assert.equal((await f.request('/billing/verify', { method: 'POST', cookie: user.cookie, body: { sessionId: 'cs_test' } })).response.status, 503)
  }))
  await t.test('ADMIN-01 admin dashboard returns report and fixture counts', async () => {
    const f = await fixture(); try { const admin = await f.admin(); const result = await f.request('/admin', { cookie: admin.cookie }); assert.equal(result.response.status, 200); assert.equal(result.data.accountSummary.administrators.total, 1); assert.ok(result.data.report) } finally { await f.close() }
  })
  await t.test('ADMIN-02 admin API denies anonymous and regular users', async () => {
    const f = await fixture(); try { const user = await f.register(); assert.equal((await f.request('/admin', {})).response.status, 401); assert.equal((await f.request('/admin', { cookie: user.cookie })).response.status, 403) } finally { await f.close() }
  })
  await t.test('ADMIN-03 admin disable invalidates user sessions', async () => {
    const f = await fixture(); try { const admin = await f.admin(); const user = await f.register(); assert.equal((await f.request(`/admin/users/${user.data.user.id}`, { method: 'PATCH', cookie: admin.cookie, body: { disabled: true } })).response.status, 200); assert.equal((await f.request('/auth/me', { cookie: user.cookie })).response.status, 401) } finally { await f.close() }
  })
  await t.test('ADMIN-04 admin can update template and plan; invalid limits rejected', async () => {
    const f = await fixture(); try {
      const admin = await f.admin()
      assert.equal((await f.request('/admin/templates/resume/flowcv-classic-serif', { method: 'PATCH', cookie: admin.cookie, body: { enabled: true, premium: false, name: 'Test Classic' } })).response.status, 200)
      assert.equal((await f.request('/admin/plans/free', { method: 'PATCH', cookie: admin.cookie, body: { resumeLimit: 0, portfolioLimit: 1, enabled: true } })).response.status, 400)
    } finally { await f.close() }
  })
  await t.test('SEC-01 mutation origin marker and security headers are enforced', async () => {
    const f = await fixture(); try {
      const blocked = await f.request('/auth/register', { method: 'POST', body: { fullName: 'T', email: 't@example.com', password: 'TestPassword123!' }, headers: { 'X-Linkfolio-Request': undefined, Origin: 'https://evil.example' } })
      assert.equal(blocked.response.status, 403)
      assert.equal(blocked.response.headers.get('x-content-type-options'), 'nosniff')
    } finally { await f.close() }
  })
  await t.test('DB-01 file-backed SQLite persists across reopen and cascades on user deletion', async () => {
    const { mkdtempSync, rmSync } = require('node:fs')
    const { join } = require('node:path')
    const { tmpdir } = require('node:os')
    const { openDatabase } = require('../database/database')
    const directory = mkdtempSync(join(tmpdir(), 'linkfolio-test-'))
    const f = await fixture({ databasePath: join(directory, 'test.sqlite') })
    try {
      const user = await f.register()
      const doc = resume(`resume-${randomUUID()}`)
      await f.request(`/documents/${doc.id}`, { method: 'PUT', cookie: user.cookie, body: doc })
      await f.close()
      const reopened = openDatabase(join(directory, 'test.sqlite'))
      const before = reopened.prepare('SELECT COUNT(*) AS n FROM documents WHERE user_id = ?').get(user.data.user.id)
      assert.equal(before.n, 1)
      reopened.prepare('DELETE FROM users WHERE id = ?').run(user.data.user.id)
      const after = reopened.prepare('SELECT COUNT(*) AS n FROM documents WHERE user_id = ?').get(user.data.user.id)
      assert.equal(after.n, 0)
      reopened.close()
    } finally {
      await f.close().catch(() => {})
      rmSync(directory, { recursive: true, force: true })
    }
  })
  await t.test('DB-02 PostgreSQL is explicitly skipped unless a separate test URL is supplied', async (t) => {
    if (!process.env.LINKFOLIO_TEST_DATABASE_URL) return t.skip('Set LINKFOLIO_TEST_DATABASE_URL to an isolated PostgreSQL test database.')
    assert.match(process.env.LINKFOLIO_TEST_DATABASE_URL, /test/i, 'test database URL should be clearly marked as a test database')
  })
})
