const { publicUser } = require('../security')
const { requireValue } = require('../validation')

// Controller: validate the request, call models, and send a JSON response.
const AdminController = {
  index: async (req, res) => {
    const { User, Template, Plan, Report } =
      req.app.locals.models

    const users = (await User.find()).map((u) => ({
      ...publicUser(u),
      disabled: Boolean(u.disabled),
      createdAt: u.created_at,
    }))
    const report = await Report.summary()
    res.json({
      users,
      templates: (await Template.find()),
      plans: (await Plan.find()),
      report: {
        users: report.user_count,
        documents: report.document_count,
        published: report.published_count,
        messages: report.message_count,
        views: report.view_count,
        paidUpgrades: report.paid_upgrade_count,
        resumes: report.resume_count,
        portfolios: report.portfolio_count,
      },
    })
  },
  updateUser: async (req, res) => {
    const { User, Session } = req.app.locals.models

    const user = (await User.findById(req.params.id))
    requireValue(user, 'User not found.', 404)
    requireValue(user.role !== 'admin', 'Administrator accounts cannot be modified here.')
    requireValue(typeof req.body.disabled === 'boolean', 'Invalid account status.')
    await User.updateDisabled(Number(req.body.disabled), user.id)
    if (req.body.disabled) (await Session.deleteByUserId(user.id))
    res.json({ ok: true })
  },
  updateTemplate: async (req, res) => {
    const { Template } = req.app.locals.models

    const template = (await Template.findByKindAndId(req.params.kind, req.params.id))
    requireValue(template, 'Template not found.', 404)
    requireValue(
      typeof req.body.enabled === 'boolean' && typeof req.body.premium === 'boolean',
      'Invalid template settings.',
    )
    await Template.update(
      Number(req.body.enabled),
      Number(req.body.premium),
      req.params.kind,
      req.params.id,
    )
    res.json({ ok: true })
  },
  updatePlan: async (req, res) => {
    const { Plan } = req.app.locals.models

    const plan = (await Plan.findById(req.params.id))
    requireValue(plan, 'Plan not found.', 404)
    requireValue(
      [req.body.resumeLimit, req.body.portfolioLimit].every(
        (n) => Number.isInteger(n) && n >= 1 && n <= 100,
      ) && typeof req.body.enabled === 'boolean',
      'Limits must be whole numbers from 1 to 100.',
    )
    await Plan.update(
      req.body.resumeLimit,
      req.body.portfolioLimit,
      Number(req.body.enabled),
      req.params.id,
    )
    res.json({ ok: true })
  },
}

module.exports = AdminController
