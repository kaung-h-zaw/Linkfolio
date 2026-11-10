import { test, expect } from '@playwright/test'
import { emptyProfile } from '../src/lib/profile.js'
import { defaultPortfolio } from '../src/lib/portfolio.js'
import { newLanguage } from '../src/lib/additionalSections.js'
const headers = {'X-Linkfolio-Request':'1'}
test('legacy resume content populates portfolio editing, copying and publication', async ({page}) => {
  await page.request.post('/api/auth/register',{headers,data:{fullName:'Resume Reader',email:`reader-${crypto.randomUUID()}@example.com`,password:'reader test password'}})
  const id = crypto.randomUUID()
  const source = {...emptyProfile,id,name:'Source resume',kind:'resume',templateId:'essential',portfolio:defaultPortfolio,
    personal:{...emptyProfile.personal,fullName:'Resume Reader',headline:'Developer',email:'reader@example.com',location:'Bangkok',summary:'I build accessible websites.'},
    experience:[{id:'legacy-job',jobTitle:'Web Developer',company:'Example Studio',location:'Bangkok',startDate:'2023-01',endDate:'2024-12',description:'Built accessible websites.'}],
    education:[{id:'legacy-edu',degree:'Computer Science',institution:'Example University',location:'Brisbane',description:'Studied computing.'}],
    skills:['React','JavaScript'],projects:[{id:'legacy-project',name:'Resume Project',description:'A working product.'}],certificates:[{id:'legacy-cert',name:'Web Certificate',issuer:'Example Academy'}],
    languagesSection:{heading:'Languages',entries:[{...newLanguage(),name:'English',level:'Fluent'}]},
  }
  expect((await page.request.put(`/api/documents/${id}`,{headers,data:source})).status()).toBe(200)
  await page.goto(`/portfolio/editor?resume=${id}`)
  await expect(page.locator('#editor-preview')).toContainText('Web Developer')
  await expect(page.getByRole('button',{name:/Professional Experience/})).toHaveCount(0)
  await expect(page.getByRole('button',{name:'Edit resume',exact:true})).toBeVisible()
  await expect(page.getByLabel('Short introduction',{exact:true})).toHaveCount(0)
  await expect(page.locator('#editor-preview [data-section=about]')).toContainText('I build accessible websites.')
  await expect(page.locator('#editor-content')).toContainText('Source resume')
  await page.getByRole('button',{name:'Save',exact:true}).click()
  await page.getByText('Saved to your account',{exact:true}).first().waitFor()
  const slug = `reader-${id.slice(0,8)}`
  expect((await page.request.put(`/api/documents/${id}/publication`,{headers,data:{slug,visibility:'public'}})).status()).toBe(200)
  const published = await (await page.request.get(`/api/public/portfolios/${slug}`)).json()
  expect(published.profile.experienceSection.entries[0].location).toBe('Bangkok')
  expect(published.profile.languagesSection.entries[0].name).toBe('English')
  await page.goto('/premium')
  await page.getByRole('button',{name:'Try demo upgrade',exact:true}).click()
  await page.getByRole('button',{name:'Simulate successful payment',exact:true}).click()
  await page.getByText('Demo payment successful. Premium is active.',{exact:true}).waitFor()
  const target = crypto.randomUUID()
  expect((await page.request.put(`/api/documents/${target}`,{headers,data:{...emptyProfile,id:target,kind:'portfolio',name:'Blank portfolio',templateId:'essential',portfolio:{...defaultPortfolio,design:{font:'serif'}}}})).status()).toBe(200)
  await page.goto(`/portfolio/editor?resume=${target}`)
  await page.getByLabel('Resume',{exact:true}).selectOption(id)
  await expect(page.locator('#editor-preview')).toContainText('Resume Project')
  await expect(page.locator('#editor-preview')).toContainText('Computer Science')
  await expect(page.locator('#editor-preview')).toContainText('English')
  await expect(page.locator('#editor-preview h1')).toHaveCSS('font-family','Georgia, serif')
  await page.getByRole('button',{name:'Save',exact:true}).click()
  await page.getByText('Saved to your account',{exact:true}).first().waitFor()
  await page.reload()
  await expect(page.getByLabel('Resume',{exact:true})).toHaveValue(id)
  await expect(page.locator('#editor-content')).toContainText('Source resume')
  await expect(page.locator('#editor-preview')).toContainText('Web Certificate')
  await expect(page.locator('#editor-preview')).toContainText('Web Developer')
})
