const { publicUser } = require('../security')
const { text, requireValue } = require('../validation')

// Controller: validate the request, call models, and send a JSON response.
const AccountController = {
  update: async (req, res) => {
    const { User } = req.app.locals.models

    const name = text(req.body.fullName, 'Full name', 120)
    await User.updateName(name, req.user.id)
    res.json({ user: publicUser((await User.findById(req.user.id))) })
  },
  remove: async (req, res) => {
    const { User } = req.app.locals.models
    const confirmation = text(req.body.fullName, 'Confirmation name', 120)
    const account = await User.findById(req.user.id)
    requireValue(account && confirmation.toLocaleLowerCase() === account.full_name.trim().toLocaleLowerCase(), 'Enter your account name exactly to delete your account.')
    await User.deleteById(req.user.id)
    res.json({ ok: true })
  },
}

module.exports = AccountController
