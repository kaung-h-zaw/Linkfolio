import { summaryText, getSummary } from './summary.js'
import { getExperience } from './experience.js'
import { getEducation, getSkills } from './educationSkills.js'
import { getProjects, getCertifications, getLanguages } from './additionalSections.js'

export function entryHasContent(entry) {
  return Object.entries(entry || {}).some(([key,value]) => {
    if (['id','visible','current','noExpiry','heading'].includes(key)) return false
    if (key === 'content' && value && typeof value === 'object') return Boolean(summaryText(value).trim())
    return typeof value === 'string' && Boolean(value.trim())
  })
}
export function resumeSectionHasContent(profile,key) {
  const readers={summary:getSummary,experience:getExperience,education:getEducation,skills:getSkills,projects:getProjects,certifications:getCertifications,languages:getLanguages}
  if (readers[key]) return readers[key](profile).entries.some(entryHasContent)
  if (key === 'links') return (profile.links || []).some((entry) => entry.url?.trim())
  const extra=(profile.extraContent || []).find((section) => section.type === key)
  if (extra) return extra.entries.some(entryHasContent)
  const custom=(profile.custom || []).find((section) => section.id === key)
  return Boolean(custom && entryHasContent(custom))
}
