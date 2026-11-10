import { textDocument, validSummary, summaryText } from './summary.js'
export const languageLevels = [
  'Basic',
  'Conversational',
  'Proficient',
  'Fluent',
  'Native/Bilingual',
]
const base = () => ({
  id: crypto.randomUUID(),
  visible: true,
  name: '',
  content: textDocument(),
})
export function newProject() {
  return {
    ...base(),
    url: '',
    github: '',
    subtitle: '',
    startDate: '',
    endDate: '',
    current: false,
  }
}
export function newCertification() {
  return {
    ...base(),
    url: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    noExpiry: false,
  }
}
export function newLanguage() {
  return { ...base(), level: '' }
}
export function getProjects(profile) {
  return (
    profile.projectsSection || {
      heading: 'Projects',
      entries: profile.projects.map((item) => ({
        id: item.id,
        visible: true,
        name: item.name || '',
        url: item.url || '',
        github: item.github || '',
        subtitle: item.technologies || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        current: Boolean(item.current),
        content: textDocument(item.description || ''),
      })),
    }
  )
}
export function getCertifications(profile) {
  return (
    profile.certificationsSection || {
      heading: 'Certifications',
      entries: profile.certificates.map((item) => ({
        id: item.id,
        visible: true,
        name: item.name || '',
        url: item.url || '',
        issuer: item.issuer || '',
        issueDate: item.issueDate || '',
        expiryDate: item.expiryDate || '',
        noExpiry: Boolean(item.noExpiry),
        content: textDocument(item.description || ''),
      })),
    }
  )
}
export function getLanguages(profile) {
  return profile.languagesSection || { heading: 'Languages', entries: [] }
}
export function validProjects(section) {
  return (
    validSummary(section) &&
    section.entries.every(
      (e) =>
        ['name', 'url', 'github', 'subtitle', 'startDate', 'endDate'].every(
          (k) => typeof e[k] === 'string',
        ) && typeof e.current === 'boolean',
    )
  )
}
export function validCertifications(section) {
  return (
    validSummary(section) &&
    section.entries.every(
      (e) =>
        ['name', 'url', 'issuer', 'issueDate', 'expiryDate'].every(
          (k) => typeof e[k] === 'string',
        ) && typeof e.noExpiry === 'boolean',
    )
  )
}
export function validLanguages(section) {
  return (
    validSummary(section) &&
    section.entries.every(
      (e) =>
        typeof e.name === 'string' && ['', ...languageLevels].includes(e.level),
    )
  )
}
export function visibleEntries(section, fields) {
  return section.entries.filter(
    (e) =>
      e.visible &&
      (fields.some((k) => e[k]?.trim()) || summaryText(e.content).trim()),
  )
}
