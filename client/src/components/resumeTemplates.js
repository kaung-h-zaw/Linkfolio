import { textDocument } from '../lib/summary'

// Published references; these are editable adaptations, not official university templates.
const documentDefaults = {
  fontSize: 14, nameSize: 28, lineHeight: 1.35, sectionGap: 16,
  titleSize: 13, headingSize: 13, entrySize: 14, entryGap: 10,
  dateFormat: 'short', accentTitle: false, accentHeadings: false,
  entryLayout: 'columns',
}

export const selectableResumeTemplates = [
  {
    id: 'classic', name: 'Harvard', category: 'Traditional',
    description: 'Centered name, compact contact details and ruled sections, adapted from Harvard’s published resume format.',
    color: '#222222', font: '"Times New Roman", Times, serif',
    reference: 'harvard',
    source: { label: 'Harvard Mignone Center for Career Success', url: 'https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/' },
    sectionOrder: ['education', 'experience', 'projects', 'skills', 'certifications', 'summary'],
    defaults: { ...documentDefaults, header: 'center' },
  },
  {
    id: 'essential', name: 'MIT', category: 'Professional',
    description: 'A straightforward single-column layout with bold headings and aligned dates, based on MIT CAPD’s resume samples.',
    color: '#222222', font: 'Arial, Helvetica, sans-serif',
    reference: 'mit',
    source: { label: 'MIT Career Advising & Professional Development', url: 'https://capd.mit.edu/resources/resumes/' },
    sectionOrder: ['education', 'experience', 'projects', 'skills', 'certifications', 'summary'],
    defaults: { ...documentDefaults, header: 'left' },
  },
  {
    id: 'editorial', name: 'Bajaj Developer', category: 'Technical',
    description: 'Compact serif typography, section rules and a split header, adapted from Sourabh Bajaj’s open-source developer resume.',
    color: '#222222', font: '"Times New Roman", Times, serif',
    reference: 'bajaj',
    source: { label: 'Sourabh Bajaj · MIT-licensed resume', url: 'https://github.com/sb2nov/resume' },
    sectionOrder: ['education', 'experience', 'projects', 'skills', 'certifications', 'summary'],
    defaults: { ...documentDefaults, header: 'left' },
  },
  {
    id: 'slate', name: 'Awesome CV', category: 'Modern', reference: 'awesome',
    description: 'A confident centered heading, red accents and compact experience entries, inspired by Claud D. Park’s Awesome CV.',
    color: '#b84343', font: 'Arial, Helvetica, sans-serif',
    source: { label: 'Claud D. Park · Awesome CV', url: 'https://github.com/posquit0/Awesome-CV' },
    sectionOrder: ['summary', 'experience', 'projects', 'education', 'skills', 'certifications'],
    defaults: { ...documentDefaults, header: 'center', accentTitle: true, accentHeadings: true, capitals: false },
  },
  {
    id: 'avenue', name: 'ModernCV Classic', category: 'Photo', reference: 'modern-classic', photo: true,
    description: 'A blue name, optional square portrait and dates in a left-hand rail, based on ModernCV’s Classic style.',
    color: '#397ba3', font: 'Arial, Helvetica, sans-serif',
    source: { label: 'Xavier Danaux & ModernCV maintainers', url: 'https://github.com/moderncv/moderncv' },
    sectionOrder: ['summary', 'experience', 'education', 'projects', 'skills', 'certifications'],
    defaults: { ...documentDefaults, header: 'left', accentName: true, accentHeadings: true, capitals: false, metadataPosition: 'left' },
  },
  {
    id: 'grid', name: 'Deedy', category: 'Modern', reference: 'deedy',
    description: 'An asymmetric two-column resume with a large centered name and a compact education and skills column.',
    color: '#414141', font: 'Arial, Helvetica, sans-serif',
    source: { label: 'Debarghya Das · Deedy Resume', url: 'https://github.com/deedy/Deedy-Resume' },
    sectionOrder: ['experience', 'education', 'skills', 'projects', 'certifications', 'summary'],
    defaults: { ...documentDefaults, header: 'center', nameSize: 36, fontSize: 13, entryLayout: 'full', capitals: true },
  },
  {
    id: 'studio', name: 'ModernCV Banking', category: 'Modern', reference: 'modern-banking',
    description: 'A centered professional heading with green accents and precise section rules, based on ModernCV’s Banking style.',
    color: '#377462', font: 'Arial, Helvetica, sans-serif',
    source: { label: 'Xavier Danaux & ModernCV maintainers', url: 'https://github.com/moderncv/moderncv' },
    sectionOrder: ['experience', 'education', 'projects', 'skills', 'certifications', 'summary'],
    defaults: { ...documentDefaults, header: 'center', accentHeadings: true, capitals: false },
  },
  {
    id: 'canvas', name: 'AltaCV', category: 'Photo', reference: 'alta', photo: true,
    description: 'A circular portrait, plum accents and a two-column body, inspired by LianTze Lim’s AltaCV.',
    color: '#753c64', font: 'Arial, Helvetica, sans-serif',
    source: { label: 'LianTze Lim · AltaCV', url: 'https://github.com/liantze/AltaCV' },
    sectionOrder: ['experience', 'education', 'skills', 'projects', 'certifications', 'summary'],
    defaults: { ...documentDefaults, header: 'left', fontSize: 13, accentTitle: true, accentHeadings: true, entryLayout: 'full', headingIcons: 'outline' },
  },
  {
    id: 'folio', name: 'Twenty One Seconds', category: 'Photo', reference: 'twentyone', photo: true,
    description: 'A pale blue sidebar with a circular portrait and contact details, paired with a wider experience column.',
    color: '#205d7c', font: 'Arial, Helvetica, sans-serif',
    source: { label: 'Alessandro Trinca Tornidor · Twenty One Seconds', url: 'https://github.com/trincadev/cv-latex-twentyoneseconds' },
    sectionOrder: ['experience', 'education', 'skills', 'projects', 'certifications', 'summary'],
    defaults: { ...documentDefaults, header: 'left', fontSize: 13, nameSize: 25, entryLayout: 'full', accentName: true, accentTitle: true, accentHeadings: true, capitals: false },
  },
]

export const resumeTemplates = selectableResumeTemplates

export const sampleProfile = {
  personal: {
    fullName: 'Alex Morgan',
    photo: '/images/resume-demo.jpg',
    headline: 'Product Designer',
    email: 'alex@example.com',
    phone: '+1 555 012 3456',
    location: 'Portland, OR',
    website: 'alexmorgan.example',
    summary:
      'Thoughtful product designer with five years of experience turning complex challenges into simple, accessible digital experiences. A collaborative approach, from first sketch to final delivery.',
  },
  experience: [
    {
      id: 'sample-1',
      jobTitle: 'Senior Product Designer',
      company: 'North Studio',
      location: 'Portland',
      startDate: '2023-01',
      current: true,
      description:
        'Redesigned onboarding after 18 customer interviews, reducing setup time from 12 to 7 minutes.\nDelivered a 40-component design system used by four product teams.\nPartnered with six engineers to ship accessible account and billing workflows.',
    },
    {
      id: 'sample-2',
      jobTitle: 'Product Designer',
      company: 'Fieldwork Digital',
      startDate: '2020-06',
      endDate: '2022-12',
      description:
        'Designed checkout flows for three retail clients, increasing completed purchases by 14% in an A/B test.\nRan usability sessions with 24 participants and translated findings into tested prototypes.',
    },
  ],
  education: [
    {
      id: 'sample-3',
      institution: 'Pacific Design College',
      degree: 'BA',
      field: 'Communication Design',
      startDate: '2016-09',
      endDate: '2020-05',
    },
  ],
  skills: [
    'Product design',
    'User research',
    'Figma',
    'Prototyping',
    'Design systems',
    'Accessibility',
  ],
  projects: [
    {
      id: 'sample-4',
      name: 'Everyday Notes',
      description: 'A calmer space to capture ideas and organize daily work.',
      technologies: 'Research · Interaction design · Prototyping',
    },
  ],
  certificates: [
    {
      id: 'sample-5',
      name: 'Accessible Digital Design',
      issuer: 'Design Learning Academy',
      issueDate: '2024-03',
    },
  ],
  links: [],
}

// Fictional demo achievements show the structure without reusing anyone’s personal data.
sampleProfile.personal.summary = ''
sampleProfile.experienceSection = {
  heading: 'Experience',
  entries: sampleProfile.experience.map((entry) => ({
    ...entry, visible: true, employerUrl: '',
    location: entry.location || '', endDate: entry.endDate || '',
    current: Boolean(entry.current),
    content: {
      type: 'doc',
      content: [{ type: 'bulletList', content: entry.description.split('\n').map((text) => ({
        type: 'listItem', content: textDocument(text).content,
      })) }],
    },
  })),
}
