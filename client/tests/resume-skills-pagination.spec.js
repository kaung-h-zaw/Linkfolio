import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'
import {sampleProfile} from '../src/components/resumeTemplates.js'
import {getDesign} from '../src/lib/resumeDesign.js'
import {getExperience} from '../src/lib/experience.js'
import {getSkills} from '../src/lib/educationSkills.js'
import {textDocument} from '../src/lib/summary.js'
import {openSectionCard} from './helpers/designControls.js'
const headers={'X-Linkfolio-Request':'1'}
test('Skills moves intact to a new page and oversized sections still paginate',async({page},testInfo)=>{
  await page.request.post('/api/auth/register',{headers,data:{fullName:'Skills owner',email:`skills-pages-${crypto.randomUUID()}@example.com`,password:'skills pagination password'}})
  const id=crypto.randomUUID(),experience=getExperience(structuredClone(sampleProfile)),skills=getSkills(structuredClone(sampleProfile))
  experience.entries=experience.entries.slice(0,1)
  experience.entries[0].content=textDocument(Array.from({length:24},(_,index)=>`Work detail ${index+1}`).join('\n'))
  const description='JavaScript, React, Node.js, Express, SQL, API design, accessibility, testing, Git and collaboration.'
  skills.entries=skills.entries.slice(0,3).map((item,index)=>({...item,name:['Core frameworks','Tools and workflow','Styling and UI'][index],content:textDocument(description)}))
  const profile={...sampleProfile,id,kind:'resume',name:'Skills page breaks',templateId:'essential',experienceSection:experience,skillsSection:skills,removedSections:['education','projects','languages','summary'],design:getDesign({fontSize:14,lineHeight:1.35,entryLayout:'full',sectionOrder:['experience','skills','certifications'],sectionStyles:{skills:{contentLayout:'columns',columns:2}}})}
  expect((await page.request.put(`/api/documents/${id}`,{headers,data:profile})).status()).toBe(200)
  await page.goto(`/editor?resume=${id}`)
  const pages=page.locator('#editor-preview .resume-page'),skillSections=pages.locator('[data-section=skills]')
  await expect.poll(()=>pages.count()).toBeGreaterThan(1)
  await expect(skillSections).toHaveCount(1)
  await expect(pages.first().locator('[data-section=skills]')).toHaveCount(0)
  await expect(pages.nth(1).locator('[data-section=skills]')).toHaveCount(1)
  await expect(skillSections.locator('.resume-skill')).toHaveCount(3)
  const dimensions=await pages.first().evaluate(node=>{
    const scale=node.getBoundingClientRect().width/node.offsetWidth,section=node.querySelector('[data-section=experience]'),rect=node.getBoundingClientRect(),style=getComputedStyle(node)
    return {remaining:(rect.bottom-section.getBoundingClientRect().bottom)/scale-parseFloat(style.paddingBottom)}
  })
  const rowHeight=await skillSections.locator('.resume-skill').first().evaluate(node=>node.offsetHeight)
  const headingHeight=await skillSections.locator('h3').evaluate(node=>node.offsetHeight+parseFloat(getComputedStyle(node).marginBottom))
  expect(dimensions.remaining).toBeGreaterThan(rowHeight+headingHeight)
  await skillSections.screenshot({path:testInfo.outputPath('whole-skills-next-page.png')})
  const expectedPages=await pages.count(),event=page.waitForEvent('download')
  await page.getByRole('button',{name:'Download resume',exact:true}).click()
  const download=await event,path=testInfo.outputPath('skills-pages.pdf');await download.saveAs(path)
  const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs')
  const pdf=await getDocument({data:new Uint8Array(await readFile(path)),useSystemFonts:true}).promise
  expect(pdf.numPages).toBe(expectedPages)
  for(const width of [1024,768,390]){
    await page.setViewportSize({width,height:900})
    if(width<768)await page.getByRole('button',{name:'Preview',exact:true}).click()
    await expect(skillSections).toHaveCount(1)
    await expect(pages.nth(1).locator('[data-section=skills] .resume-skill')).toHaveCount(3)
  }
  await page.setViewportSize({width:1440,height:1000})
  await page.getByRole('button',{name:'Close preview',exact:true}).click()
  await page.getByRole('navigation',{name:'Editor navigation',exact:true}).getByRole('button',{name:'Design',exact:true}).click()
  const certificates=await openSectionCard(page,'certifications')
  await expect(certificates.getByRole('button',{name:/Level/})).toHaveCount(0)
  skills.entries=Array.from({length:65},(_,index)=>({...skills.entries[0],id:`skill-${index}`,name:`Skill group ${index+1}`}))
  profile.skillsSection=skills;profile.design.sectionStyles.skills={contentLayout:'list'}
  expect((await page.request.put(`/api/documents/${id}`,{headers,data:profile})).status()).toBe(200)
  await page.reload()
  await expect.poll(()=>skillSections.count()).toBeGreaterThan(1)
  await expect(skillSections.locator('.resume-skill h4')).toHaveCount(65)
  for(const section of await skillSections.all()){
    expect(await section.evaluate(node=>Number(getComputedStyle(node).zoom))).toBe(1)
    const parent=await section.locator('..').boundingBox(),box=await section.boundingBox()
    expect(box.y+box.height).toBeLessThanOrEqual(parent.y+parent.height)
  }
})
