// Controller: validate the request, call models, and send a JSON response.
const AnalyticsController = {
  index: async (req, res) => {
    const { Analytics } = req.app.locals.models
    return res.json({
      analytics: (await Analytics.findByUserId(req.user.id))
        .filter((r) => JSON.parse(r.data).portfolio)
        .map(({ data, ...r }) => ({ ...r, name: JSON.parse(data).name })),
    })
  },
}

module.exports = AnalyticsController
