import { flowcvResumeTemplates } from '../lib/flowcvResumeTemplates.js'
import { resumeTemplateIds } from '../lib/templateCatalog.js'
import { textDocument } from '../lib/summary'

// Only current selectable templates participate in selection and rendering.
export const resumeTemplates = flowcvResumeTemplates
export const selectableResumeTemplates = resumeTemplateIds.map(id => resumeTemplates.find(template => template.id === id))

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
