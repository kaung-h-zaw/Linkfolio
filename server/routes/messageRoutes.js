const express = require('express')
const MessageController = require('../controllers/MessageController')
const { requireAuth } = require('../middleware/AuthMiddleware')

const router = express.Router()

// Routes choose the controller. Authentication checks run before private actions.
router.get('/', requireAuth, MessageController.index)
router.patch('/:id', requireAuth, MessageController.update)

module.exports = router
