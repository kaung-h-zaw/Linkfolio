const { digest, sessionCookie, token } = require('../utils/security.js')

// Cookies contain a random session token, never the user's password.
async function createSession(req, res, userId) {
  const { Session } = req.app.locals.models
  const { cookieOptions } = req.app.locals.config

  const previous = sessionCookie(req)
  if (previous) (await Session.deleteByToken(digest(previous)))
  await Session.deleteExpired(Date.now())
  const value = token()
  await Session.create(digest(value), userId, Date.now() + cookieOptions.maxAge)
  res.cookie('linkfolio_session', value, cookieOptions)
}

module.exports = createSession
