import { test, expect } from './fixtures.js'
import { sampleProfile } from '../src/components/resumeTemplates.js'
import { defaultPortfolio } from '../src/lib/portfolio.js'
const headers = { 'X-Linkfolio-Request':'1' }
test('resume and portfolio libraries keep resume actions simple while preserving portfolio filters', async ({ page }, testInfo) => {
  const errors=[]
  page.on('pageerror',(error) => errors.push(error.message))
  expect((await page.request.post('/api/auth/register',{ headers,data:{ fullName:'Alex Morgan',email:`library-${crypto.randomUUID()}@example.com`,password:'library password' } })).status()).toBe(201)
  const checkout=await (await page.request.post('/api/billing/checkout',{ headers })).json()
  expect((await page.request.post(`/api/billing/demo/${checkout.id}`,{ headers,data:{ outcome:'success' } })).status()).toBe(200)
  const ids=[crypto.randomUUID(),crypto.randomUUID()]
  for (const [index,name] of ['Zeta Resume','Alpha Resume'].entries()) expect((await page.request.put(`/api/documents/${ids[index]}`,{ headers,data:{ ...sampleProfile,id:ids[index],kind:'resume',name,templateId:'essential',portfolio:defaultPortfolio } })).status()).toBe(200)
  const slug=`library-${ids[0].slice(0,8)}`
  expect((await page.request.put(`/api/documents/${ids[0]}/publication`,{ headers,data:{ slug,visibility:'public' } })).status()).toBe(200)
  await page.goto('/setup')
  await expect(page.getByLabel('Sort resumes',{exact:true})).toHaveCount(0)
  await expect(page.getByLabel('Search resumes',{exact:true})).toHaveCount(0)
  await expect(page.locator('.resume-library-card')).toHaveCount(2)
  await expect(page.locator('.resume-library-card .library-item-facts')).toHaveCount(0)
  const resume=page.locator('.resume-library-card').filter({has:page.getByRole('heading',{name:'Zeta Resume',exact:true})})
  await expect(page.getByRole('link',{name:'Import resume',exact:true}).locator('svg')).toBeVisible()
  const create=page.getByRole('button',{name:'Create resume',exact:true})
  await expect(create.locator('svg')).toBeVisible()
  const before=await create.evaluate(el=>getComputedStyle(el).backgroundColor)
  await create.hover()
  await expect.poll(()=>create.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(before)
  // Secondary actions stay available to keyboard users; cancelling deletion keeps work safe.
  const more = resume.locator('.resume-card-more summary')
  await expect(resume.getByRole('button', { name:'Delete resume',exact:true })).toBeHidden()
  await more.focus()
  await page.keyboard.press('Enter')
  await expect(resume.getByRole('button', { name:'Delete resume',exact:true })).toBeVisible()
  page.once('dialog', (dialog) => dialog.dismiss())
  await resume.getByRole('button', { name:'Delete resume',exact:true }).click()
  await expect(page.locator('.resume-library-card')).toHaveCount(2)
  await page.keyboard.press('Escape')
  await expect(more).toBeFocused()
  await expect(resume.getByRole('button', { name:'Delete resume',exact:true })).toBeHidden()
  const downloadEvent=page.waitForEvent('download')
  await resume.getByRole('button',{ name:'Download resume',exact:true }).click()
  const download=await downloadEvent
  await download.saveAs(testInfo.outputPath('library-resume.pdf'))
  expect(await download.failure()).toBeNull()
  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  await page.screenshot({path:testInfo.outputPath('resumes-desktop.png'),fullPage:true})
  for(const width of [768,390,320]) {
    await page.setViewportSize({width,height:1000})
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    await expect(resume.getByRole('link',{name:'Edit resume',exact:true})).toBeVisible()
    await page.screenshot({path:testInfo.outputPath(`resumes-${width}.png`),fullPage:true})
  }
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('/setup?view=portfolio')
  await page.getByLabel('Filter portfolios by visibility').selectOption('public')
  await expect(page.locator('.library-wide-card')).toHaveCount(1)
  await expect(page.getByRole('link',{ name:'View live',exact:true })).toHaveAttribute('href',`/p/${slug}`)
  await page.locator('.library-more summary').click()
  await page.getByRole('button',{ name:'Copy link',exact:true }).click()
  await expect(page.locator('.library-notice')).toContainText(/Portfolio link copied|Your portfolio link/)
  await expect(page.getByRole('link', { name:'Customize design',exact:true })).toHaveAttribute('href', `/portfolio/editor/design?resume=${ids[0]}`)
  await expect(page.getByRole('link', { name:'Publish & share',exact:true })).toHaveAttribute('href', `/portfolio/editor/share?resume=${ids[0]}`)
  await page.keyboard.press('Escape')
  await page.getByLabel('Filter portfolios by visibility').selectOption('private')
  await expect(page.locator('.library-wide-card')).toHaveCount(1)
  await expect(page.getByRole('link',{ name:'Publish & share',exact:true })).toBeVisible()
  await page.getByLabel('Filter portfolios by visibility').selectOption('all')
  await page.screenshot({ path:testInfo.outputPath('portfolios-desktop.png'),fullPage:true })
  for (const width of [768,390,320]) {
    await page.setViewportSize({ width,height:1000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    await page.screenshot({ path:testInfo.outputPath(`portfolios-${width}.png`),fullPage:true })
  }
  expect(errors).toEqual([])
})
