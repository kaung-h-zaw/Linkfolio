function rateLimit(prefix, max, duration = 60_000) {
  return (req, res, next) => {
    const limits = req.app.locals.rateLimits
    const key = `${prefix}:${req.ip}`
    const current = Date.now()
    for (const [k, v] of limits) if (v.until < current) limits.delete(k)
    const entry = limits.get(key) || { count: 0, until: current + duration }
    limits.set(key, entry)
    if (++entry.count > max)
      return res.status(429).json({ error: 'Too many requests. Please try again later.' })
    next()
  }
}

module.exports = rateLimit
