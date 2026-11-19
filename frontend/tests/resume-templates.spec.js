import { test, expect } from './fixtures.js'
import { fileURLToPath } from 'node:url'
import { Buffer } from 'node:buffer'

const names = ['Harvard', 'MIT', 'Bajaj Developer', 'Awesome CV', 'ModernCV Classic', 'Deedy', 'ModernCV Banking', 'AltaCV', 'Twenty One Seconds']

test('nine sourced templates, photo upload, persistence, removal and PDF export', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const registration = await page.request.post('/api/auth/register', {
    headers: { 'X-Linkfolio-Request': '1' },
    data: { fullName: 'Photo Tester', email: `photo-${crypto.randomUUID()}@example.com`, password: 'photo test password' },
  })
  expect(registration.status()).toBe(201)
  await page.goto('/setup?new=1')
  await expect(page.getByRole('button', { name: /^Preview .* template$/ })).toHaveCount(9)
  for (const name of names) {
    await page.getByRole('button', { name: `Preview ${name} template`, exact: true }).click()
    await expect(page.getByRole('link', { name: 'View original reference' })).toHaveAttribute('href', /^https:\/\//)
    expect(await page.locator('dialog .resume-page').count()).toBeGreaterThan(0)
    if (['ModernCV Classic', 'AltaCV', 'Twenty One Seconds'].includes(name)) {
      await expect(page.locator('dialog .resume-page .resume-photo').first()).toBeVisible()
      await expect.poll(() => page.locator('dialog .resume-page .resume-photo').first().evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true)
    }
    await page.screenshot({ path: testInfo.outputPath(`${name.replaceAll(' ', '-').toLowerCase()}.png`) })
    await page.getByRole('button', { name: 'Close template preview' }).click()
  }
  await page.getByRole('button', { name: 'Photo', exact: true }).click()
  await expect(page.getByRole('button', { name: /^Preview .* template$/ })).toHaveCount(3)
  await page.getByRole('button', { name: 'All templates', exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('nine-template-gallery.png'), fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: testInfo.outputPath('nine-template-gallery-mobile.png'), fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('button',{name:'Preview Harvard template',exact:true}).click()
  const previewDialog=page.getByRole('dialog',{name:'Harvard',exact:true})
  await expect(previewDialog.getByRole('button',{name:'Use this template',exact:true})).toBeVisible()
  expect(await previewDialog.evaluate(element=>element.scrollWidth<=element.clientWidth)).toBe(true)
  await page.screenshot({path:testInfo.outputPath('template-popup-mobile.png')})
  await page.getByRole('button',{name:'Close template preview',exact:true}).click()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/premium')
  await page.getByRole('button', { name: 'Try demo upgrade', exact: true }).click()
  await page.getByRole('button', { name: 'Simulate successful payment', exact: true }).click()
  await page.getByText('Demo payment successful. Premium is active.', { exact: true }).waitFor()
  await page.goto('/setup?new=1')
  await page.getByRole('button', { name: 'Preview AltaCV template', exact: true }).click()
  await page.getByRole('button', { name: 'Use this template', exact: true }).click()
  await page.getByRole('button', { name: 'Edit personal details', exact: true }).click()
  const input = page.getByLabel('Resume photo (optional)', { exact: true })
  await input.setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') })
  await expect(page.getByRole('alert')).toContainText('Choose a JPG, PNG or WebP photo.')
  await input.setInputFiles(fileURLToPath(new URL('../public/images/resume-demo.jpg', import.meta.url)))
  await expect(page.getByAltText('Your uploaded resume photo')).toBeVisible()
  await page.getByRole('button', { name: 'Done', exact: true }).click()
  await expect(page.locator('#editor-preview .resume-page .resume-photo')).toBeVisible()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByText('Saved to your account', { exact: true }).first().waitFor()
  await page.reload()
  await expect(page.locator('#editor-preview .resume-page .resume-photo')).toHaveAttribute('src', /^data:image\/jpeg;base64,/)
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download resume', exact: true }).click()
  const download = await downloadEvent
  await download.saveAs(testInfo.outputPath('resume-with-photo.pdf'))
  expect(await download.failure()).toBeNull()
  await page.getByRole('button', { name: 'Edit personal details', exact: true }).click()
  await page.getByRole('button', { name: 'Remove photo', exact: true }).click()
  await page.getByRole('button', { name: 'Done', exact: true }).click()
  await expect(page.locator('#editor-preview .resume-page .resume-photo')).toHaveCount(0)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByText('Saved to your account', { exact: true }).first().waitFor()
  await page.reload()
  await expect(page.locator('#editor-preview .resume-page .resume-photo')).toHaveCount(0)
  expect(errors).toEqual([])
})
