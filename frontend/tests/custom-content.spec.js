import { openSectionCard } from './helpers/designControls.js'
import { test,expect } from './fixtures.js'
import { sampleProfile } from '../src/components/resumeTemplates.js'
import { textDocument } from '../src/lib/summary.js'
const headers={'X-Linkfolio-Request':'1'}
test('a compact content picker creates a named custom section with persisted list and column layouts',async ({page},testInfo) => {
  await page.request.post('/api/auth/register',{headers,data:{fullName:'Custom Owner',email:`custom-${crypto.randomUUID()}@example.com`,password:'custom test password'}})
  const id=crypto.randomUUID()
  const interests={type:'interests',heading:'Interests',entries:[{id:'interest',name:'Accessibility',visible:true,content:textDocument('Existing content is kept.')} ]}
  expect((await page.request.put(`/api/documents/${id}`,{headers,data:{...sampleProfile,id,kind:'resume',name:'Custom resume',templateId:'essential',extraContent:[interests]}})).status()).toBe(200)
  await page.goto(`/editor?resume=${id}`)
  await page.getByRole('button',{name:/Add Content/}).click()
  const dialog=page.getByRole('dialog')
  for(const name of ['Courses','Awards','Organisations','Publications','References','Declaration','Interests','Personal Details']) await expect(dialog.getByRole('button',{name:`Add ${name}`,exact:true})).toHaveCount(0)
  await expect(dialog.getByRole('button',{name:'Add Custom section',exact:true})).toBeVisible()
  await page.screenshot({path:testInfo.outputPath('compact-content-picker.png')})
  await dialog.getByRole('button',{name:'Add Custom section',exact:true}).click()
  await dialog.getByLabel('Section name',{exact:true}).fill('Volunteering')
  await expect(dialog.getByLabel('Show in resume',{exact:true})).toBeChecked()
  await dialog.getByLabel('Show in portfolio',{exact:true}).check()
  await dialog.getByRole('button',{name:'Continue',exact:true}).click()
  await expect(dialog).toHaveCount(0)
  const card=page.locator('#editor-content section').filter({has:page.getByRole('button',{name:'Volunteering',exact:true})}).last()
  let first=true
  for(const [name,details] of [['Community mentor','Mentored new developers.'],['Workshop organiser','Organised accessibility workshops.']]) {
    if(!first)await card.getByRole('button',{name:'Add Entry',exact:true}).click()
    first=false
    await page.getByLabel('Title',{exact:true}).fill(name)
    await page.getByRole('textbox',{name:'Description',exact:true}).fill(details)
    await page.getByRole('button',{name:'Done',exact:true}).click()
  }
  await page.getByRole('button',{name:'Design',exact:true}).click()
  const customDesign=await openSectionCard(page,'custom')
  const section=page.locator('#editor-preview .resume-page [data-section=custom]').first()
  await expect(section.locator('h3')).toHaveText('Volunteering')
  await customDesign.getByRole('button',{name:'Custom section layout: Two columns',exact:true}).click()
  expect((await section.locator('.resume-extra-entries').evaluate((element)=>getComputedStyle(element).gridTemplateColumns.split(' '))).length).toBe(2)
  await expect(section).toContainText('Community mentor')
  await expect(section).toContainText('Workshop organiser')
  await customDesign.getByRole('button',{name:'Custom section layout: List',exact:true}).click()
  expect((await section.locator('.resume-extra-entries').evaluate((element)=>getComputedStyle(element).gridTemplateColumns.split(' '))).length).toBe(1)
  await customDesign.getByRole('button',{name:'Custom section layout: Two columns',exact:true}).click()
  await page.screenshot({path:testInfo.outputPath('custom-section-design.png')})
  await page.setViewportSize({width:320,height:844})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.setViewportSize({width:1440,height:1000})
  await page.getByRole('button',{name:'Save',exact:true}).click()
  await page.getByText('Saved to your account',{exact:true}).first().waitFor()
  await page.reload()
  await expect(section).toHaveAttribute('data-content-layout','columns')
  await expect(page.locator('#editor-preview .resume-page [data-section=interests]')).toContainText('Existing content is kept.')
  const downloadEvent=page.waitForEvent('download')
  await page.getByRole('button',{name:'Download resume',exact:true}).click()
  const download=await downloadEvent
  await download.saveAs(testInfo.outputPath('custom-content.pdf'))
  expect(await download.failure()).toBeNull()
})
