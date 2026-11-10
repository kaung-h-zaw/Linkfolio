const { requireValue } = require('../validation')

// Controller: validate the request, call models, and send a JSON response.
const MessageController = {
  index: async (req, res) => {
    const { Message } = req.app.locals.models
    return res.json({
      messages: (await Message.findByUserId(req.user.id)),
    })
  },
  update: async (req, res) => {
    const { Message } = req.app.locals.models

    const message = (await Message.findOwned(req.params.id, req.user.id))
    requireValue(message, 'Message not found.', 404)
    requireValue(['read', 'unread'].includes(req.body.status), 'Invalid message status.')
    await Message.updateStatus(req.body.status, req.params.id)
    res.json({ ok: true })
  },
}

module.exports = MessageController
