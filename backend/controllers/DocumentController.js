const { requireValue, text, validateDocument } = require('../utils/validation.js')
const { resolvePortfolioSource } = require('../../frontend/src/lib/portfolioSource.js')
const now = () => new Date().toISOString()

// Controller: validate the request, call models, and send a JSON response.
const DocumentController = {
  index: async (req, res) => {
    const { Document, User, transaction } = req.app.locals.models
    const rows = await Document.findByUserId(req.user.id)
    const documents = await Promise.all(rows.map(Document.withPublication))
    const resolved = documents.map((document) => document.kind === 'portfolio' ? resolvePortfolioSource(document,documents) : document)
    // Record recovered links once, so subsequent resume edits cannot lose them.
    for (let index = 0; index < documents.length; index++) {
      if (documents[index].kind !== 'portfolio' || documents[index].portfolio?.sourceResume || !resolved[index].portfolio?.sourceResume) continue
      await transaction(async () => {
        await User.lockDocuments(req.user.id)
        const current = await Document.findOwned(rows[index].id,req.user.id)
        // Leave a concurrently saved document alone.
        if (current.data !== rows[index].data) return
        const data = JSON.parse(current.data)
        data.portfolio.sourceResume = resolved[index].portfolio.sourceResume
        await Document.updateData(JSON.stringify(data),current.updated_at,current.id)
      })
    }
    return res.json({documents:resolved})
  },
  store: async (req, res) => {
    const { Document, Template, Plan, Publication, User, transaction } = req.app.locals.models

    let document = validateDocument(req.body, req.params.id)
    const saved = await transaction(async () => {
      await User.lockDocuments(req.user.id)
      const existing = (await Document.findById(document.id))
      requireValue(!existing || existing.user_id === req.user.id, 'Document not found.', 404)
      requireValue(!existing || existing.kind === document.kind, 'Document type cannot be changed.')
      if (existing) {
        const savedOrigin = JSON.parse(existing.data).origin
        if (savedOrigin === 'import') document.origin = 'import'
        else delete document.origin
      }
      const plan = (await Plan.findById(req.user.plan))
      const others = (await Document.findOthersByUserId(req.user.id, document.id))
      requireValue(
        document.kind === 'portfolio' || document.origin === 'import' ||
          others.filter((d) => d.kind === 'resume' && JSON.parse(d.data).origin !== 'import').length < plan.resume_limit,
        'Your plan has reached its resume limit. Delete a resume or upgrade.',
        403,
      )
      requireValue(
        !document.portfolio ||
          others.filter((d) => JSON.parse(d.data).portfolio).length < plan.portfolio_limit,
        'Your plan has reached its portfolio limit. Remove a portfolio or upgrade.',
        403,
      )
      if (document.kind === 'resume')
        await Template.requireAvailable(document.templateId, 'resume', req.user)
      if (document.portfolio)
        await Template.requireAvailable(document.portfolio.template || 'essential', 'portfolio', req.user)
      if (document.portfolio?.sourceResume) {
        const source = await Document.findById(document.portfolio.sourceResume.id)
        requireValue(source && source.user_id === req.user.id && source.kind === 'resume', 'The selected resume is unavailable. Choose another resume.', 400)
        if (document.kind === 'portfolio') document = resolvePortfolioSource(document,[JSON.parse(source.data)])
      }
      const updatedAt = now()
      delete document.publication
      delete document.updatedAt
      await Document.save(document.id, req.user.id, document.kind, JSON.stringify(document), updatedAt)
      if (document.portfolio && !(await Publication.findByDocumentId(document.id))) {
        await Publication.save(document.id, (await Publication.availableSlug(document.personal.fullName || req.user.full_name || 'portfolio', document.id)), 'private', updatedAt)
      }
      return Document.withPublication(await Document.findOwned(document.id, req.user.id))
    })
    res.json({ document: saved })
  },
  destroy: async (req, res) => {
    const { Document } = req.app.locals.models

    await Document.findOwned(req.params.id, req.user.id)
    await Document.destroy(req.params.id)
    res.json({ ok: true })
  },
  removePortfolio: async (req, res) => {
    const { Document, Publication, Analytics, Message, transaction } = req.app.locals.models

    const row = (await Document.findOwned(req.params.id, req.user.id))
    requireValue(
      row.kind === 'resume',
      'Delete this standalone portfolio from the workspace instead.',
    )
    const data = JSON.parse(row.data)
    delete data.portfolio
    await transaction(async () => {
      await Publication.deleteByDocumentId(row.id)
      await Analytics.deleteByDocumentId(row.id)
      await Message.deleteByDocumentId(row.id)
      await Document.updateData(JSON.stringify(data), now(), row.id)
    })
    res.json({ document: (await Document.withPublication((await Document.findOwned(row.id, req.user.id)))) })
  },
  publish: async (req, res) => {
    const { Document, Publication } = req.app.locals.models

    const row = (await Document.findOwned(req.params.id, req.user.id))
    const data = JSON.parse(row.data)
    requireValue(
      data.portfolio && data.personal.fullName.trim(),
      'Save a portfolio with your name before publishing.',
    )
    const slug = req.body.slug === '' || req.body.slug === undefined
      ? (await Publication.findByDocumentId(row.id))?.slug || (await Publication.availableSlug(data.personal.fullName, row.id))
      : text(req.body.slug, 'Portfolio URL', 60).toLowerCase()
    requireValue(
      /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/.test(slug),
      'Use 3–60 lowercase letters, numbers, or hyphens. Start and end with a letter or number.',
    )
    requireValue(
      ['public', 'private'].includes(req.body.visibility),
      'Choose public or private visibility.',
    )
    const duplicate = (await Publication.findSlugConflict(slug, row.id))
    if (duplicate) requireValue(false, `This portfolio URL is already taken. Try ${(await Publication.availableSlug(slug, row.id))} or choose another name.`, 409)
    await Publication.save(row.id, slug, req.body.visibility, now())
    res.json({ publication: { slug, visibility: req.body.visibility } })
  },
}

module.exports = DocumentController
