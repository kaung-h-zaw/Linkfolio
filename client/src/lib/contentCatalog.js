import { textDocument, validSummary } from './summary.js'
import { experienceDate } from './experience.js'

export const coreSections = [
  [
    'personal',
    'Personal Details',
    'Your name, contact details, and social links.',
  ],
  [
    'summary',
    'Professional Summary',
    'Introduce your background and strengths.',
  ],
  [
    'experience',
    'Professional Experience',
    'Your roles and work achievements.',
  ],
  ['education', 'Education', 'Your degrees and schools.'],
  ['skills', 'Skills', 'Your skills and areas of expertise.'],
  ['projects', 'Projects', 'Work you have built or contributed to.'],
  [
    'certifications',
    'Certifications',
    'Credentials, issuers, and validity dates.',
  ],
  ['languages', 'Languages', 'Languages you speak and your proficiency.'],
]
export const extraSections = [
  ['interests', 'Interests', 'Personal interests relevant to your story.'],
  ['courses', 'Courses', 'Training and courses you have completed.'],
  ['awards', 'Awards', 'Achievements, honours, and recognition.'],
  ['organisations', 'Organisations', 'Memberships and volunteer involvement.'],
  [
    'publications',
    'Publications',
    'Articles, books, and other published work.',
  ],
  [
    'references',
    'References',
    'Professional references and their contact details.',
  ],
  ['declaration', 'Declaration', 'A statement to accompany your resume.'],
  ['custom', 'Custom', 'A section you can name and make your own.'],
]
// Custom section keys remain stable for ordering, visibility and independent styling.
export const isCustomSection = (key) => key === 'custom' || (typeof key === 'string' && /^custom_[a-f0-9-]{36}$/.test(key))
export const isExtraSection = (key) => isCustomSection(key) || extraSections.some(([type]) => type === key)

const customDateLabels = ['', 'Issued', 'Awarded', 'Completed', 'Published', 'custom']
export function customEntryDates(entry, formatDate = experienceDate) {
  const dates=[formatDate(entry.startDate),entry.current?'Present':formatDate(entry.endDate)].filter(Boolean).join(' — ')
  if (!entry.startDate || entry.endDate || entry.current) return dates
  const label=entry.dateLabel==='custom'?entry.customDateLabel?.trim():entry.dateLabel
  return [label,dates].filter(Boolean).join(' ')
}

export const newContentEntry = () => ({
  id: crypto.randomUUID(),
  name: '',
  visible: true,
  content: textDocument(),
})
export function validExtraSections(value) {
  return (
    Array.isArray(value) &&
    new Set(value.map((section) => section?.type)).size === value.length &&
    value.every(
      (section) =>
        section &&
        isExtraSection(section.type) &&
        validSummary(section) &&
        ['showInResume','showInPortfolio'].every((field)=>section[field]===undefined || typeof section[field]==='boolean') &&
        (section.format === undefined || (isCustomSection(section.type) && ['standard','skills'].includes(section.format))) &&
        section.entries.every((entry) => typeof entry.name === 'string' && (!isCustomSection(section.type) || (
          (entry.dateLabel===undefined || customDateLabels.includes(entry.dateLabel)) &&
          (entry.customDateLabel===undefined || (typeof entry.customDateLabel==='string' && entry.customDateLabel.length<=40)) &&
          ['subtitle','location'].every((field)=>entry[field]===undefined || (typeof entry[field]==='string' && entry[field].length<=160)) &&
          (entry.url===undefined || (typeof entry.url==='string' && entry.url.length<=2048)) &&
          ['startDate','endDate'].every((field)=>entry[field]===undefined || (typeof entry[field]==='string' && (entry[field]==='' || /^\d{4}-(0[1-9]|1[0-2])$/.test(entry[field])))) &&
          (entry.current===undefined || typeof entry.current==='boolean')
        ))),
    )
  )
}
