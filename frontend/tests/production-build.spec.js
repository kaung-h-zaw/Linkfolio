import { test, expect } from './fixtures.js'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { sampleProfile } from '../src/components/resumeTemplates.js'
import { defaultPortfolio } from '../src/lib/portfolio.js'

test.use({ production: true })

test('production policies preserve editing, PDF export, device previews, public sharing and local OCR', async ({ page, browser, baseURL }) => {
  const errors = []
  const policyErrors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && /Content Security Policy|violates.*directive/i.test(message.text())) policyErrors.push(message.text())
  })
  const response = await page.goto('/')
  expect(response.headers()['content-security-policy']).toContain("worker-src 'self' blob:")
  const headers = { 'X-Linkfolio-Request': '1' }
  expect((await page.request.post('/api/auth/register', {
    headers, data: { fullName: 'Production Owner', email: 'production@example.com', password: 'production test password' },
  })).status()).toBe(201)
  const id = crypto.randomUUID()
  expect((await page.request.put(`/api/documents/${id}`, {
    headers, data: { ...sampleProfile, id, kind: 'resume', name: 'Production resume', templateId: 'essential' },
  })).status()).toBe(200)
  await page.goto(`/editor?resume=${id}`)
  await expect(page.locator('#editor-preview')).toContainText(sampleProfile.personal.fullName)
  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download resume', exact: true }).click()
  const download = await downloading
  expect((await readFile(await download.path())).subarray(0, 5).toString()).toBe('%PDF-')

  const portfolioId = crypto.randomUUID()
  expect((await page.request.put(`/api/documents/${portfolioId}`, {
    headers, data: { ...sampleProfile, id: portfolioId, kind: 'portfolio', name: 'Production portfolio', templateId: 'essential', portfolio: { ...defaultPortfolio, template: 'essential' } },
  })).status()).toBe(200)
  expect((await page.request.put(`/api/documents/${portfolioId}/publication`, {
    headers, data: { slug: 'production-portfolio', visibility: 'public' },
  })).status()).toBe(200)
  await page.goto(`/portfolio/editor?resume=${portfolioId}`)
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(page.frameLocator('iframe[title="Portfolio device preview"]').locator('.portfolio-site')).toBeVisible()
  const visitor = await browser.newPage()
  try {
    await visitor.goto(`${baseURL}/p/production-portfolio`)
    await expect(visitor.locator('.portfolio-site')).toContainText(sampleProfile.personal.fullName)
    await expect(visitor.locator('.linkfolio-app')).toHaveCount(0)
  } finally { await visitor.close() }

  await page.goto('/resume/import')
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 600
    const context = canvas.getContext('2d')
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'black'
    context.font = '36px Arial'
    for (const [index, line] of ['Taylor Production', 'Software Developer', 'taylor@example.com', 'Experience', 'Engineer at Example Company', 'Built accessible tools.'].entries()) {
      context.fillText(line, 50, 70 + index * 65)
    }
    return canvas.toDataURL('image/png').split(',')[1]
  })
  await page.getByLabel('Resume file', { exact: true }).setInputFiles({
    name: 'production-resume.png', mimeType: 'image/png', buffer: Buffer.from(image, 'base64'),
  })
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('Taylor Production', { timeout: 30000 })
  expect(errors).toEqual([])
  expect(policyErrors).toEqual([])
})
