const express = require('express')
const PortfolioController = require('../controllers/PortfolioController')
const rateLimit = require('../middleware/rateLimit')

const router = express.Router()

// Routes choose the controller. Authentication checks run before private actions.
router.get('/:slug', rateLimit('public', 120), PortfolioController.show)
router.post('/:slug/events', rateLimit('event', 120), PortfolioController.recordClick)
router.post('/:slug/messages', rateLimit('contact', 5, 900_000), PortfolioController.contact)

module.exports = router
