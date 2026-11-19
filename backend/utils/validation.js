// Use the same editor schema validation on both sides of the API.
const { validPortfolio } = require('../../frontend/src/lib/portfolio.js')
const { validDesign } = require('../../frontend/src/lib/resumeDesign.js')
const { validTemplateDesigns } = require('../../frontend/src/lib/resumeTemplateDesign.js')
const {
  coreSections,
  extraSections,
  isCustomSection,
  validExtraSections,
} = require('../../frontend/src/lib/contentCatalog.js')
const {
  validProjects,
  validCertifications,
  validLanguages,
} = require('../../frontend/src/lib/additionalSections.js')
const { validEducation, validSkills } = require('../../frontend/src/lib/educationSkills.js')
const { validExperience } = require('../../frontend/src/lib/experience.js')
const { validSummary } = require('../../frontend/src/lib/summary.js')

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
function requireValue(condition, message, status = 400) {
  if (!condition) throw new HttpError(status, message)
}
function text(value, label, max = 200, min = 1) {
  requireValue(
    typeof value === 'string' && value.trim().length >= min && value.length <= max,
    `${label} must contain ${min}–${max} characters.`,
  )
  return value.trim()
}
function email(value) {
  const result = text(value, 'Email', 254).toLowerCase()
  requireValue(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result), 'Enter a valid email address.')
  return result
}
function password(value) {
  requireValue(
    typeof value === 'string' && value.length >= 8 && value.length <= 256,
    'Use a password with 8–256 characters.',
  )
  return value
}
// Bound nested editor data before persisting it. Rich text is rendered through
// React components, never injected as HTML.
function validateDocument(value, id) {
  requireValue(value && typeof value === 'object' && !Array.isArray(value), 'Invalid document.')
  requireValue(value.id === id && /^[a-zA-Z0-9_-]{1,100}$/.test(id), 'Invalid document ID.')
  requireValue(['resume', 'portfolio'].includes(value.kind || 'resume'), 'Invalid document type.')
  text(value.name, 'Document name', 240)
  text(value.templateId, 'Template', 50)
  requireValue(value.origin === undefined || value.origin === 'import', 'Invalid document origin.')
  requireValue(
    value.personal && typeof value.personal.fullName === 'string',
    'Personal details are required.',
  )
  for (const [key, v] of Object.entries(value.personal)) {
    if (key === 'links') {
      requireValue(
        Array.isArray(v) &&
          v.length <= 100 &&
          v.every(
            (link) =>
              link &&
              typeof link.id === 'string' &&
              typeof link.label === 'string' &&
              typeof link.url === 'string' &&
              Object.values(link).every((field) => typeof field === 'string'),
          ),
        'Invalid profile links.',
      )
    } else requireValue(typeof v === 'string', 'Invalid personal details.')
  }
  function walk(node, depth = 0) {
    requireValue(depth < 30, 'Document data is too deeply nested.')
    if (typeof node === 'string')
      requireValue(node.length <= 4_000_000, 'Document field is too large.')
    if (!node || typeof node !== 'object') return
    requireValue(!Array.isArray(node) || node.length <= 1000, 'Too many document entries.')
    for (const [key, child] of Object.entries(node)) {
      requireValue(
        !['__proto__', 'constructor', 'prototype'].includes(key),
        'Invalid document field.',
      )
      walk(child, depth + 1)
    }
  }
  walk(value)
  const validators = {
    summarySection: validSummary,
    experienceSection: validExperience,
    educationSection: validEducation,
    skillsSection: validSkills,
    projectsSection: validProjects,
    certificationsSection: validCertifications,
    languagesSection: validLanguages,
  }
  for (const [key, validate] of Object.entries(validators)) {
    if (value[key] === undefined) continue
    requireValue(validate(value[key]) && value[key].entries.length <= 100, `Invalid ${key}.`)
  }
  if (value.portfolio !== undefined)
    requireValue(validPortfolio(value.portfolio), 'Invalid portfolio settings.')
  if (value.kind === 'portfolio') requireValue(value.portfolio, 'Portfolio settings are required.')
  if (value.design !== undefined) requireValue(validDesign(value.design), 'Invalid resume design.')
  if (value.templateDesigns !== undefined) requireValue(validTemplateDesigns(value.templateDesigns), 'Invalid saved template designs.')
  if (value.extraContent !== undefined)
    requireValue(validExtraSections(value.extraContent), 'Invalid additional sections.')
  if (value.removedSections !== undefined) {
    requireValue(
      Array.isArray(value.removedSections) &&
        new Set(value.removedSections).size === value.removedSections.length &&
        value.removedSections.every(
          (key) =>
            key !== 'personal' &&
            (isCustomSection(key) || [...coreSections, ...extraSections].some(([type]) => type === key)),
        ),
      'Invalid removed sections.',
    )
  }
  return { ...value, kind: value.kind || 'resume' }
}

module.exports = { requireValue, text, email, password, validateDocument, HttpError }
