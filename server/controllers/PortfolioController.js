const { portfolioDetailEntries, portfolioCustomSections } = require('../../client/src/lib/portfolioContent.js')
const { hydrateProfile } = require('../../client/src/lib/profile.js')
const { getSummary } = require('../../client/src/lib/summary.js')
const { getExperience } = require('../../client/src/lib/experience.js')
const { getEducation, getSkills } = require('../../client/src/lib/educationSkills.js')
const { getProjects, getCertifications, getLanguages } = require('../../client/src/lib/additionalSections.js')
const { resolvePortfolioPortrait } = require('../../client/src/lib/portfolioImages.js')
const { randomUUID } = require('node:crypto')
const { email, requireValue, text } = require('../validation')
const { resolvePortfolioSource } = require('../../client/src/lib/portfolioSource.js')
const now = () => new Date().toISOString()

// Controller: validate the request, call models, and send a JSON response.
const PortfolioController = {
  show: async (req, res) => {
    const { Publication, Analytics, Document } = req.app.locals.models

    const row = (await Publication.requirePublic(req.params.slug))
    await Analytics.recordView(row.id, now())
    const documents = (await Document.findByUserId(row.user_id)).map((item) => JSON.parse(item.data))
    const data = resolvePortfolioSource(JSON.parse(row.data),documents)
    // Publish portfolio data only; hidden resume sections and drafts stay private.
    const profile = {
      personal: {
        fullName: data.personal.fullName,
        headline: data.personal.headline || '',
        location: data.personal.location || '',
        summary: '',
      },
      removedSections: [],
    }
    const loaded = hydrateProfile(data)
    const readSection = {summary:getSummary,experience:getExperience,education:getEducation,skills:getSkills,projects:getProjects,certifications:getCertifications,languages:getLanguages}
    const empty = (heading) => ({ heading, entries: [] })
    for (const [key, setting, heading] of [
      ['summary', 'about', 'Summary'],
      ['projects', 'projects', 'Projects'],
      ['experience', 'experience', 'Experience'],
      ['education', 'education', 'Education'],
      ['skills', 'skills', 'Skills'],
      ['certifications', 'certifications', 'Certifications'],
      ['languages','languages','Languages'],
    ]) {
      const section = readSection[key](loaded)
      profile[`${key}Section`] =
        (key === 'languages' ? data.portfolio.languages === true : data.portfolio[setting] !== false) && !(data.removedSections || []).includes(key) && section
          ? { ...section, entries: section.entries.filter((e) => e.visible) }
          : empty(heading)
    }
    profile.extraContent=data.portfolio.custom !== false ? portfolioCustomSections(data) : []
    if (data.portfolio.contact) {
      profile.personal.email = data.personal.email || ''
      profile.personal.links =
        data.personal.links ||
        [
          ['website', 'Website'],
          ['linkedin', 'LinkedIn'],
          ['github', 'GitHub'],
        ]
          .filter(([key]) => data.personal[key])
          .map(([key, label]) => ({ id: key, label, url: data.personal[key] }))
    }
    const settings = { ...data.portfolio }
    delete settings.sourceResume
    const visibleProjects = new Set(profile.projectsSection.entries.map((entry) => entry.id))
    settings.images = {
      showPortrait: data.portfolio.images?.showPortrait !== false,
      portraitSource: 'custom',
      portrait: resolvePortfolioPortrait(data.portfolio,data.personal),

      projects: Object.fromEntries(Object.entries(data.portfolio.images?.projects || {}).filter(([id]) => visibleProjects.has(id))),
    }
    const detailKeys=new Set(portfolioDetailEntries(hydrateProfile(profile),settings).map((item)=>item.key))
    settings.detailPages=Object.fromEntries(Object.entries(data.portfolio.detailPages || {}).filter(([key,config])=>detailKeys.has(key) && config.enabled))
    if (!settings.resumeDownload) settings.resumeFile = null
    let resumeProfile
    if (settings.resumeDownload) {
      resumeProfile = {
        personal: { ...data.personal, summary: '' },
        templateId: data.templateId,
        design: data.design,
        removedSections: data.removedSections || [],
      }
      for (const key of [
        'summary',
        'projects',
        'experience',
        'education',
        'skills',
        'certifications',
        'languages',
      ]) {
        const section = data[`${key}Section`]
        resumeProfile[`${key}Section`] =
          section && !resumeProfile.removedSections.includes(key)
            ? { ...section, entries: section.entries.filter((e) => e.visible) }
            : empty(key)
      }
      resumeProfile.extraContent = (data.extraContent || [])
        .filter((section) => !resumeProfile.removedSections.includes(section.type) && section.showInResume !== false)
        .map((section) => ({ ...section, entries: section.entries.filter((e) => e.visible) }))
    }
    res.json({ profile, settings, slug: row.slug, ...(resumeProfile ? { resumeProfile } : {}) })
  },
  recordClick: async (req, res) => {
    const { Publication, Analytics, Document } = req.app.locals.models

    const row = (await Publication.requirePublic(req.params.slug))
    requireValue(
      req.body.type === 'click' && typeof req.body.href === 'string',
      'Invalid analytics event.',
    )
    const data = resolvePortfolioSource(JSON.parse(row.data),(await Document.findByUserId(row.user_id)).map((item)=>JSON.parse(item.data)))
    function containsLink(node) {
      if (!node || typeof node !== 'object') return false
      return Object.entries(node).some(
        ([key, value]) =>
          (['url', 'github', 'website', 'linkedin', 'href'].includes(key) &&
            typeof value === 'string' &&
            value === req.body.href) ||
          containsLink(value),
      )
    }
    requireValue(
      containsLink(data) || req.body.href === `mailto:${data.personal.email}`,
      'Unknown portfolio link.',
    )
    await Analytics.recordClick(row.id)
    res.json({ ok: true })
  },
  contact: async (req, res) => {
    const { Publication, Message } = req.app.locals.models

    const row = (await Publication.requirePublic(req.params.slug))
    requireValue(
      JSON.parse(row.data).portfolio.contact,
      'This portfolio is not accepting messages.',
      403,
    )
    const name = text(req.body.name, 'Name', 120)
    const address = email(req.body.email)
    const message = text(req.body.message, 'Message', 5000)
    requireValue(!req.body.website, 'Unable to submit this message.')
    await Message.create(randomUUID(), row.id, name, address, message, now())
    res.status(201).json({ message: 'Your message has been sent.' })
  },
}

module.exports = PortfolioController
