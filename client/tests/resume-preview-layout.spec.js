import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { sampleProfile } from '../src/components/resumeTemplates.js'
import { getExperience } from '../src/lib/experience.js'
import { getDesign } from '../src/lib/resumeDesign.js'

const headers = { 'X-Linkfolio-Request':'1' }
test('print preview keeps PDF page breaks, margins, and chosen borders at every screen width', async ({ page }, testInfo) => {
  expect((await page.request.post('/api/auth/register', { headers, data: { fullName:'Print Preview', email:`print-${crypto.randomUUID()}@example.com`, password:'print preview password' } })).status()).toBe(201)
  const id = crypto.randomUUID()
  const experience = getExperience(structuredClone(sampleProfile))
  experience.entries = Array.from({ length:9 }, (_, index) => ({ ...experience.entries[0], id:`job-${index}`, jobTitle:`Designer ${index + 1}` }))
  const design = getDesign({ marginX:44, marginY:36, borderColor:'#91472f' })
  expect((await page.request.put(`/api/documents/${id}`, { headers, data: { ...sampleProfile, id, kind:'resume', name:'Print layout', templateId:'essential', experienceSection:experience, design } })).status()).toBe(200)
  await page.goto(`/editor?resume=${id}`)
  await page.evaluate(() => document.fonts.ready)
  const pages = page.locator('#editor-preview .resume-page')
  await expect.poll(() => pages.count()).toBeGreaterThan(1)
  const signatures = await pages.allInnerTexts()
  const expectedPages = signatures.length
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name:'Download resume',exact:true }).click()
  const file = await downloadEvent
  const path = testInfo.outputPath('print-layout.pdf')
  await file.saveAs(path)
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const pdf = await getDocument({ data:new Uint8Array(await readFile(path)), useSystemFonts:true }).promise
  expect(pdf.numPages).toBe(expectedPages)
  for (const width of [1440,1024,768,390]) {
    await page.setViewportSize({ width,height:900 })
    if (width < 768) await page.getByRole('button', { name:'Preview',exact:true }).click()
    await expect.poll(() => page.locator('.resume-print-canvas').evaluate((element) => Math.abs(element.getBoundingClientRect().width - Math.min(794, element.parentElement.clientWidth)))).toBeLessThan(1)
    await expect.poll(() => pages.allInnerTexts()).toEqual(signatures)
    expect(await pages.first().evaluate((element) => element.offsetWidth)).toBe(794)
    await expect(pages.first()).toHaveCSS('padding-left','44px')
    await expect(pages.first()).toHaveCSS('padding-top','36px')
    await expect(pages.first()).toHaveCSS('border-color','rgb(145, 71, 47)')
    await page.screenshot({ path:testInfo.outputPath(`print-preview-${width}.png`) })
  }
  // Printing on a phone uses the same page breaks as the desktop download.
  await page.getByRole('button', { name:'Close preview',exact:true }).click()
  const mobileEvent = page.waitForEvent('download')
  await page.getByRole('button', { name:'Download resume',exact:true }).click()
  const mobile = await mobileEvent
  const mobilePath = testInfo.outputPath('print-layout-mobile.pdf')
  await mobile.saveAs(mobilePath)
  const mobilePdf = await getDocument({ data:new Uint8Array(await readFile(mobilePath)), useSystemFonts:true }).promise
  expect(mobilePdf.numPages).toBe(expectedPages)
})
