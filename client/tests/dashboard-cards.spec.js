import { test, expect } from '@playwright/test'
import { sampleProfile } from '../src/components/resumeTemplates.js'
import { defaultPortfolio } from '../src/lib/portfolio.js'

const headers = { 'X-Linkfolio-Request': '1' }
test('dashboard cards show saved work and adapt to desktop, tablet and narrow phones', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  expect((await page.request.post('/api/auth/register', { headers, data: { fullName: 'Alex Morgan', email: `dashboard-${crypto.randomUUID()}@example.com`, password: 'dashboard password' } })).status()).toBe(201)
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'No saved work yet', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Resumes: 0', exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('dashboard-empty.png'), fullPage: true })
  const id = crypto.randomUUID()
  expect((await page.request.put(`/api/documents/${id}`, { headers, data: { ...sampleProfile, id, kind: 'resume', name: 'Alex resume', templateId: 'essential', portfolio: defaultPortfolio } })).status()).toBe(200)
  await page.route('**/api/analytics', (route) => route.fulfill({ json: { analytics: [{ id, views: 12, clicks: 3, visibility: 'private' }] } }))
  await page.reload()
  await expect(page.getByRole('link', { name: 'Resumes: 1', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Portfolios: 1', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Portfolio views: 12', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open resume for Alex Morgan', exact: true })).toHaveAttribute('href', `/editor?resume=${id}`)
  await expect(page.getByRole('link', { name: 'Open portfolio for Alex Morgan', exact: true })).toHaveAttribute('href', `/portfolio/editor?resume=${id}`)
  await expect(page.getByRole('heading', { name: 'No saved work yet', exact: true })).toHaveCount(0)
  for (const width of [1920, 1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const columns = await page.locator('.dashboard-stats').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length)
    expect(columns).toBe(width >= 1200 ? 4 : 2)
    if (width <= 900) expect(await page.locator('.dashboard-side-cards').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(1)
    if (width < 768) {
      await expect(page.getByRole('button', { name: 'Open workspace menu', exact: true })).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Workspace', exact: true })).toBeHidden()
    } else await expect(page.getByRole('navigation', { name: 'Workspace', exact: true })).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath(`dashboard-${width}.png`), fullPage: true })
  }
  await page.getByRole('button', { name: 'Open workspace menu', exact: true }).click()
  await expect(page.getByRole('navigation', { name: 'Workspace', exact: true })).toBeVisible()
  await page.getByRole('navigation', { name: 'Workspace', exact: true }).getByRole('link', { name: 'Resume', exact: true }).focus()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open workspace menu', exact: true })).toBeFocused()
  await expect(page.getByRole('navigation', { name: 'Workspace', exact: true })).toBeHidden()
  await page.locator('.dashboard-import summary').click()
  await expect(page.getByRole('button', { name: 'Import browser drafts', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Open resume for Alex Morgan', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/editor\\?resume=${id}`))
  expect(errors).toEqual([])
})
