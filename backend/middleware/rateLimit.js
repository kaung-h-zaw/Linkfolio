function rateLimit(prefix, max, duration = 60_000, identify = (req) => req.ip) {
  return (req, res, next) => {
    const limits = req.app.locals.rateLimits
    const key = `${prefix}:${identify(req)}`
    const current = Date.now()
    for (const [k, v] of limits) if (v.until < current) limits.delete(k)
    const entry = limits.get(key) || { count: 0, until: current + duration }
    limits.set(key, entry)
    if (++entry.count > max) {
      const retryAfter = Math.max(1, Math.ceil((entry.until - current) / 1000))
      res.set('Retry-After', String(retryAfter))
      return res.status(429).json({
        error: 'Request limit reached.',
        code: 'RATE_LIMITED',
        retryAfter,
      })
    }
    next()
  }
}

module.exports = rateLimit
