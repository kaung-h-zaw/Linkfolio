// Controller: validate the request, call models, and send a JSON response.
const TemplateController = {
  index: async (req, res) => {
    const { Template } = req.app.locals.models
    return res.json({ templates: (await Template.find()) })
  },
}

module.exports = TemplateController
