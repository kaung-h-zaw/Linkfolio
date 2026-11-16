const express = require('express')
const controller = require('../controllers/ResumeImportController')
const { requireAuth } = require('../middleware/AuthMiddleware')
const rateLimit = require('../middleware/rateLimit')
const router = express.Router()
router.get('/capabilities', requireAuth, controller.capabilities)
router.post('/parse', requireAuth, rateLimit('resume-import', 10, 900_000, (req) => req.user.id), controller.parse)
module.exports = router
