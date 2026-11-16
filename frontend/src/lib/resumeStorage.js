import { resolvePortfolioSource } from './portfolioSource.js'
import { validPortfolio } from './portfolio'
import { validDesign } from './resumeDesign'
import { validTemplateDesigns } from './resumeTemplateDesign'
import { coreSections, extraSections, isCustomSection, validExtraSections } from './contentCatalog'
import {
  validProjects,
  getProjects,
  validCertifications,
  getCertifications,
  validLanguages,
  getLanguages,
} from './additionalSections'
import { validEducation, validSkills, getEducation, getSkills } from './educationSkills'
import { validExperience, getExperience } from './experience'
import { validSummary, getSummary } from './summary'
import { api } from './api'
import { hydrateProfile } from './profile'

function validLinks(links) {
  return (
    Array.isArray(links) &&
    links.every(
      (link) =>
        link &&
        typeof link.id === 'string' &&
        typeof link.label === 'string' &&
        typeof link.url === 'string',
    ) &&
    new Set(links.map((link) => link.id)).size === links.length
  )
}

const STORAGE_KEY = 'linkfolio.resumes.v1'

export function readLegacyResumes() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  const records = JSON.parse(raw)
  if (
    !Array.isArray(records) ||
    records.some(
      (record) =>
        !record ||
        typeof record.id !== 'string' ||
        (record.kind !== undefined && !['resume', 'portfolio'].includes(record.kind)) ||
        (record.portfolio !== undefined && !validPortfolio(record.portfolio)) ||
        (record.design !== undefined && !validDesign(record.design)) ||
        (record.templateDesigns !== undefined && !validTemplateDesigns(record.templateDesigns)) ||
        typeof record.name !== 'string' ||
        typeof record.templateId !== 'string' ||
        (record.removedSections !== undefined &&
          (!Array.isArray(record.removedSections) ||
            new Set(record.removedSections).size !== record.removedSections.length ||
            record.removedSections.some(
              (type) =>
                type === 'personal' ||
                !(isCustomSection(type) || [...coreSections, ...extraSections].some(([key]) => key === type)),
            ))) ||
        (record.extraContent !== undefined && !validExtraSections(record.extraContent)) ||
        (record.projectsSection !== undefined && !validProjects(record.projectsSection)) ||
        (record.certificationsSection !== undefined &&
          !validCertifications(record.certificationsSection)) ||
        (record.languagesSection !== undefined && !validLanguages(record.languagesSection)) ||
        (record.educationSection !== undefined && !validEducation(record.educationSection)) ||
        (record.skillsSection !== undefined && !validSkills(record.skillsSection)) ||
        (record.experienceSection !== undefined && !validExperience(record.experienceSection)) ||
        (record.summarySection !== undefined && !validSummary(record.summarySection)) ||
        (record.personal !== undefined &&
          (!record.personal ||
            typeof record.personal !== 'object' ||
            Array.isArray(record.personal) ||
            Object.entries(record.personal).some(([key, value]) =>
              key === 'links' ? !validLinks(value) : typeof value !== 'string',
            ))),
    )
  ) {
    throw new Error('Invalid resume storage')
  }
  return records
}

let records = []
let generation = 0
let revision = 0
let loadRequest = 0
const listeners = new Set()
export function subscribeResumes(listener) { listeners.add(listener); return ()=>listeners.delete(listener) }
function notifyResumes() { for(const listener of listeners)listener() }
export function readResumes() {
  return records.map(record=>record.kind==='portfolio'?resolvePortfolioSource(record,records):record)
}
export function clearResumes() {
  records = []
  generation++
  revision++
  notifyResumes()
}
export async function loadResumes() {
  const current = generation, before = revision, request = ++loadRequest
  const result = await api('/documents', { cache: 'no-store' })
  if (current === generation && before === revision && request === loadRequest) { records = result.documents; notifyResumes() }
  return records
}
// Fetch on every visit and when returning from another tab or browser history.
export function refreshResumesOnOpen(onError = () => {}) {
  const refresh = () => { loadResumes().catch(onError) }
  const visible = () => { if (document.visibilityState === 'visible') refresh() }
  refresh()
  window.addEventListener('focus', refresh)
  window.addEventListener('pageshow', refresh)
  document.addEventListener('visibilitychange', visible)
  return () => {
    window.removeEventListener('focus', refresh)
    window.removeEventListener('pageshow', refresh)
    document.removeEventListener('visibilitychange', visible)
  }
}
function remember(saved) {
  records = [...records.filter((record) => record.id !== saved.id), saved]
  revision++
  notifyResumes()
  return saved
}
export async function saveResume(resume) {
  const current = generation
  const profile = hydrateProfile(resume)
  const body = {
    ...resume,
    personal: profile.personal,
    summarySection: getSummary(profile),
    experienceSection: getExperience(profile),
    educationSection: getEducation(profile),
    skillsSection: getSkills(profile),
    projectsSection: getProjects(profile),
    certificationsSection: getCertifications(profile),
    languagesSection: getLanguages(profile),
  }
  const result = await api(`/documents/${encodeURIComponent(resume.id)}`, { method: 'PUT', body })
  if (current !== generation) throw new Error('Your session changed. Please sign in again.')
  return remember(result.document)
}
export async function deleteResume(id) {
  await api(`/documents/${encodeURIComponent(id)}`, { method: 'DELETE' })
  records = records.filter((record) => record.id !== id)
  revision++
  notifyResumes()
}
export async function removePortfolio(id) {
  const result = await api(`/documents/${encodeURIComponent(id)}/portfolio`, { method: 'DELETE' })
  return remember(result.document)
}
export async function savePublication(id, publication) {
  const result = await api(`/documents/${encodeURIComponent(id)}/publication`, {
    method: 'PUT',
    body: publication,
  })
  const record = records.find((r) => r.id === id)
  if (record) remember({ ...record, publication: result.publication })
  return result.publication
}
