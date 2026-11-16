const express = require('express')
const MessageController = require('../controllers/MessageController')
const { requireAuth } = require('../middleware/AuthMiddleware')

const router = express.Router()

// Routes choose the controller. Authentication checks run before private actions.
router.get('/', requireAuth, MessageController.index)
router.delete('/trash', requireAuth, MessageController.emptyTrash)
router.patch('/:id', requireAuth, MessageController.update)
router.delete('/:id/permanent', requireAuth, MessageController.destroy)
router.delete('/:id', requireAuth, MessageController.trash)

module.exports = router
