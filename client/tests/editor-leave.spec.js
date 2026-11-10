import { openGeneralGroup } from './helpers/designControls.js'
import { setControlValue } from './helpers/designControls.js'
import { test, expect } from '@playwright/test'
import { sampleProfile } from '../src/components/resumeTemplates.js'
import { defaultPortfolio } from '../src/lib/portfolio.js'
const headers = { 'X-Linkfolio-Request': '1' }

test('Home offers save, discard and cancel for unsaved resume and portfolio edits', async ({ page }, testInfo) => {
  await page.request.post('/api/auth/register', { headers, data: { fullName: 'Editor owner', email: `leave-${crypto.randomUUID()}@example.com`, password: 'editor password' } })
  const id = crypto.randomUUID()
  for (const portfolio of [false, true]) {
    expect((await page.request.put(`/api/documents/${id}`, { headers, data: { ...sampleProfile, id, kind: 'resume', name: 'Leaving editor', templateId: 'essential', portfolio: defaultPortfolio } })).status()).toBe(200)
    const url = `${portfolio ? '/portfolio/editor' : '/editor'}?resume=${id}`
    const home = page.getByRole('link', { name: 'Home', exact: true })
    const prompt = page.getByRole('dialog', { name: 'Save changes?', exact: true })
    async function editDesign() {
      await page.getByRole('navigation', { name: 'Editor navigation', exact: true }).getByRole('button', { name: 'Design', exact: true }).click()
      await openGeneralGroup(page,'Text sizes')
      return page.getByRole('slider', { name: portfolio ? 'Body text size' : 'Body size', exact: true })
    }
    await page.goto(url)
    await home.click()
    await expect(page.getByRole('heading', { name: portfolio ? 'Your dashboard' : 'My resumes', exact: true })).toBeVisible()
    await page.goto(url)
    const body = await editDesign()
    const original = await body.inputValue()
    const changed = original === '16' ? '17' : '16'
    await setControlValue(body,changed)
    await home.click()
    await expect(prompt).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath(portfolio ? 'portfolio-save-prompt.png' : 'resume-save-prompt.png') })
    await prompt.getByRole('button', { name: 'Close save prompt', exact: true }).click()
    await expect(body).toHaveValue(changed)
    await expect(home).toBeFocused()
    await home.click()
    await page.keyboard.press('Escape')
    await expect(prompt).toHaveCount(0)
    await home.click()
    await prompt.getByRole('button', { name: 'Don’t save', exact: true }).click()
    await expect(page.getByRole('heading', { name: portfolio ? 'Your dashboard' : 'My resumes', exact: true })).toBeVisible()
    await page.goto(url)
    const restored = await editDesign()
    await expect(restored).toHaveValue(original)
    await setControlValue(restored,changed)
    await home.click()
    await page.route(`**/api/documents/${id}`, (route) => route.request().method() === 'PUT' ? route.fulfill({ status: 500, json: { error: 'Try again' } }) : route.continue())
    await prompt.getByRole('button', { name: 'Save & leave', exact: true }).click()
    await expect(prompt.getByRole('alert')).toContainText('Could not save')
    await expect(prompt).toBeVisible()
    await page.unroute(`**/api/documents/${id}`)
    await prompt.getByRole('button', { name: 'Save & leave', exact: true }).click()
    await expect(page.getByRole('heading', { name: portfolio ? 'Your dashboard' : 'My resumes', exact: true })).toBeVisible()
    await page.goto(url)
    await expect(await editDesign()).toHaveValue(changed)
    await home.click()
    await expect(page.getByRole('heading', { name: portfolio ? 'Your dashboard' : 'My resumes', exact: true })).toBeVisible()
  }
})
