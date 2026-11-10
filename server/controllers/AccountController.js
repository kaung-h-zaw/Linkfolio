const { publicUser } = require('../security')
const { text } = require('../validation')

// Controller: validate the request, call models, and send a JSON response.
const AccountController = {
  update: async (req, res) => {
    const { User } = req.app.locals.models

    const name = text(req.body.fullName, 'Full name', 120)
    await User.updateName(name, req.user.id)
    res.json({ user: publicUser((await User.findById(req.user.id))) })
  },
}

module.exports = AccountController
