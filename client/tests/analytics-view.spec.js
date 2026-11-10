import { test, expect } from '@playwright/test'

test('analytics overview, portfolio filter, refresh and empty states are readable on mobile', async ({ page }, testInfo) => {
  const registration = await page.request.post('/api/auth/register', {
    headers: { 'X-Linkfolio-Request': '1' },
    data: { fullName: 'Analytics Tester', email: `analytics-${crypto.randomUUID()}@example.com`, password: 'analytics test password' },
  })
  expect(registration.status()).toBe(201)
  let rows = [
    { id: 'public-site', name: 'My design portfolio', slug: 'my-design', visibility: 'public', views: 13, clicks: 4, lastViewedAt: '2026-10-06T07:22:38.000Z' },
    { id: 'private-site', name: 'My developer portfolio', slug: 'my-developer', visibility: 'private', views: 7, clicks: 2, lastViewedAt: '2026-10-05T04:00:00.000Z' },
    { id: 'draft-site', name: 'My next portfolio', visibility: null, views: 0, clicks: 0, lastViewedAt: null },
  ]
  await page.route('**/api/analytics', (route) => route.fulfill({ json: { analytics: rows } }))
  await page.goto('/analytics')
  await expect(page.getByRole('region', { name: 'Page views', exact: true })).toContainText('20')
  await expect(page.getByRole('region', { name: 'Link clicks', exact: true })).toContainText('6')
  await expect(page.getByRole('region', { name: 'Public portfolios', exact: true })).toContainText('1')
  await expect(page.getByRole('link', { name: 'Open portfolio', exact: true })).toHaveAttribute('href', '/p/my-design')
  await expect(page.getByRole('link', { name: 'Edit portfolio', exact: true }).first()).toHaveAttribute('href', '/portfolio/editor?resume=private-site')
  await page.screenshot({ path: testInfo.outputPath('analytics-desktop.png'), fullPage: true })
  await page.getByLabel('Filter analytics by portfolio', { exact: true }).selectOption('draft-site')
  await expect(page.getByRole('region', { name: 'Page views', exact: true })).toContainText('0')
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByRole('article')).toContainText('No visits yet')
  await page.getByLabel('Filter analytics by portfolio', { exact: true }).selectOption('all')
  rows = rows.map((row) => row.id === 'public-site' ? { ...row, views: 14 } : row)
  await page.getByRole('button', { name: 'Refresh analytics', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Page views', exact: true })).toContainText('21')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: testInfo.outputPath('analytics-mobile.png'), fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.locator('.analytics-chart-row')).toHaveCount(3)
  await page.getByRole('group', { name:'Filter analytics by visibility' }).getByRole('button', { name:'Public',exact:true }).click()
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByRole('region', { name:'Page views',exact:true })).toContainText('14')
  await page.getByRole('group', { name:'Filter analytics by visibility' }).getByRole('button', { name:'All',exact:true }).click()
  await page.getByText('How these numbers are counted', { exact: true }).click()
  await expect(page.getByText(/These are all-time totals, not unique visitors/)).toBeVisible()
  rows = []
  await page.getByRole('button', { name: 'Refresh analytics', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No portfolios yet' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Page views', exact: true })).toContainText('0')
  await expect(page.getByLabel('Filter analytics by portfolio', { exact: true })).toHaveCount(0)
})
