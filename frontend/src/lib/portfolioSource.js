import { hydrateProfile } from './profile.js'
import { getSummary } from './summary.js'
import { getExperience } from './experience.js'
import { getEducation, getSkills } from './educationSkills.js'
import { getProjects, getCertifications, getLanguages } from './additionalSections.js'

export function resumeContent(document) {
  const profile = hydrateProfile(document)
  return {
    personal: profile.personal,
    summarySection: getSummary(profile),
    experienceSection: getExperience(profile),
    educationSection: getEducation(profile),
    skillsSection: getSkills(profile),
    projectsSection: getProjects(profile),
    certificationsSection: getCertifications(profile),
    languagesSection: getLanguages(profile),
    removedSections: document.removedSections || [],
    extraContent: document.extraContent || [],
  }
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key,stable(value[key])]))
  return value
}
function findPortfolioResume(document, documents) {
  const resumes = documents.filter((item) => item.kind !== 'portfolio')
  if (document.portfolio?.sourceResume) return resumes.find((item) => item.id === document.portfolio.sourceResume.id)
  if (document.kind !== 'portfolio') return resumes.find((item) => item.id === document.id)
  // Recover older copies only when exactly one resume has the same content.
  if (!document.personal?.fullName?.trim()) return undefined
  const signature = JSON.stringify(stable(resumeContent(document)))
  const matches = resumes.filter((item) => item.personal?.fullName === document.personal.fullName && JSON.stringify(stable(resumeContent(item))) === signature)
  return matches.length === 1 ? matches[0] : undefined
}
export function resolvePortfolioSource(document, documents) {
  if (!document.portfolio) return document
  const source = findPortfolioResume(document,documents)
  if (!source) return document
  if (document.kind !== 'portfolio' && source.id === document.id) return {...document,portfolio:{...document.portfolio,headline:'',sourceResume:{id:source.id,name:source.name}}}
  return {
    ...document,
    ...resumeContent(source),
    templateId: source.templateId,
    design: source.design,
    portfolio: {...document.portfolio,headline:'',sourceResume:{id:source.id,name:source.name}},
  }
}
