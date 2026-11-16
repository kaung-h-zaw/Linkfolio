const express = require('express')
const UserController = require('../controllers/UserController')
const { requireAuth } = require('../middleware/AuthMiddleware')
const rateLimit = require('../middleware/rateLimit')

const router = express.Router()

// Routes choose the controller. Authentication checks run before private actions.
router.post('/register', rateLimit('register', 10, 900_000), UserController.register)
router.post('/login', rateLimit('login', 30, 900_000), UserController.login)
router.get('/me', requireAuth, UserController.me)
router.post('/logout', UserController.logout)
router.post('/forgot-password', rateLimit('reset', 10, 900_000), UserController.forgotPassword)
router.post('/reset-password', rateLimit('reset-submit', 20, 900_000), UserController.resetPassword)

module.exports = router
