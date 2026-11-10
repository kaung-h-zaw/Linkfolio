const express = require('express')
const Stripe = require('stripe')
const { openDatabase } = require('./database')
const createModels = require('./models')
const { sqliteAdapter } = require('./databaseAdapter')
const requestMiddleware = require('./middleware/requestMiddleware')
const errorMiddleware = require('./middleware/errorMiddleware')
const BillingController = require('./controllers/BillingController')
const billingRoutes = require('./routes/billingRoutes')
const userRoutes = require('./routes/users')
const accountRoutes = require('./routes/accountRoutes')
const templateRoutes = require('./routes/templateRoutes')
const documentRoutes = require('./routes/documentRoutes')
const resumeImportRoutes = require('./routes/resumeImportRoutes')
const publicPortfolioRoutes = require('./routes/publicPortfolioRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const messageRoutes = require('./routes/messageRoutes')
const adminRoutes = require('./routes/adminRoutes')

function createApp({
  databasePath = ':memory:',
  database,
  origin = 'http://localhost:5173',
  production = false,
  env = process.env,
} = {}) {
  const app = express()
  if (!database && env.DATABASE_URL) throw new Error('Open the configured PostgreSQL database before creating the app.')
  const db = database || openDatabase(databasePath)
  const storage = db.engine === 'postgres' ? db : sqliteAdapter(db)
  const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null
  app.disable('x-powered-by')
  if (production) app.set('trust proxy', 1)

  // Configuration and models belong to this app, not a global database.
  app.locals.db = db
  app.locals.models = createModels(storage)
  app.locals.rateLimits = new Map()
  app.locals.config = {
    origin,
    production,
    env,
    stripe,
    demo: !production && env.DEMO_PAYMENTS !== 'false' && !stripe,
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: production,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }

  // Stripe verifies the original request bytes, before express.json parses them.
  app.post(
    '/api/billing/webhook',
    express.raw({ type: 'application/json' }),
    BillingController.webhook,
  )
  app.use(express.json({ limit: '6mb' }))
  app.use('/api', requestMiddleware)
  app.get('/api/health', async (req, res) => {
    await storage.prepare('SELECT 1 AS ready').get()
    res.json({ status: 'ok' })
  })

  // Like the course: app -> routes -> controller -> model.
  app.use('/api/billing', billingRoutes)
  app.use('/api/auth', userRoutes)
  app.use('/api/account', accountRoutes)
  app.use('/api/templates', templateRoutes)
  app.use('/api/documents', documentRoutes)
  app.use('/api/resume-import', resumeImportRoutes)
  app.use('/api/public/portfolios', publicPortfolioRoutes)
  app.use('/api/analytics', analyticsRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/api/admin', adminRoutes)

  app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }))
  app.use(errorMiddleware)
  return app
}

module.exports = { createApp }
