const express = require('express')
const DocumentController = require('../controllers/DocumentController')
const { requireAuth } = require('../middleware/AuthMiddleware')

const router = express.Router()

// Routes choose the controller. Authentication checks run before private actions.
router.get('/', requireAuth, DocumentController.index)
router.put('/:id', requireAuth, DocumentController.store)
router.delete('/:id', requireAuth, DocumentController.destroy)
router.delete('/:id/portfolio', requireAuth, DocumentController.removePortfolio)
router.put('/:id/publication', requireAuth, DocumentController.publish)

module.exports = router
