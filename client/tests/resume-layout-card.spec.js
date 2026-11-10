import { openGeneralGroup } from './helpers/designControls.js'
import { test, expect } from '@playwright/test'
import { sampleProfile } from '../src/components/resumeTemplates.js'
const headers = { 'X-Linkfolio-Request':'1' }

test('visual layout controls, column dragging and header placement persist and export', async ({ page }, testInfo) => {
  await page.request.post('/api/auth/register', { headers, data:{ fullName:'Layout owner', email:`layout-${crypto.randomUUID()}@example.com`, password:'layout password' } })
  const id = crypto.randomUUID()
  expect((await page.request.put(`/api/documents/${id}`, { headers, data:{ ...sampleProfile, id, kind:'resume', name:'Layout controls', templateId:'essential' } })).status()).toBe(200)
  await page.setViewportSize({ width:1440,height:1000 })
  await page.goto(`/editor?resume=${id}`)
  async function openLayout() {
    await page.getByRole('navigation', { name:'Editor navigation',exact:true }).getByRole('button', { name:'Design',exact:true }).click()
    await openGeneralGroup(page,'Layout')
  }
  await openLayout()
  const layout = page.getByRole('region', { name:'Layout',exact:true })
  const paper = page.locator('#editor-preview .resume-page').first()
  await layout.getByRole('button', { name:'Two columns layout',exact:true }).click()
  await expect(paper).toHaveAttribute('data-columns','two')
  const rows = layout.locator('.resume-arrange-row')
  await rows.first().scrollIntoViewIfNeeded()
  const original = await rows.evaluateAll((elements) => elements.map((element) => element.dataset.orderSection))
  await expect.poll(async () => Math.abs((await rows.first().boundingBox()).y - (await rows.nth(1).boundingBox()).y)).toBeLessThan(2)
  const start = await rows.first().boundingBox(), end = await rows.nth(1).boundingBox()
  await page.mouse.move(start.x + 70,start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(end.x + end.width * 0.7,end.y + end.height / 2,{steps:12})
  await expect(rows.first()).toHaveAttribute('data-order-section',original[1])
  await page.mouse.up()
  await layout.getByRole('button', { name:'Header position: Right',exact:true }).click()
  await expect(paper).toHaveAttribute('data-header-position','right')
  await expect(paper.locator('header')).toHaveCSS('grid-column-start','2')
  const width = layout.getByRole('slider', { name:'Left column width',exact:true })
  await width.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(width).toHaveValue('60')
  await expect.poll(() => paper.evaluate((element) => {
    const sizes = getComputedStyle(element).gridTemplateColumns.split(' ').map(parseFloat)
    return Math.round(sizes[0] / (sizes[0] + sizes[1]) * 100)
  })).toBe(60)
  await layout.getByRole('button', { name:'Mixed layout',exact:true }).click()
  await expect(paper).toHaveAttribute('data-columns','mixed')
  await page.getByRole('button', { name:'Save',exact:true }).click()
  await expect(page.locator('.editor-navigation-bar').getByRole('status')).toContainText('Saved to your account')
  await page.reload()
  await openLayout()
  await expect(layout.getByRole('button', { name:'Mixed layout',exact:true })).toHaveAttribute('aria-pressed','true')
  await expect(width).toHaveValue('60')
  await expect(paper).toHaveAttribute('data-header-position','right')
  for (const viewport of [1440,768,390,320]) {
    await page.setViewportSize({ width:viewport,height:1000 })
    await openGeneralGroup(page,'Layout')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(await layout.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
    await expect.poll(async () => { const card = await layout.boundingBox(), pane = await page.locator('#editor-content').boundingBox(); return Math.abs(card.y - pane.y - 16) }).toBeLessThan(3)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    await page.screenshot({ path:testInfo.outputPath(`layout-card-${viewport}.png`) })
  }
  await page.setViewportSize({ width:1440,height:1000 })
  const pages = await page.locator('#editor-preview .resume-page').count()
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name:'Download resume',exact:true }).click()
  const download = await downloadEvent
  const pdfPath = testInfo.outputPath('layout.pdf')
  await download.saveAs(pdfPath)
  const { getDocument, OPS } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const { readFile } = await import('node:fs/promises')
  const loading = getDocument({ data:new Uint8Array(await readFile(pdfPath)),useSystemFonts:true })
  const pdf = await loading.promise
  expect(pdf.numPages).toBe(pages)
  // Export uses rasterized pages, so verify that every PDF page contains an image.
  for (let index = 1; index <= pdf.numPages; index++) {
    const operators = await (await pdf.getPage(index)).getOperatorList()
    expect(operators.fnArray.some((operator) => [OPS.paintImageXObject,OPS.paintInlineImageXObject].includes(operator))).toBe(true)
  }
  await expect(page.locator('#editor-preview')).toContainText('Senior Product Designer')
  await loading.destroy()
  await layout.getByRole('button', { name:'Reset layout',exact:true }).click()
  await expect(layout.getByRole('button', { name:'Original layout',exact:true })).toHaveAttribute('aria-pressed','true')
  await expect(layout.getByRole('slider', { name:'Left column width',exact:true })).toHaveCount(0)
})
