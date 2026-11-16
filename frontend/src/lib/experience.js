import { textDocument, validSummary } from './summary.js'

export function getExperience(profile) {
  return (
    profile.experienceSection || {
      heading: 'Professional Experience',
      entries: profile.experience.map((item) => ({
        id: item.id,
        visible: true,
        jobTitle: item.jobTitle || '',
        company: item.company || '',
        employerUrl: '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        current: Boolean(item.current),
        location: item.location || '',
        content: textDocument(item.description || ''),
      })),
    }
  )
}
export function newExperience() {
  return {
    id: crypto.randomUUID(),
    visible: true,
    jobTitle: '',
    company: '',
    employerUrl: '',
    startDate: '',
    endDate: '',
    current: false,
    location: '',
    content: textDocument(),
  }
}
export function validExperience(section) {
  return (
    validSummary(section) &&
    section.entries.every(
      (entry) =>
        [
          'jobTitle',
          'company',
          'employerUrl',
          'startDate',
          'endDate',
          'location',
        ].every((key) => typeof entry[key] === 'string') &&
        typeof entry.current === 'boolean',
    )
  )
}
export function experienceDate(value) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return value
  const [year, month] = value.split('-')
  return `${month}/${year}`
}
