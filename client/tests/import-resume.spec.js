import { test, expect } from './fixtures.js'
import { jsPDF } from 'jspdf'
import { fileURLToPath } from 'node:url'
import { Buffer } from 'node:buffer'

const text = `Taylor Import
Software Developer
taylor@example.com
Summary
Developer building accessible applications.
Experience
Engineer at Example Company
Built a reliable booking system.
Education
BSc Computing at Example University
Skills
JavaScript, React, Node.js
Projects
Linkfolio resume builder
References
Available on request.`
const headers = { 'X-Linkfolio-Request': '1' }

async function signIn(page) {
  const result = await page.request.post('/api/auth/register', {
    headers,
    data: {
      fullName: 'Import Tester',
      email: `import-${crypto.randomUUID()}@example.com`,
      password: 'import test password',
    },
  })
  expect(result.status()).toBe(201)
  await page.goto('/setup')
  await page.getByRole('button', { name: 'Create resume', exact: true }).click()
  await page.getByRole('button', { name: /^Import existing resume/ }).click()
  await expect(page.getByRole('dialog', { name: 'Import Resume', exact: true })).toBeVisible()
}

for (const format of ['txt', 'docx', 'pdf']) {
  test(`import ${format}, edit, persist and import without a quota`, async ({ page }, testInfo) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await signIn(page)
    const input = page.getByLabel('Resume file', { exact: true })
    if (format === 'docx') {
      await input.setInputFiles(fileURLToPath(new URL('./fixtures/resume.docx', import.meta.url)))
    } else {
      let buffer = Buffer.from(text)
      if (format === 'pdf') {
        const pdf = new jsPDF()
        pdf.text(text.split('\n'), 20, 20)
        buffer = Buffer.from(pdf.output('arraybuffer'))
      }
      await input.setInputFiles({
        name: `resume.${format}`,
        mimeType: format === 'pdf' ? 'application/pdf' : 'text/plain',
        buffer,
      })
    }
    await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('Taylor Import')
    await expect(page.getByLabel('Email', { exact: true })).toHaveValue('taylor@example.com')
    await expect(page.getByLabel('Resume text', { exact: true })).toHaveValue(
      /Built a reliable booking system/,
    )
    if (format === 'txt') {
      await page.getByText('Review extracted text', { exact: true }).click()
      await page.getByLabel('Resume text', { exact: true }).fill(text.replace('JavaScript, React, Node.js', 'JavaScript, React, Node.js, Figma'))
      await expect(page.getByRole('button', { name: 'Open in editor', exact: true })).toBeDisabled()
      await page.getByRole('button', { name: 'Update detected fields from text', exact: true }).click()
      await expect(page.getByRole('button', { name: 'Open in editor', exact: true })).toBeEnabled()
    }
    await page.getByLabel('Professional title', { exact: true }).fill('Imported Software Developer')
    if (format === 'txt') {
      await page.screenshot({ path: testInfo.outputPath('import-desktop.png'), fullPage: true })
      await page.setViewportSize({ width: 390, height: 844 })
      await page.screenshot({ path: testInfo.outputPath('import-mobile.png'), fullPage: true })
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true)
    }
    await page.getByRole('button', { name: 'Open in editor', exact: true }).click()
    await page.waitForURL('**/editor?resume=*')
    await expect(page.locator('#editor-preview')).toContainText('Imported Software Developer')
    await expect(page.locator('#editor-preview')).toContainText('Built a reliable booking system.')
    await page.reload()
    await expect(page.locator('#editor-preview')).toContainText('Example University')
    const result = await page.request.get('/api/documents')
    const { documents } = await result.json()
    expect(documents).toHaveLength(1)
    expect(documents[0].skillsSection.entries.map((entry) => entry.name)).toEqual([
      'JavaScript',
      'React',
      'Node.js',
      ...(format === 'txt' ? ['Figma'] : []),
    ])
    expect(documents[0].extraContent.find((section) => section.type === 'references')).toBeFalsy()
    expect(documents[0].extraContent.find((section) => section.type === 'custom')).toBeFalsy()
    expect(documents[0].experienceSection.entries[0].jobTitle).toBe('Engineer')
    expect(documents[0].experienceSection.entries[0].company).toBe('Example Company')
    await page.goto('/resume/import')
    await page.getByRole('tab', { name: 'Paste Text' }).click()
    await page.getByLabel('Resume text', { exact: true }).fill(text)
    await page.getByRole('button', { name: 'Import', exact: true }).click()
    await page.getByRole('button', { name: 'Open in editor', exact: true }).click()
    await page.waitForURL('**/editor?resume=*')
    expect((await (await page.request.get('/api/documents')).json()).documents).toHaveLength(2)
    expect(errors).toEqual([])
  })
}

test('invalid files, scanned PDF, paste and cancellation', async ({ page }) => {
  await signIn(page)
  const input = page.getByLabel('Resume file', { exact: true })
  await input.setInputFiles({
    name: 'resume.exe',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('invalid'),
  })
  await expect(page.getByRole('alert')).toContainText('Choose a PDF')
  await input.setInputFiles({
    name: 'resume.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('invalid'),
  })
  await expect(page.getByRole('alert')).toContainText('Could not read this file')
  await input.setInputFiles({
    name: 'large.txt',
    mimeType: 'text/plain',
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1, 'a'),
  })
  await expect(page.getByRole('alert')).toContainText('smaller than 5 MB')
  const pdf = new jsPDF()
  await input.setInputFiles({
    name: 'scan.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(pdf.output('arraybuffer')),
  })
  await expect(page.getByRole('alert')).toContainText('No readable text')
  await page.getByRole('tab', { name: 'Paste Text' }).click()
  await page.getByLabel('Resume text', { exact: true }).fill('Unstructured resume content with no recognised headings.')
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await page.getByLabel('Full name', { exact: true }).fill('Paste Tester')
  await page.getByRole('button', { name: 'Close import', exact: true }).click()
  expect((await (await page.request.get('/api/documents')).json()).documents).toHaveLength(0)
  await page.goto('/resume/import')
  await page.getByRole('tab', { name: 'Paste Text' }).click()
  await page.getByLabel('Resume text', { exact: true }).fill('Unstructured resume content with no recognised headings.')
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await page.getByLabel('Full name', { exact: true }).fill('Paste Tester')
  await page.getByRole('button', { name: 'Open in editor', exact: true }).click()
  await page.waitForURL('**/editor?resume=*')
  await expect(page.locator('#editor-preview')).toContainText('Unstructured resume content')
})

test('two-column PDF keeps experience and skills in the correct sections', async ({ page }, testInfo) => {
  await signIn(page)
  const pdf = new jsPDF()
  pdf.setFontSize(18)
  pdf.text('Taylor Import', 15, 18)
  pdf.setFontSize(11)
  pdf.text('Software Developer', 15, 25)
  pdf.text('taylor@example.com', 15, 32)
  pdf.text('Experience', 15, 48)
  pdf.text('Engineer at Example Company', 15, 57)
  pdf.text('Jan 2021 - Present', 15, 65)
  pdf.text('Built a reliable booking system.', 15, 74)
  pdf.text('Skills', 118, 48)
  pdf.text('JavaScript, React, Node.js', 118, 57)
  pdf.text('Education', 118, 74)
  pdf.text('BSc Computing', 118, 83)
  pdf.text('Example University', 118, 91)
  await page.getByLabel('Resume file', { exact: true }).setInputFiles({ name: 'columns.pdf', mimeType: 'application/pdf', buffer: Buffer.from(pdf.output('arraybuffer')) })
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('Taylor Import')
  await page.getByRole('button', { name: 'Open in editor', exact: true }).click()
  await page.waitForURL('**/editor?resume=*')
  const { documents } = await (await page.request.get('/api/documents')).json()
  expect(documents[0].experienceSection.entries[0].company).toBe('Example Company')
  expect(documents[0].experienceSection.entries[0].startDate).toBe('2021-01')
  expect(documents[0].skillsSection.entries.map((entry) => entry.name)).toEqual(['JavaScript','React','Node.js'])
  expect(documents[0].educationSection.entries[0].school).toBe('Example University')
  await expect(page.locator('#editor-preview')).not.toContainText('Imported details')
  await expect(page.locator('#editor-preview')).not.toContainText('Job title')
  await page.screenshot({ path: testInfo.outputPath('imported-two-column.png'), fullPage: true })
})

test('image OCR extracts a resume, and cancelling processing never saves a document', async ({ page }, testInfo) => {
  await signIn(page)
  await page.screenshot({ path: testInfo.outputPath('import-popup.png') })
  const buffer = await page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1400; canvas.height = 1500
    const context = canvas.getContext('2d')
    context.fillStyle = '#fff'; context.fillRect(0,0,canvas.width,canvas.height)
    context.fillStyle = '#111'; context.font = '36px Arial'
    const lines = ['Taylor Import','Software Developer','taylor@example.com','','SUMMARY','Developer building accessible applications.','','EXPERIENCE','Engineer at Example Company','Jan 2021 - Present','Built a reliable booking system.','','EDUCATION','BSc Computing at Example University','','SKILLS','JavaScript, React, Node.js']
    lines.forEach((line,index) => context.fillText(line,70,80+index*65))
    const blob = await new Promise((resolve) => canvas.toBlob(resolve,'image/png'))
    return [...new Uint8Array(await blob.arrayBuffer())]
  })
  await page.getByLabel('Resume file', { exact: true }).setInputFiles({ name: 'resume.png', mimeType: 'image/png', buffer: Buffer.from(buffer) })
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('Taylor Import', { timeout: 30000 })
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('taylor@example.com')
  await page.getByRole('button', { name: 'Open in editor', exact: true }).click()
  await page.waitForURL('**/editor?resume=*')
  await expect(page.locator('#editor-preview')).toContainText('Example Company')
  await expect(page.locator('#editor-preview')).toContainText('Built a reliable booking system.')
  await page.goto('/resume/import')
  await page.route('**/ocr/eng.traineddata.gz', (route) => route.abort())
  await page.getByLabel('Resume file', { exact: true }).setInputFiles({ name: 'resume.png', mimeType: 'image/png', buffer: Buffer.from(buffer) })
  await page.getByRole('button', { name: 'Close import', exact: true }).click()
  await page.waitForURL('**/setup')
  expect((await (await page.request.get('/api/documents')).json()).documents).toHaveLength(1)
})

test('mixed PDF saves contacts, locations, skill groups, certificates and languages', async ({ page }) => {
  await signIn(page)
  const pdf = new jsPDF({ unit:'pt', format:[600,850] })
  pdf.setFontSize(10)
  const lines = [
    ['Taylor Smith',40,40],['Junior Full-Stack Developer',40,60],
    ['taylor.inbox',40,80],['@example.com',40 + pdf.getTextWidth('taylor.inbox'),80],['+66 63-947-3379',240,80],['Bangkok, Thailand',440,80],
    ['Professional Experience',40,110],['Full-Stack Developer, Example Group',40,130],['02/2024 - 11/2024',460,130],['Capstone Project',40,145],['Brisbane, Australia',460,145],['Built production flows with React.',40,160],
    ['Education',40,195],['Bachelor of Information Technology (Computer Science),',40,215],['07/2023 - 12/2024',460,215],['Example University',40,230],['Brisbane, Australia',460,230],['Completed software development courses.',40,245],
    ['Technical Skills',40,280],['Core & Frameworks',40,300],['Styling & UI',330,300],['JavaScript, React.js, Next.js,',40,315],['Tailwind CSS, Bootstrap, CSS3,',330,315],['HTML5, Node.js, Express.js',40,330],['Figma, Responsive Design',330,330],['Tools & Workflow',40,355],['Git, GitHub, Agile/Scrum',40,370],
    ['Certifications',40,405],['Meta Front-End Developer',40,425],['English for Academic Purposes',330,425],['Professional Certificate',40,440],['(Advanced)',330,440],['Coursera (offered by Meta)',40,455],['QUT College - Brisbane, Australia',330,455],['Completed Oct 2024',40,470],['Completed June 2023',330,470],
    ['Language',40,505],['Burmese',40,525],['English',330,525],['Native',40,540],['Upper Intermediate (B2)',330,540],['Projects',40,575],['Custom',40,610],
  ]
  for (const [text,x,y] of lines) pdf.text(text,x,y)
  await page.getByLabel('Resume file', { exact:true }).setInputFiles({ name:'mixed-layout.pdf', mimeType:'application/pdf', buffer:Buffer.from(pdf.output('arraybuffer')) })
  await expect(page.getByLabel('Email', { exact:true })).toHaveValue('taylor.inbox@example.com')
  await expect(page.getByLabel('Location', { exact:true })).toHaveValue('Bangkok, Thailand')
  await page.getByRole('button', { name:'Open in editor', exact:true }).click()
  await page.waitForURL('**/editor?resume=*')
  await page.reload()
  const { documents } = await (await page.request.get('/api/documents')).json()
  const profile = documents[0]
  expect(profile.experienceSection.entries[0]).toMatchObject({ jobTitle:'Full-Stack Developer', company:'Example Group', location:'Brisbane, Australia', startDate:'2024-02', endDate:'2024-11' })
  expect(profile.educationSection.entries[0]).toMatchObject({ school:'Example University', location:'Brisbane, Australia', startDate:'2023-07', endDate:'2024-12' })
  expect(profile.skillsSection.entries.map((entry) => entry.name)).toEqual(['Core & Frameworks','Tools & Workflow','Styling & UI'])
  expect(JSON.stringify(profile.skillsSection.entries[0].content)).toContain('HTML5, Node.js, Express.js')
  expect(profile.certificationsSection.entries).toHaveLength(2)
  expect(profile.certificationsSection.entries[0]).toMatchObject({ name:'Meta Front-End Developer Professional Certificate', issuer:'Coursera (offered by Meta)', issueDate:'2024-10' })
  expect(profile.certificationsSection.entries[1].issueDate).toBe('2023-06')
  expect(profile.languagesSection.entries.map((entry) => entry.name)).toEqual(['Burmese','English'])
  expect(JSON.stringify(profile.languagesSection.entries[1].content)).toContain('Upper Intermediate (B2)')
  await expect(page.locator('#editor-preview')).toContainText('taylor.inbox@example.com')
  await expect(page.locator('#editor-preview')).toContainText('Brisbane, Australia')
  await expect(page.locator('#editor-preview')).toContainText('Upper Intermediate (B2)')
  await expect(page.locator('#editor-preview')).not.toContainText('Custom')
})
