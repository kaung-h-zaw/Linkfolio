const { requireValue } = require('../utils/validation.js')

// Controller: validate the request, call models, and send a JSON response.
const AnalyticsController = {
  index: async (req, res) => {
    const { Analytics } = req.app.locals.models
    const timeZone = req.query.timeZone ?? 'UTC'
    requireValue(typeof timeZone === 'string' && timeZone.length <= 100, 'Invalid analytics time zone.')
    try {
      new Intl.DateTimeFormat('en', { timeZone })
    } catch {
      requireValue(false, 'Invalid analytics time zone.')
    }
    return res.json({
      analytics: (await Analytics.findByUserId(req.user.id, timeZone))
        .filter((r) => JSON.parse(r.data).portfolio)
        .map(({ data, ...r }) => ({ ...r, name: JSON.parse(data).name })),
    })
  },
}

module.exports = AnalyticsController
