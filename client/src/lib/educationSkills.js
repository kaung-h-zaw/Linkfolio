import { textDocument, validSummary } from './summary.js'
export const skillLevels = [
  'Beginner',
  'Amateur',
  'Competent',
  'Proficient',
  'Expert',
]
export function getEducation(profile) {
  return (
    profile.educationSection || {
      heading: 'Education',
      entries: profile.education.map((item) => ({
        id: item.id,
        visible: true,
        degree: [item.degree, item.field].filter(Boolean).join(', '),
        school: item.institution || '',
        schoolUrl: '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        location: item.location || '',
        current: Boolean(item.current),
        content: textDocument(item.description || ''),
      })),
    }
  )
}
export function newEducation() {
  return {
    id: crypto.randomUUID(),
    visible: true,
    degree: '',
    school: '',
    schoolUrl: '',
    startDate: '',
    endDate: '',
    location: '',
    current: false,
    content: textDocument(),
  }
}
export function getSkills(profile) {
  return (
    profile.skillsSection || {
      heading: 'Skills',
      entries: profile.skills.map((name, index) => ({
        id: `legacy-skill-${index}`,
        visible: true,
        name,
        level: '',
        content: textDocument(),
      })),
    }
  )
}
export function newSkill() {
  return {
    id: crypto.randomUUID(),
    visible: true,
    name: '',
    level: '',
    content: textDocument(),
  }
}
export function validEducation(section) {
  return (
    validSummary(section) &&
    section.entries.every(
      (entry) =>
        [
          'degree',
          'school',
          'schoolUrl',
          'startDate',
          'endDate',
          'location',
        ].every((key) => typeof entry[key] === 'string') &&
        typeof entry.current === 'boolean',
    )
  )
}
export function validSkills(section) {
  return (
    validSummary(section) &&
    section.entries.every(
      (entry) =>
        typeof entry.name === 'string' &&
        ['', ...skillLevels].includes(entry.level),
    )
  )
}
