const { HttpError } = require('../utils/validation.js')

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error)
  if (error.code === '23505' || error.code === 'ERR_SQLITE_ERROR' && /UNIQUE constraint failed/.test(error.message)) {
    return res.status(409).json({ error:'This email or portfolio address is already in use. Choose another one.' })
  }
  if (!(error instanceof HttpError) && error.status !== 400 && error.status !== 413)
    // Driver/provider error objects can contain credentials or personal data.
    console.error('Request failed:', { name: error.name, code: error.code })
  res.status(error.status || 500).json({
    error:
      error instanceof HttpError
        ? error.message
        : error.status === 413
          ? 'This document is too large. Use a smaller resume attachment.'
          : error.status === 400
            ? 'Invalid request data.'
            : 'Something went wrong. Please try again.',
  })
}

module.exports = errorMiddleware
