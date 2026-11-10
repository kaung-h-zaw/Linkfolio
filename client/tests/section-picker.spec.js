import {test,expect} from '@playwright/test'
import {sampleProfile} from '../src/components/resumeTemplates.js'
import {defaultPortfolio} from '../src/lib/portfolio.js'
import {newProject} from '../src/lib/additionalSections.js'
import {openSectionCard} from './helpers/designControls.js'
const headers={'X-Linkfolio-Request':'1'}
test('portfolio displays all populated customization cards and follows preview selections',async({page},testInfo)=>{
  await page.request.post('/api/auth/register',{headers,data:{fullName:'Sections',email:`sections-${crypto.randomUUID()}@example.com`,password:'sections test password'}})
  const resumeId=crypto.randomUUID(),id=crypto.randomUUID()
  const resume={...sampleProfile,id:resumeId,kind:'resume',name:'Source',templateId:'essential',projects:[],projectsSection:{heading:'Projects',entries:[newProject()]}}
  const portfolio={...resume,id,kind:'portfolio',name:'Portfolio',portfolio:{...defaultPortfolio,sourceResume:{id:resumeId,name:'Source'}}}
  for(const doc of [resume,portfolio])expect((await page.request.put(`/api/documents/${doc.id}`,{headers,data:doc})).status()).toBe(200)
  await page.goto(`/portfolio/editor/design?resume=${id}`)
  const education=await openSectionCard(page,'education')
  await expect(page.locator('[data-section-customization=projects]')).toHaveCount(0)
  await expect(page.locator('[data-section-choice]')).toHaveCount(0)
  await education.getByRole('button',{name:'Education: Timeline',exact:true}).click()
  const selected=page.locator('#editor-preview [data-section=education]').first()
  await expect(selected).toHaveAttribute('data-design-selected','true')
  await expect(selected).toHaveCSS('outline-style','dashed')
  await page.locator('#editor-preview [data-section=skills] h2').first().click()
  await expect(page.locator('[data-section-customization=skills]')).toHaveAttribute('data-selected','true')
  await page.setViewportSize({width:320,height:900})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:testInfo.outputPath('portfolio-section-cards-mobile.png')})
  resume.projectsSection.entries[0].name='New project'
  expect((await page.request.put(`/api/documents/${resumeId}`,{headers,data:resume})).status()).toBe(200)
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')))
  await expect(page.locator('[data-section-customization=projects]')).toBeVisible()
})
