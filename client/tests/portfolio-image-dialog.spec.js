import { test, expect } from './fixtures.js'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { sampleProfile } from '../src/components/resumeTemplates.js'
import { defaultPortfolio } from '../src/lib/portfolio.js'
import { portfolioDemoImages } from '../src/lib/portfolioImages.js'
const headers = {'X-Linkfolio-Request':'1'}
test('image dialog supports cancelling, validation, dropping, hiding and restoring photos on mobile', async ({page},testInfo) => {
  await page.request.post('/api/auth/register',{headers,data:{fullName:'Image Owner',email:`images-${crypto.randomUUID()}@example.com`,password:'image test password'}})
  const id = crypto.randomUUID()
  expect((await page.request.put(`/api/documents/${id}`,{headers,data:{...sampleProfile,id,kind:'portfolio',name:'Image portfolio',templateId:'essential',portfolio:{...defaultPortfolio,images:{portraitSource:'custom',portrait:portfolioDemoImages.portrait,cover:portfolioDemoImages.cover}}}})).status()).toBe(200)
  await page.goto(`/portfolio/editor?resume=${id}`)
  await expect(page.getByLabel('Short introduction',{exact:true})).toHaveCount(0)
  await expect(page.getByText('Cover image',{exact:true})).toHaveCount(0)
  await expect(page.locator('#editor-preview .portfolio-hero-image')).toHaveCount(0)
  const change = page.getByRole('button',{name:'Change portrait image',exact:true})
  await change.click()
  const dialog = page.getByRole('dialog',{name:'Add portrait image',exact:true})
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button',{name:'Use image',exact:true})).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(change).toBeFocused()
  await change.click()
  await dialog.getByLabel('Choose portrait image',{exact:true}).setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('not an image')})
  await expect(dialog.getByRole('alert')).toContainText('Choose a JPG, PNG or WebP image.')
  await expect(dialog.getByRole('button',{name:'Use image',exact:true})).toBeDisabled()
  await page.setViewportSize({width:320,height:740})
  const bytes = [...readFileSync(new URL('../public/images/portfolio-desk.jpg',import.meta.url))]
  const dataTransfer = await page.evaluateHandle((bytes) => {
    const transfer = new DataTransfer()
    transfer.items.add(new File([new Uint8Array(bytes)],'project.jpg',{type:'image/jpeg'}))
    return transfer
  },bytes)
  await dialog.locator('.portfolio-upload-dropzone').dispatchEvent('drop',{dataTransfer})
  await expect(dialog.getByAltText('Selected image preview')).toBeVisible()
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  await page.screenshot({path:testInfo.outputPath('image-popup-mobile.png')})
  await dialog.getByRole('button',{name:'Use image',exact:true}).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByAltText('Portrait image preview')).toHaveAttribute('src',/^data:image\/jpeg;base64,/)
  await expect(page.locator('#editor-preview .portfolio-portrait')).toHaveAttribute('src',/^data:image\/jpeg;base64,/)
  await page.getByLabel('Show personal photo',{exact:true}).uncheck()
  await expect(page.getByAltText('Portrait image preview')).toHaveCount(0)
  await expect(change).toHaveCount(0)
  await expect(page.locator('#editor-preview .portfolio-portrait')).toHaveCount(0)
  await page.getByRole('button',{name:'Save',exact:true}).click()
  await page.getByText('Saved to your account',{exact:true}).first().waitFor()
  await page.reload()
  await expect(page.getByLabel('Show personal photo',{exact:true})).not.toBeChecked()
  await expect(page.getByAltText('Portrait image preview')).toHaveCount(0)
  await page.getByLabel('Show personal photo',{exact:true}).check()
  await expect(page.getByAltText('Portrait image preview')).toHaveAttribute('src',/^data:image\/jpeg;base64,/)
  await page.setViewportSize({width:1440,height:1000})
  await change.click()
  await page.screenshot({path:testInfo.outputPath('image-popup-desktop.png')})
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click()
  await expect(change).toBeFocused()
})
