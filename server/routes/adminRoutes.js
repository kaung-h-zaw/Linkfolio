const express = require('express')
const AdminController = require('../controllers/AdminController')
const { requireAuth, requireAdmin } = require('../middleware/AuthMiddleware')

const router = express.Router()

// Routes choose the controller. Authentication checks run before private actions.
router.get('/', requireAuth, requireAdmin, AdminController.index)
router.patch('/users/:id', requireAuth, requireAdmin, AdminController.updateUser)
router.patch('/templates/:kind/:id', requireAuth, requireAdmin, AdminController.updateTemplate)
router.patch('/plans/:id', requireAuth, requireAdmin, AdminController.updatePlan)

module.exports = router
