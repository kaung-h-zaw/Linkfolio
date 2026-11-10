import { test, expect } from '@playwright/test'
import { sampleProfile } from '../src/components/resumeTemplates.js'
import { defaultPortfolio } from '../src/lib/portfolio.js'

const headers = { 'X-Linkfolio-Request': '1' }
test('every workspace uses responsive cards and compact navigation', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const response = await page.request.post('/api/auth/register', { headers, data: { fullName: 'Alex Morgan', email: `workspace-${crypto.randomUUID()}@example.com`, password: 'workspace password' } })
  expect(response.status()).toBe(201)
  const { user } = await response.json()
  const id = crypto.randomUUID()
  expect((await page.request.put(`/api/documents/${id}`, { headers, data: { ...sampleProfile, id, name: 'My resume', kind: 'resume', templateId: 'essential', portfolio: defaultPortfolio } })).status()).toBe(200)
  const analytics = [{ id, name: 'Design portfolio', views: 23, clicks: 5, visibility: 'private', lastViewedAt: '2026-11-03T09:00:00Z' }]
  const messages = [{ id:'message-one', sender_name:'Taylor Smith', sender_email:'taylor@example.com', message:'I enjoyed your portfolio and would like to discuss a project with you.', status:'unread', slug:'alex', created_at:'2026-11-03T09:00:00Z' }]
  await page.route('**/api/analytics', (route) => route.fulfill({ json:{ analytics } }))
  await page.route('**/api/messages', (route) => route.fulfill({ json:{ messages } }))
  // Read-only fixtures exercise the administrator layout without changing any account role.
  await page.route('**/api/auth/me', (route) => route.fulfill({ json:{ user:{ ...user, role:'admin' } } }))
  await page.route('**/api/admin', (route) => route.fulfill({ json:{ report:{ users:1, resumes:1, portfolios:1 }, users:[{ ...user, fullName:'Alex Morgan', role:'user', plan:'free', disabled:false }], templates:[{ id:'essential',kind:'resume',name:'Essential',enabled:true,premium:false }], plans:[{ id:'premium',name:'Premium',resume_limit:20,portfolio_limit:20,enabled:true }] } }))
  for (const [route, title, selector] of [
    ['/dashboard','Your dashboard','.dashboard-stats'],
    ['/setup','My resumes','.library-document-card'],
    ['/setup?view=portfolio','My portfolios','.library-document-card'],
    ['/analytics','Portfolio analytics','.analytics-portfolio-card'],
    ['/messages','Contact messages','.message-card-grid > button'],
    ['/account','Your account','.account-card-grid > form'],
    ['/premium','Upgrade to Premium','.plan-benefits-card'],
    ['/admin','Administration','.admin-template-grid > div'],
  ]) {
    await page.goto(route)
    await expect(page.getByRole('heading', { name:title, exact:true, level:1 })).toBeVisible()
    await expect(page.locator(selector).first()).toBeVisible()
    for (const width of [1440,768,320]) {
      await page.setViewportSize({ width,height:1000 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      if (width < 768) {
        await expect(page.getByRole('button', { name:'Open workspace menu',exact:true })).toBeVisible()
        await expect(page.getByRole('navigation', { name:'Workspace',exact:true })).toBeHidden()
      }
      await page.screenshot({ path:testInfo.outputPath(`${title.replaceAll(' ','-')}-${width}.png`),fullPage:true })
    }
  }
  expect(errors).toEqual([])
})
