const { digest, sessionCookie } = require('../security')

// Find the account for the session, then let the controller use req.user.
async function requireAuth(req, res, next) {
  const { Session } = req.app.locals.models

  const value = sessionCookie(req)
  const user = value && (await Session.findActiveUser(digest(value), Date.now()))
  if (!user) return res.status(401).json({ error: 'Please sign in to continue.' })
  req.user = user
  next()
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Administrator access is required.' })
  next()
}

module.exports = { requireAuth, requireAdmin }
