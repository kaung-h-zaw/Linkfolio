const express = require('express')
const BillingController = require('../controllers/BillingController')
const { requireAuth } = require('../middleware/AuthMiddleware')

const router = express.Router()

// Routes choose the controller. Authentication checks run before private actions.
router.get('/', requireAuth, BillingController.index)
router.post('/downgrade', requireAuth, BillingController.downgrade)
router.post('/checkout', requireAuth, BillingController.checkout)
router.post('/demo/:id', requireAuth, BillingController.demoPayment)
router.post('/verify', requireAuth, BillingController.verify)

module.exports = router
