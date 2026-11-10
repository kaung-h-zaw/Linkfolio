const { randomUUID } = require('node:crypto')
const { publicUser } = require('../security')
const { email, requireValue, text } = require('../validation')
const now = () => new Date().toISOString()
const { fulfill } = require('../services/paymentService')

// Controller: validate the request, call models, and send a JSON response.
const BillingController = {
  webhook: async (req, res) => {
    const { env, stripe } = req.app.locals.config

    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return res.sendStatus(503)
    let event
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        env.STRIPE_WEBHOOK_SECRET,
      )
    } catch {
      return res.status(400).json({ error: 'Invalid webhook signature.' })
    }
    if (
      ['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(
        event.type,
      )
    )
      await fulfill(req.app.locals.models, event.data.object)
    res.json({ received: true })
  },
  index: async (req, res) => {
    const { Plan } = req.app.locals.models
    const { env, stripe, demo } = req.app.locals.config
    return res.json({
      plan: req.user.plan,
      plans: (await Plan.find()),
      provider: stripe && env.STRIPE_PRICE_ID ? 'stripe' : demo ? 'demo' : 'unconfigured',
    })
  },
  downgrade: async (req, res) => {
    const { User, transaction } = req.app.locals.models
    await transaction(async () => {
      await User.lockDocuments(req.user.id)
      await User.downgrade(req.user.id)
    })
    res.json({ user: publicUser(await User.findById(req.user.id)) })
  },
  checkout: async (req, res) => {
    const { Payment, Plan } = req.app.locals.models
    const { env, origin, stripe, demo } = req.app.locals.config

    requireValue(
      (await Plan.findPremiumAvailability()).enabled,
      'Premium upgrades are currently unavailable.',
      503,
    )
    requireValue(req.user.plan !== 'premium', 'Your account already has Premium.')
    if (demo) {
      const id = randomUUID()
      await Payment.createDemo(id, req.user.id, now())
      return res.json({ provider: 'demo', id })
    }
    requireValue(stripe && env.STRIPE_PRICE_ID, 'Payment gateway has not been configured.', 503)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: req.user.id,
      customer_email: req.user.email,
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium?cancelled=1`,
    })
    await Payment.createStripe(session.id, req.user.id, now())
    res.json({ provider: 'stripe', url: session.url })
  },
  demoPayment: async (req, res) => {
    const { User, Payment } = req.app.locals.models
    const { demo } = req.app.locals.config

    requireValue(demo, 'Demo payments are unavailable.', 404)
    const payment = (await Payment.findOwnedDemo(req.params.id, req.user.id))
    requireValue(payment?.status === 'pending', 'Payment not found or already processed.', 409)
    requireValue(['success', 'failed'].includes(req.body.outcome), 'Invalid payment result.')
    const paid = req.body.outcome === 'success'
    await Payment.updateStatus(paid ? 'paid' : 'failed', payment.id)
    if (paid) (await User.upgrade(req.user.id))
    res.json({ user: publicUser((await User.findById(req.user.id))), status: paid ? 'paid' : 'failed' })
  },
  verify: async (req, res) => {
    const { User, Payment } = req.app.locals.models
    const { stripe } = req.app.locals.config

    requireValue(stripe, 'Payment gateway is unavailable.', 503)
    const id = text(req.body.sessionId, 'Checkout session', 200)
    const payment = (await Payment.findOwnedStripe(id, req.user.id))
    requireValue(payment, 'Payment not found.', 404)
    await fulfill(req.app.locals.models, await stripe.checkout.sessions.retrieve(id))
    res.json({ user: publicUser((await User.findById(req.user.id))) })
  },
}

module.exports = BillingController
