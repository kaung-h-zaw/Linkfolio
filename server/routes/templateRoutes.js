const express = require('express')
const TemplateController = require('../controllers/TemplateController')

const router = express.Router()

// Routes choose the controller. Authentication checks run before private actions.
router.get('/', TemplateController.index)

module.exports = router
