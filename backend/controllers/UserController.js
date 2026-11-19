const nodemailer = require('nodemailer')
const { checkPassword, digest, hashPassword, publicUser, sessionCookie, token } = require('../security')
const { email, password, requireValue, text } = require('../validation')
const createSession = require('../helpers/createSession')

// Controller: validate the request, call models, and send a JSON response.
const UserController = {
  register: async (req, res) => {
    // app.js creates these database models once. Every request can access them here.
    const { User } = req.app.locals.models

    // 1. Read and validate the values sent by the registration form.
    const fullName = text(req.body.fullName, 'Full name', 120)
    const address = email(req.body.email)
    const secret = password(req.body.password)
    // Like the recipe app, the model checks duplicates and hashes the password.
    const user = await User.register(fullName, address, secret)
    // The helper signs this account in with an HttpOnly cookie.
    await createSession(req, res, user.id)
    res.status(201).json({ user: publicUser(user) })
  },
  login: async (req, res) => {
    const { User } = req.app.locals.models

    // Validate the form values before calling the model's login method.
    const address = email(req.body.email)
    requireValue(
      typeof req.body.password === 'string' &&
        req.body.password.length >= 1 &&
        req.body.password.length <= 256,
      'Enter your password.',
    )
    const user = await User.login(address, req.body.password)
    await createSession(req, res, user.id)
    res.json({ user: publicUser(user) })
  },
  me: async (req, res) => {
    // requireAuth already found this user before calling this controller.
    return res.json({ user: publicUser(req.user) })
  },
  changePassword: async (req, res) => {
    const { User, Session, PasswordReset, transaction } = req.app.locals.models
    requireValue(
      typeof req.body.currentPassword === 'string' && req.body.currentPassword.length >= 1 && req.body.currentPassword.length <= 256,
      'Enter your current password.',
    )
    const currentMatches = await checkPassword(req.body.currentPassword, req.user.password_hash)
    requireValue(currentMatches, 'Your current password is incorrect.', 401)
    const nextPassword = password(req.body.password)
    requireValue(nextPassword !== req.body.currentPassword, 'Choose a password different from your current one.')
    const hash = await hashPassword(nextPassword)
    await transaction(async () => {
      await User.updatePassword(hash, req.user.id)
      await Session.deleteByUserId(req.user.id)
      await PasswordReset.deleteByUserId(req.user.id)
      await createSession(req, res, req.user.id)
    })
    res.json({ message: 'Your password has been changed.' })
  },
  logout: async (req, res) => {
    const { Session } = req.app.locals.models
    const { cookieOptions } = req.app.locals.config

    // Remove the session from the database and clear the browser cookie.
    const value = sessionCookie(req)
    if (value) (await Session.deleteByToken(digest(value)))
    res.clearCookie('linkfolio_session', { ...cookieOptions, maxAge: undefined })
    res.json({ ok: true })
  },
  forgotPassword: async (req, res) => {
    const { User, PasswordReset } = req.app.locals.models
    const { env, production, origin } = req.app.locals.config

    const address = email(req.body.email)
    requireValue(
      env.SMTP_URL || !production,
      'Password reset email delivery has not been configured.',
      503,
    )
    const user = (await User.findActiveByEmail(address))
    const result = {
      message: 'If an account exists for this email, a password reset link has been sent.',
    }
    if (user) {
      const value = token()
      await PasswordReset.deletePreviousAndExpired(user.id, Date.now())
      await PasswordReset.create(digest(value), user.id, Date.now() + 30 * 60_000)
      const url = `${origin}/reset-password?token=${value}`
      if (env.SMTP_URL) {
        await nodemailer.createTransport(env.SMTP_URL).sendMail({
          from: env.MAIL_FROM || 'Linkfolio <noreply@localhost>',
          to: address,
          subject: 'Reset your Linkfolio password',
          text: `Open this link within 30 minutes to reset your password:\n${url}\n\nIf you did not request this, ignore this message.`,
        })
      } else result.demoResetUrl = url
    }
    res.json(result)
  },
  devResetPassword: async (req, res) => {
    const { User, Session, PasswordReset, transaction } = req.app.locals.models
    requireValue(!req.app.locals.config.production, 'This password reset option is only available in local development.', 404)
    const address = email(req.body.email)
    const secret = password(req.body.password)
    const user = await User.findActiveByEmail(address)
    requireValue(user, 'No active account was found for this email.')
    const hash = await hashPassword(secret)
    await transaction(async () => {
      await User.updatePassword(hash, user.id)
      await Session.deleteByUserId(user.id)
      await PasswordReset.deleteByUserId(user.id)
    })
    res.json({ message: 'Password updated. Sign in with your new password.' })
  },
  resetPassword: async (req, res) => {
    const { User, Session, PasswordReset, transaction } = req.app.locals.models

    const value = text(req.body.token, 'Reset token', 64)
    const secret = password(req.body.password)
    const hash = await hashPassword(secret)
    await transaction(async () => {
      const reset = await PasswordReset.findActive(digest(value), Date.now())
      requireValue(reset, 'This reset link is invalid or expired. Request a new one.')
      await User.updatePassword(hash, reset.user_id)
      await PasswordReset.deleteByUserId(reset.user_id)
      await Session.deleteByUserId(reset.user_id)
    })
    res.json({ message: 'Password updated. Sign in with your new password.' })
  },
}

module.exports = UserController
