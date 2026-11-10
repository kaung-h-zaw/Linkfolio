import { test, expect } from '@playwright/test'
import assert from 'node:assert/strict'

test('account, resume export, public portfolio, messages, analytics, payments and privacy', async ({
  page,
  browser,
  baseURL,
}, testInfo) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  const email = `ui-${Date.now()}@example.com`
  try {
    await page.goto('/editor')
    await page.waitForURL('**/login')
    await page.getByRole('link', { name: 'Create an account' }).click()
    await page.getByLabel('Full Name', { exact: true }).fill('Linkfolio UI Tester')
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill('testing password')
    await page.getByLabel('Confirm Password', { exact: true }).fill('testing password')
    await page.getByRole('button', { name: 'Create account', exact: true }).click()
    await page.waitForURL('**/setup')
    await page.getByRole('button', { name: 'Create resume', exact: true }).click()
    await page.getByRole('button', { name: /^Create a new resume/ }).click()
    for (const name of ['Harvard', 'MIT', 'Bajaj Developer']) {
      await page.getByRole('button', { name: `Preview ${name} template`, exact: true }).waitFor()
    }
    await page.screenshot({ path: testInfo.outputPath('template-gallery.png'), fullPage: true })
    await page.getByRole('button', { name: 'Preview Harvard template', exact: true }).click()
    await page.getByRole('link', { name: 'View original reference' }).waitFor()
    await page.screenshot({ path: testInfo.outputPath('harvard-template.png'), fullPage: true })
    await page.getByRole('button', { name: 'Close template preview' }).click()
    await page.getByRole('button', { name: 'Preview Bajaj Developer template', exact: true }).click()
    await page.screenshot({ path: testInfo.outputPath('bajaj-template.png'), fullPage: true })
    await page.getByRole('button', { name: 'Close template preview' }).click()
    await page.getByRole('button', { name: 'Preview MIT template', exact: true }).click()
    await page.screenshot({ path: testInfo.outputPath('mit-template.png'), fullPage: true })
    await page.getByRole('button', { name: 'Use this template', exact: true }).click()
    await page.waitForURL('**/editor?template=essential')
    await page.getByRole('heading', { name: 'Resume content', exact: true }).waitFor()
    assert.equal(
      await page.locator('#editor-preview').getByText('Alex Morgan', { exact: true }).count(),
      0,
    )
    await page.getByRole('button', { name: 'Edit personal details', exact: true }).click()
    await page.getByLabel('Professional title', { exact: true }).fill('Software Developer')
    await page.getByRole('button', { name: 'Done', exact: true }).click()
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await page.getByText('Saved to your account', { exact: true }).first().waitFor()
    const downloadEvent = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download resume', exact: true }).click()
    const download = await downloadEvent
    await download.saveAs(testInfo.outputPath('resume.pdf'))
    console.log('PDF downloaded:', download.suggestedFilename())
    await page.getByRole('link', { name: 'Home', exact: true }).click()
    await page.getByRole('navigation', { name:'Workspace', exact:true }).getByRole('link', { name:'Resume', exact:true }).click()
    await page.locator('.resume-card-more summary').click()
    await page.getByRole('button', { name: 'Generate portfolio', exact: true }).click()
    await page.waitForURL('**/portfolio/editor?resume=*')
    const slug = `ui-portfolio-${Date.now()}`
    await page.getByRole('button', { name: 'Sharing', exact: true }).click()
    await page.getByRole('button', { name: 'Edit URL', exact: true }).click()
    await page.getByLabel('Portfolio URL', { exact: true }).fill(slug)
    await page.getByRole('button', { name: 'Save URL', exact: true }).click()
    await expect(page.getByText('Portfolio URL updated.', { exact: true })).toBeVisible()
    await page.getByLabel('Visibility', { exact: true }).selectOption('public')
    await page.getByRole('button', { name: 'Publish portfolio', exact: true }).click()
    await page.getByText('Your portfolio is published.', { exact: true }).waitFor()
    await page.screenshot({ path: testInfo.outputPath('editor.png'), fullPage: true })
    const visitorContext = await browser.newContext({
      baseURL,
      viewport: { width: 390, height: 844 },
    })
    const visitor = await visitorContext.newPage()
    visitor.on('pageerror', (e) => errors.push(e.message))
    await visitor.goto(`/p/${slug}`)
    await visitor.getByRole('heading', { name: 'Software Developer', exact: true }).waitFor()
    await visitor.getByLabel('Your name', { exact: true }).fill('Portfolio Visitor')
    await visitor.getByLabel('Your email', { exact: true }).fill('visitor@example.com')
    await visitor.getByLabel('Message', { exact: true }).fill('Hello from the public portfolio!')
    await visitor.getByRole('button', { name: 'Send message', exact: true }).click()
    await visitor.getByText('Your message has been sent.', { exact: true }).waitFor()
    const toastBounds = await visitor.getByRole('status').boundingBox()
    expect(toastBounds.y + toastBounds.height).toBeLessThanOrEqual(844)
    await visitor.screenshot({ path: testInfo.outputPath('public-mobile.png'), fullPage: true })
    assert.ok(
      await visitor.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      'mobile overflow',
    )
    await expect(visitor.getByRole('status')).toContainText('Message sent')
    await visitor.getByRole('button', { name: 'Dismiss message confirmation' }).click()
    await page.goto('/messages')
    await expect(page.getByLabel('1 unread messages', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Open message from Portfolio Visitor', exact: true }).click()
    await page.getByRole('button', { name: 'Mark as unread', exact: true }).waitFor()
    await expect(page.getByLabel('1 unread messages', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Reply by email', exact: true })).toHaveAttribute('href', 'mailto:visitor@example.com')
    await page.getByRole('button', { name: 'Mark as unread', exact: true }).click()
    await page.getByRole('button', { name: 'Mark as read', exact: true }).waitFor()
    await expect(page.getByLabel('1 unread messages', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: '← Back to inbox', exact: true }).click()
    await visitor.getByLabel('Your name', { exact: true }).fill('Another Visitor')
    await visitor.getByLabel('Your email', { exact: true }).fill('another@example.com')
    await visitor.getByLabel('Message', { exact: true }).fill('A second message arriving while the inbox is open.')
    await visitor.getByRole('button', { name: 'Send message', exact: true }).click()
    await visitor.getByText('Your message has been sent.', { exact: true }).waitFor()
    await expect(page.getByLabel('2 unread messages', { exact: true })).toBeVisible({ timeout: 25000 })
    await expect(page.getByRole('button', { name: 'Open message from Another Visitor', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Unread (2)', exact: true }).click()
    await page.screenshot({ path: testInfo.outputPath('message-inbox-desktop.png'), fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({ path: testInfo.outputPath('message-inbox-mobile.png'), fullPage: true })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.getByRole('button', { name: 'Open message from Another Visitor', exact: true }).click()
    await page.getByRole('button', { name: 'Mark as unread', exact: true }).waitFor()
    await page.screenshot({ path: testInfo.outputPath('message-detail-mobile.png'), fullPage: true })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto('/analytics')
    await page.getByRole('heading', { name: 'Link clicks', exact: true }).waitFor()
    await page.goto('/premium')
    await page.getByRole('button', { name: 'Try demo upgrade', exact: true }).click()
    await page.getByRole('button', { name: 'Simulate failed payment', exact: true }).click()
    await page
      .getByText('Demo payment failed. Your plan has not changed.', { exact: true })
      .waitFor()
    await page.getByRole('button', { name: 'Try demo upgrade', exact: true }).click()
    await page.getByRole('button', { name: 'Simulate successful payment', exact: true }).click()
    await page.getByText('Demo payment successful. Premium is active.', { exact: true }).waitFor()
    await page.goto(`/setup?view=portfolio`)
    await page
      .getByRole('link', { name: 'Edit portfolio for Linkfolio UI Tester', exact: true })
      .click()
    await page.getByRole('button', { name: 'Sharing', exact: true }).click()
    await page.getByLabel('Visibility', { exact: true }).selectOption('private')
    await page.getByRole('button', { name: 'Save private portfolio', exact: true }).click()
    await page
      .getByText('Your portfolio is private. Visitors cannot access it.', { exact: true })
      .waitFor()
    await visitor.reload()
    await visitor.getByRole('heading', { name: 'Portfolio unavailable', exact: true }).waitFor()
    await page.goto('/dashboard')
    await page.getByText('Welcome back, Linkfolio UI Tester', { exact: true }).waitFor()
    await page.screenshot({ path: testInfo.outputPath('dashboard.png'), fullPage: true })
    await page.goto('/account')
    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await page.waitForURL('http://localhost:4173/')
    await page.getByRole('link', { name: 'Sign in', exact: true }).click()
    await page.waitForURL('**/login')
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill('testing password')
    await page.getByRole('button', { name: 'Sign In', exact: true }).click()
    await page.waitForURL('**/setup')
    await page.getByRole('link', { name: 'Resume', exact: true }).click()
    await page
      .getByRole('link', { name: 'Open Linkfolio UI Tester — Resume', exact: true })
      .waitFor()
    assert.deepEqual(errors, [])
    console.log(
      'PASS: protected routes, registration, blank draft, resume save, PDF download, linked portfolio generation, publish, mobile public contact, inbox, analytics, failed/successful demo payments, privacy, logout/login persistence; no browser errors.',
    )
  } catch (e) {
    console.log('Page on failure:', page.url(), await page.locator('body').innerText())
    throw e
  } finally {
    /* Browser lifecycle is managed by Playwright. */
  }
})
