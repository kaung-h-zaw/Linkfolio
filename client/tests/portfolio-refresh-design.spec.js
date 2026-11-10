import {test,expect} from '@playwright/test'
import {sampleProfile} from '../src/components/resumeTemplates.js'
import {defaultPortfolio} from '../src/lib/portfolio.js'
import {openGeneralGroup,openSectionCard,setControlValue} from './helpers/designControls.js'
const headers={'X-Linkfolio-Request':'1'}
test('portfolio refreshes saved resume content without losing design edits, with compact design groups',async({page},testInfo)=>{
  await page.request.post('/api/auth/register',{headers,data:{fullName:'Synced owner',email:`sync-${crypto.randomUUID()}@example.com`,password:'portfolio refresh password'}})
  const resumeId=crypto.randomUUID(),portfolioId=crypto.randomUUID()
  const resume={...sampleProfile,id:resumeId,kind:'resume',name:'Source resume',templateId:'essential'}
  const portfolio={...resume,id:portfolioId,kind:'portfolio',name:'Linked portfolio',portfolio:{...defaultPortfolio,sourceResume:{id:resumeId,name:resume.name}}}
  for(const doc of [resume,portfolio])expect((await page.request.put(`/api/documents/${doc.id}`,{headers,data:doc})).status()).toBe(200)
  await page.goto(`/portfolio/editor/design?resume=${portfolioId}`)
  await expect(page.getByRole('tablist',{name:'Customization'})).toHaveCount(0)
  await expect(page.getByRole('button',{name:'Text sizes',exact:true})).toHaveCount(0)
  await openGeneralGroup(page,'Text sizes')
  await setControlValue(page.getByRole('slider',{name:'Body text size',exact:true}),18)
  const newResume={...resume,personal:{...resume.personal,headline:'Updated full-stack developer'}}
  expect((await page.request.put(`/api/documents/${resumeId}`,{headers,data:newResume})).status()).toBe(200)
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')))
  await expect(page.locator('#editor-preview h1')).toHaveText(newResume.personal.headline)
  await expect(page.getByRole('slider',{name:'Body text size',exact:true})).toHaveValue('18')
  const projects=await openSectionCard(page,'projects')
  await expect(page.locator('[data-section-choice]')).toHaveCount(0)
  await expect(page.locator('[data-section-customization=experience]')).toBeVisible()
  await projects.getByRole('button',{name:'Projects: Featured first',exact:true}).click()
  await expect(page.locator('#editor-preview [data-section=projects]')).toHaveAttribute('data-layout','feature')
  await page.screenshot({path:testInfo.outputPath('portfolio-sections.png')})
  await page.getByRole('button',{name:'Save',exact:true}).click()
  await expect(page.locator('.editor-navigation-bar [role=status]')).toContainText('Saved to your account')
  // A later source update must not turn a saved portfolio into an unsaved draft.
  expect((await page.request.put(`/api/documents/${resumeId}`,{headers,data:{...newResume,personal:{...newResume.personal,headline:'Latest saved headline'}}})).status()).toBe(200)
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')))
  await expect(page.locator('#editor-preview h1')).toHaveText('Latest saved headline')
  await page.getByRole('link',{name:'Home',exact:true}).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.goto(`/portfolio/editor/design?resume=${portfolioId}`)
  await openGeneralGroup(page,'Text sizes')
  await expect(page.getByRole('slider',{name:'Body text size',exact:true})).toHaveValue('18')
  await expect(page.locator('#editor-preview h1')).toHaveText('Latest saved headline')
  await page.setViewportSize({width:320,height:900})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:testInfo.outputPath('portfolio-general-mobile.png')})
  await page.setViewportSize({width:1440,height:1000})
  await page.getByRole('link',{name:'Home',exact:true}).click()
  await page.goto(`/editor?resume=${resumeId}`)
  await page.getByRole('button',{name:'Edit personal details',exact:true}).click()
  await page.getByLabel('Professional title',{exact:true}).fill('Saved in this session')
  await page.getByRole('button',{name:'Done',exact:true}).click()
  await page.getByRole('button',{name:'Save',exact:true}).click()
  await expect(page.locator('.editor-navigation-bar [role=status]')).toContainText('Saved to your account')
  await page.getByRole('link',{name:'Home',exact:true}).click()
  await page.getByRole('navigation',{name:'Workspace',exact:true}).getByRole('link',{name:'Portfolio',exact:true}).click()
  await page.getByRole('link',{name:'Edit portfolio',exact:true}).click()
  await page.setViewportSize({width:1440,height:1000})
  await expect(page.locator('#editor-preview h1')).toHaveText('Saved in this session')
})

test('every portfolio editor and owner-preview opening fetches the saved source again',async({page})=>{
  await page.request.post('/api/auth/register',{headers,data:{fullName:'Every visit',email:`visit-${crypto.randomUUID()}@example.com`,password:'portfolio refresh password'}})
  const resumeId=crypto.randomUUID(),portfolioId=crypto.randomUUID()
  const resume={...sampleProfile,id:resumeId,kind:'resume',name:'Source resume',templateId:'essential'}
  const portfolio={...resume,id:portfolioId,kind:'portfolio',name:'Linked portfolio',portfolio:{...defaultPortfolio,sourceResume:{id:resumeId,name:resume.name},design:{bodySize:18}}}
  for(const doc of [resume,portfolio])expect((await page.request.put(`/api/documents/${doc.id}`,{headers,data:doc})).status()).toBe(200)
  const update=async headline=>expect((await page.request.put(`/api/documents/${resumeId}`,{headers,data:{...resume,personal:{...resume.personal,headline}}})).status()).toBe(200)
  const freshRequest=()=>page.waitForResponse(response=>response.url().endsWith('/api/documents')&&response.request().method()==='GET'&&response.ok())
  await page.goto(`/portfolio?resume=${portfolioId}`)
  await expect(page.locator('.portfolio-site h1')).toHaveText(resume.personal.headline)
  for(let visit=1;visit<=2;visit++) {
    await update(`Editor visit ${visit}`)
    let refreshed=freshRequest()
    await page.getByRole('link',{name:'Edit portfolio',exact:true}).click()
    await refreshed
    await expect(page.locator('#editor-preview h1')).toHaveText(`Editor visit ${visit}`)
    await update(`Preview visit ${visit}`)
    refreshed=freshRequest()
    await page.goBack()
    await refreshed
    await expect(page.locator('.portfolio-site h1')).toHaveText(`Preview visit ${visit}`)
  }
  await update('Returned from another tab')
  let refreshed=freshRequest()
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')))
  await refreshed
  await expect(page.locator('.portfolio-site h1')).toHaveText('Returned from another tab')
  await update('Restored from browser history')
  refreshed=freshRequest()
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})))
  await refreshed
  await expect(page.locator('.portfolio-site h1')).toHaveText('Restored from browser history')
})
