function requestMiddleware(req, res, next) {
  const { origin } = req.app.locals.config;

  req.body ||= {};
  res.set("Cache-Control", "no-store");
  res.set("X-Content-Type-Options", "nosniff");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    if (
      req.headers["x-linkfolio-request"] !== "1" ||
      (req.headers.origin && req.headers.origin !== origin)
    ) {
      return res.status(403).json({ error: "Request origin is not allowed." });
    }
  }
  next();
}

module.exports = requestMiddleware;
