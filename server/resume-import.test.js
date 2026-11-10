const { test } = require('node:test')
const assert = require('node:assert/strict')
const { parseResumeText } = require('../shared/resumeParser.mjs')
const { validParsedResume } = require('../shared/resumeSchema.mjs')
const { parseWithAI } = require('./services/resumeParsing')
const { pdfReadingOrder } = require('../client/src/lib/pdfReadingOrder.js')

const example = `Alex Morgan
Product Designer
alex@example.com | +1 555 012 3456 | Portland, OR
https://linkedin.com/in/alex
PROFILE
Product designer with six years of experience in accessible services.
WORK EXPERIENCE
Senior Product Designer
North Studio | Portland, OR
Jan 2023 – Present
• Redesigned onboarding for 18 customers.
• Delivered a reusable component library.

Product Designer at Fieldwork Digital
June 2020 - December 2022
• Ran usability sessions with 24 participants.
EDUCATION
Pacific Design College
BA, Communication Design
Sep 2016 – May 2020
SKILLS: Research, Figma, Accessibility
LANGUAGES
English (Native)
REFERENCES
Available on request.
Page 1 of 1`

test('extract separate jobs, employer, dates, school and skills without duplicate header text', () => {
  const result = parseResumeText(example)
  assert.equal(validParsedResume(result), true)
  assert.equal(result.personal.fullName, 'Alex Morgan')
  assert.equal(result.personal.location, 'Portland, OR')
  assert.equal(result.experience.length, 2)
  assert.equal(result.experience[0].jobTitle, 'Senior Product Designer')
  assert.equal(result.experience[0].company, 'North Studio')
  assert.equal(result.experience[0].location, 'Portland, OR')
  assert.equal(result.experience[0].startDate, '2023-01')
  assert.equal(result.experience[0].current, true)
  assert.equal(result.experience[1].company, 'Fieldwork Digital')
  assert.equal(result.experience[1].startDate, '2020-06')
  assert.equal(result.experience[1].endDate, '2022-12')
  assert.equal(result.education[0].school, 'Pacific Design College')
  assert.equal(result.education[0].degree, 'BA, Communication Design')
  assert.deepEqual(result.skills.map((item) => item.name), ['Research','Figma','Accessibility'])
  assert.deepEqual(result.languages, [{ name: 'English', level: 'Native' }])
  assert.equal(result.extras.length, 0)
  assert.ok(!result.summary.includes('alex@example.com'))
})

test('ambiguous descriptions stay editable; programming languages remain skills', () => {
  const result = parseResumeText('Taylor Smith\nSkills\nLanguages: Python, SQL, JavaScript\nExperience\nBuilt accessible booking systems.\nManaged release quality.')
  assert.deepEqual(result.skills.map((item) => item.name), ['Python','SQL','JavaScript'])
  assert.equal(result.experience[0].jobTitle, '')
  assert.match(result.experience[0].description, /Built accessible/)
  assert.ok(result.warnings.length)
  assert.match(parseResumeText('Unstructured resume content with no recognised headings.').summary, /Unstructured/)
})

test('PDF columns stay separate and right-aligned dates stay with their role', () => {
  const item = (str,x,y,width = str.length * 5) => ({ str, width, transform: [1,0,0,1,x,y] })
  const columns = [item('Alex Morgan',40,760), item('Experience',40,700), item('Skills',330,700), item('Engineer at North Studio',40,680), item('Research, accessible design and rapid prototyping',330,680), item('Built a reliable booking system.',40,650), item('Figma, interaction design and usability testing',330,650), item('Education',330,620), item('University of Design',330,600)]
  const output = pdfReadingOrder(columns, 600)
  assert.ok(output.indexOf('Built a reliable') < output.indexOf('Skills'))
  const dated = pdfReadingOrder([item('Experience',40,700),item('Engineer',40,680),item('2020 – Present',400,680)],600)
  assert.match(dated, /Engineer 2020 – Present/)
})

test('optional AI uses strict structured output and rejects truncated or invalid responses', async () => {
  let body
  const parsed = parseResumeText(example)
  const fetchImpl = async (_, options) => { body = JSON.parse(options.body); return { ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify(parsed) }] }] }) } }
  assert.deepEqual(await parseWithAI(example, { apiKey: 'test-key', fetchImpl }), parsed)
  assert.equal(body.store, false)
  assert.equal(body.text.format.strict, true)
  await assert.rejects(parseWithAI(example, { apiKey: 'test-key', fetchImpl: async () => ({ ok: true, json: async () => ({ status: 'incomplete' }) }) }), /incomplete/)
  await assert.rejects(parseWithAI(example, { apiKey: 'test-key', fetchImpl: async () => ({ ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text: '{}' }] }] }) }) }), /invalid/)
})

test('a job matching the professional headline and actual reference contacts are preserved', () => {
  const result = parseResumeText('Taylor Smith\nSoftware Developer\ntaylor@example.com\nExperience\nSoftware Developer\nExample Company\n2020 - Present\nBuilt a booking system.\nReferences\nJordan Smith\njordan@example.com\n+1 555 000 1234')
  assert.equal(result.experience[0].jobTitle, 'Software Developer')
  assert.equal(result.experience[0].company, 'Example Company')
  assert.match(result.extras[0].description, /jordan@example.com/)
})

test('mixed full-width and column sections preserve contacts, locations, skill groups, certificates and languages', () => {
  const item = (str,x,y,width = str.length * 4) => ({ str, width, transform: [1,0,0,1,x,y] })
  const items = [
    item('Taylor Smith',40,800),item('Junior Full-Stack Developer',40,780),
    item('taylor.inbox',40,760,44),item('@example.com',84,760,50),item('+66 63-947-3379',240,760),item('Bangkok, Thailand',420,760),
    item('Summary',40,720),item('Developer delivering accessible applications.',40,700),
    item('Professional Experience',40,670),item('Full-Stack Developer, Example Group',40,650),item('02/2024 – 11/2024',460,650),
    item('QUT Capstone Project',40,635),item('Brisbane, Australia',460,635),
    item('• Built production flows with React.',40,620),item('reviews with the capstone supervisor.',40,607),
    item('Education',40,580),item('Bachelor of Information Technology (Computer Science),',40,560,300),item('07/2023 – 12/2024',460,560),
    item('Example University (QUT)',40,545),item('Brisbane, Australia',460,545),item('Completed software and database courses.',40,530),
    item('Higher National Diploma, Computing, Example College',40,510,300),item('11/2019 – 02/2023',460,510),item('Yangon, Myanmar',460,495),item('Graduated with distinction.',40,495),
    item('Technical Skills',40,460),item('Core & Frameworks',40,440),item('Styling & UI',330,440),
    item('JavaScript, React.js, Next.js,',40,425),item('Tailwind CSS, Bootstrap, CSS3,',330,425),item('HTML5, Node.js, Express.js',40,410),item('Figma, Responsive Design',330,410),
    item('Tools & Workflow',40,390),item('Git, GitHub, Agile/Scrum',40,375),
    item('Certifications',40,340),item('Meta Front-End Developer',40,320),item('English for Academic Purposes',330,320),
    item('Professional Certificate',40,305),item('(Advanced)',330,305),item('Coursera (offered by Meta) -',40,290),item('QUT College - Brisbane, Australia',330,290),
    item('Completed Oct 2024',40,275),item('- Completed June 2023',330,275),
    item('Language',40,240),item('Burmese',40,220),item('English',330,220),item('Native',40,205),item('Upper Intermediate (B2)',330,205),
    item('Projects',40,170),item('Custom',40,140),
  ]
  const text = pdfReadingOrder(items,600)
  const parsed = parseResumeText(text)
  assert.equal(validParsedResume(parsed),true)
  assert.equal(parsed.personal.email,'taylor.inbox@example.com')
  assert.equal(parsed.personal.location,'Bangkok, Thailand')
  assert.equal(parsed.experience.length,1)
  assert.equal(parsed.experience[0].company,'Example Group')
  assert.equal(parsed.experience[0].location,'Brisbane, Australia')
  assert.match(parsed.experience[0].description,/React\. reviews with/)
  assert.equal(parsed.education.length,2)
  assert.equal(parsed.education[0].school,'Example University (QUT)')
  assert.equal(parsed.education[0].location,'Brisbane, Australia')
  assert.equal(parsed.education[1].school,'Example College')
  assert.equal(parsed.education[1].location,'Yangon, Myanmar')
  assert.equal(parsed.skills.length,3)
  assert.equal(parsed.skills[0].name,'Core & Frameworks')
  assert.match(parsed.skills[0].description,/HTML5, Node.js, Express.js/)
  assert.equal(parsed.certifications.length,2)
  assert.equal(parsed.certifications[0].name,'Meta Front-End Developer Professional Certificate')
  assert.equal(parsed.certifications[0].issueDate,'2024-10')
  assert.equal(parsed.certifications[1].issueDate,'2023-06')
  assert.ok(!parsed.certifications.some((value) => /Language|Burmese|Native/.test(value.description)))
  assert.deepEqual(parsed.languages,[{name:'Burmese',level:'Native'},{name:'English',level:'Upper Intermediate (B2)'}])
  assert.equal(parsed.projects.length,0)
  assert.equal(parsed.extras.length,0)
})
