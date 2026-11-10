const express = require('express')
const controller = require('../controllers/ResumeImportController')
const { requireAuth } = require('../middleware/AuthMiddleware')
const router = express.Router()
router.get('/capabilities', requireAuth, controller.capabilities)
router.post('/parse', requireAuth, controller.parse)
module.exports = router
