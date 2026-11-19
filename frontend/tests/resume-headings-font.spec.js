import { openGeneralGroup } from './helpers/designControls.js'
import { test, expect } from './fixtures.js'
import { sampleProfile } from '../src/components/resumeTemplates.js'
const headers = { 'X-Linkfolio-Request':'1' }

test('heading and font cards show live styles, preserve independent fonts and save changes', async ({ page }, testInfo) => {
  await page.request.post('/api/auth/register', {headers,data:{fullName:'Font owner',email:`heading-font-${crypto.randomUUID()}@example.com`,password:'heading font password'}})
  const id=crypto.randomUUID()
  expect((await page.request.put(`/api/documents/${id}`,{headers,data:{...sampleProfile,id,kind:'resume',name:'Heading and font cards',templateId:'classic'}})).status()).toBe(200)
  await page.setViewportSize({width:1440,height:1000})
  await page.goto(`/editor?resume=${id}`)
  const editor=page.getByRole('navigation',{name:'Editor navigation',exact:true})
  await editor.getByRole('button',{name:'Design',exact:true}).click()
  await openGeneralGroup(page,'Headings')
  const headings=page.getByRole('region',{name:'Section headings',exact:true})
  const font=page.getByRole('region',{name:'Font',exact:true})
  const paper=page.locator('#editor-preview .resume-page').first()
  const heading=paper.locator('[data-section=experience] > h3').first()
  for (const [label,key] of [['Plain','plain'],['Underline','rule'],['Shaded','band'],['Short underline','short'],['Left accent','accent'],['Double line','double'],['Centered lines','overline'],['Original','template']]) {
    await headings.getByRole('button',{name:`Heading style: ${label}`,exact:true}).click()
    await expect(paper).toHaveAttribute('data-headings',key)
    if(key!=='template') await expect(heading).toHaveCSS('text-align',['band','overline'].includes(key)?'center':'left')
    if(key==='plain') await expect(heading).toHaveCSS('border-bottom-width','0px')
    if(key==='rule') await expect(heading).toHaveCSS('border-bottom-style','solid')
    if(key==='short') await expect(heading).toHaveCSS('border-top-width','0px')
    if(key==='accent') { await expect(heading).toHaveCSS('border-left-style','solid'); await expect(heading).toHaveCSS('border-bottom-width','0px') }
    if(key==='double') await expect(heading).toHaveCSS('border-bottom-style','double')
    if(key==='overline') { await expect(heading).toHaveCSS('border-top-style','solid'); await expect(heading).toHaveCSS('border-bottom-style','solid') }
  }
  await headings.getByRole('button',{name:'Heading style: Short underline',exact:true}).click()
  await headings.getByRole('button',{name:'Heading capitalization: Capitalize',exact:true}).click()
  await expect(heading).toHaveCSS('text-transform','capitalize')
  await headings.getByRole('button',{name:'Heading capitalization: Uppercase',exact:true}).click()
  await expect(heading).toHaveCSS('text-transform','uppercase')
  await headings.getByRole('button',{name:'Heading icons: Outline',exact:true}).click()
  await expect(heading.locator('svg')).toHaveAttribute('fill','none')
  await headings.getByRole('button',{name:'Heading icons: Filled',exact:true}).click()
  await expect(heading.locator('svg')).toHaveAttribute('fill','currentColor')
  await openGeneralGroup(page,'Font')
  await expect(font.getByRole('combobox')).toHaveCount(2)
  await font.getByLabel('Body font',{exact:true}).selectOption('Georgia, serif')
  await expect(paper).toHaveCSS('font-family','Georgia, serif')
  await expect(paper.locator('header h2')).toHaveCSS('font-family','Georgia, serif')
  await font.getByLabel('Name font',{exact:true}).selectOption('Arial, sans-serif')
  await font.getByLabel('Body font',{exact:true}).selectOption('serif')
  await expect(paper.locator('header h2')).toHaveCSS('font-family','Arial, sans-serif')
  await page.getByRole('button',{name:'Save',exact:true}).click()
  await expect(page.locator('.editor-navigation-bar').getByRole('status')).toContainText('Saved to your account')
  await page.reload()
  await editor.getByRole('button',{name:'Design',exact:true}).click()
  await expect(font.getByLabel('Name font',{exact:true})).toHaveValue('Arial, sans-serif')
  await expect(paper).toHaveAttribute('data-headings','short')
  await expect(paper).toHaveAttribute('data-heading-case','uppercase')
  await font.getByLabel('Name font',{exact:true}).selectOption('template')
  await expect(paper.locator('header h2')).toHaveCSS('font-family','serif')
  for(const width of [1440,768,390,320]) {
    await page.setViewportSize({width,height:1000})
    for(const [button,card] of [['Headings',headings],['Font',font]]) {
      await openGeneralGroup(page,button)
      await expect.poll(async()=>{ const cardBox=await card.boundingBox(),paneBox=await page.locator('#editor-content').boundingBox(); return cardBox.y >= paneBox.y && cardBox.y < paneBox.y + paneBox.height * 0.35 }).toBe(true)
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
      await page.screenshot({path:testInfo.outputPath(`${button.toLowerCase()}-${width}.png`)})
    }
  }
  await page.setViewportSize({width:1440,height:1000})
  await expect(paper).toBeVisible()
  await font.getByRole('button',{name:'Reset fonts',exact:true}).click()
  await expect(font.getByLabel('Body font',{exact:true})).toHaveValue('template')
  await expect(paper).toHaveAttribute('data-headings','short')
  await headings.getByRole('button',{name:'Reset section headings',exact:true}).click()
  await expect(paper).toHaveAttribute('data-headings','template')
  await expect(heading.locator('svg')).toHaveCount(0)
})
