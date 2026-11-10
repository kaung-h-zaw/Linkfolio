import { test, expect } from '@playwright/test'
import { sampleProfile } from '../src/components/resumeTemplates.js'
import { getPortfolioTemplate } from '../src/lib/portfolioTemplates.js'
import { defaultPortfolio } from '../src/lib/portfolio.js'

const headers = { 'X-Linkfolio-Request': '1' }
test('soft application theme covers home, authentication, workspace and editors without changing documents', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your portfolio.')
  await expect(page.locator('.linkfolio-app')).toHaveCSS('background-color', 'rgb(245, 247, 246)')
  for (const href of ['#demo', '#how-it-works', '#pricing']) {
    await page.getByRole('navigation', { name:'Main navigation',exact:true }).locator(`a[href="${href}"]`).click()
    await expect(page.locator(href)).toBeInViewport()
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: testInfo.outputPath('home-soft-desktop.png'), fullPage: true })
  await page.goto('/login')
  await expect(page.locator('.app-auth')).toHaveCSS('background-color', 'rgb(245, 247, 246)')
  await page.screenshot({ path: testInfo.outputPath('login-soft-desktop.png') })
  expect((await page.request.post('/api/auth/register', { headers, data: { fullName: 'Alex Morgan', email: `theme-${crypto.randomUUID()}@example.com`, password: 'theme test password' } })).status()).toBe(201)
  const id = crypto.randomUUID()
  expect((await page.request.put(`/api/documents/${id}`, { headers, data: { ...sampleProfile, id, kind: 'resume', name: 'My resume', templateId: 'essential', portfolio: { ...defaultPortfolio, template: 'essential' } } })).status()).toBe(200)
  await page.goto('/dashboard')
  await expect(page.locator('.app-sidebar')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('dashboard-soft-desktop.png') })
  await page.goto('/setup')
  await expect(page.getByRole('heading', { name: 'My resumes', exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('workspace-soft-desktop.png') })
  await page.goto(`/editor?resume=${id}`)
  await page.getByRole('button', { name: 'Design', exact: true }).click()
  await page.getByRole('tab', { name: /^Sections/ }).click()
  await page.locator('[data-section-choice=experience]').click()
  const card = page.getByRole('region', { name: 'Resume section customization', exact: true })
  await card.evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }))
  await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(page.getByRole('tab', { name: /^Sections/ })).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  const document = page.locator('#editor-preview .resume-page').first()
  await expect(document).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(document).toHaveCSS('color', 'rgb(30, 41, 59)')
  await page.screenshot({ path: testInfo.outputPath('editor-soft-desktop.png') })
  await page.setViewportSize({ width: 390, height: 844 })
  await card.evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('editor-soft-mobile.png') })
  await page.goto('/dashboard')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('dashboard-soft-mobile.png'), fullPage: true })
  const slug = `theme-${id.slice(0, 8)}`
  expect((await page.request.put(`/api/documents/${id}/publication`, { headers, data: { slug, visibility: 'public' } })).status()).toBe(200)
  await page.goto(`/p/${slug}`)
  await expect(page.locator('.linkfolio-app')).toHaveCount(0)
  await expect(page.locator('.portfolio-site')).toHaveAttribute('data-portfolio-template', getPortfolioTemplate('essential').id)
  expect(errors).toEqual([])
})
