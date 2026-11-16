const { requireValue } = require('../validation')

// Controller: validate the request, call models, and send a JSON response.
const MessageController = {
  index: async (req, res) => {
    const { Message } = req.app.locals.models
    await Message.purgeExpired(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    return res.json({
      messages: (await Message.findByUserId(req.user.id)),
    })
  },
  update: async (req, res) => {
    const { Message } = req.app.locals.models

    const message = (await Message.findOwned(req.params.id, req.user.id))
    requireValue(message, 'Message not found.', 404)
    if (req.body.action === 'restore') {
      requireValue(message.deleted_at, 'Message is not in Trash.')
      await Message.restore(req.params.id)
    }
    else {
      requireValue(['read', 'unread'].includes(req.body.status), 'Invalid message status.')
      await Message.updateStatus(req.body.status, req.params.id)
    }
    res.json({ ok: true })
  },
  trash: async (req, res) => {
    const { Message } = req.app.locals.models
    requireValue(await Message.findOwned(req.params.id, req.user.id), 'Message not found.', 404)
    await Message.moveToTrash(req.params.id, new Date().toISOString())
    res.json({ ok: true })
  },
  destroy: async (req, res) => {
    const { Message } = req.app.locals.models
    const message = await Message.findOwned(req.params.id, req.user.id)
    requireValue(message, 'Message not found.', 404)
    requireValue(message.deleted_at, 'Move the message to Trash before deleting it permanently.')
    await Message.destroy(req.params.id)
    res.json({ ok: true })
  },
  emptyTrash: async (req, res) => {
    const { Message } = req.app.locals.models
    await Message.emptyTrash(req.user.id)
    res.json({ ok: true })
  },
}

module.exports = MessageController
