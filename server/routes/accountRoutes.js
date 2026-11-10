const express = require('express')
const AccountController = require('../controllers/AccountController')
const { requireAuth } = require('../middleware/AuthMiddleware')

const router = express.Router()

// Routes choose the controller. Authentication checks run before private actions.
router.patch('/', requireAuth, AccountController.update)

module.exports = router
