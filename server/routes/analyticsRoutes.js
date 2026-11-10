const express = require('express')
const AnalyticsController = require('../controllers/AnalyticsController')
const { requireAuth } = require('../middleware/AuthMiddleware')

const router = express.Router()

// Routes choose the controller. Authentication checks run before private actions.
router.get('/', requireAuth, AnalyticsController.index)

module.exports = router
