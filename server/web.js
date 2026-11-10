const express = require('express')
const { resolve } = require('node:path')
const { existsSync } = require('node:fs')

// The React build is the view layer; API routes/controllers/models stay separate.
function serveClient(app, directory = resolve(__dirname, '../client/dist')) {
  if (!existsSync(resolve(directory, 'index.html'))) {
    if (app.locals.config.production) throw new Error('Client build is missing. Run npm run build before starting production.')
    return
  }
  app.use(express.static(directory))
  app.get('/{*path}', (req, res) => {
    res.set('Cache-Control', 'no-cache')
    res.sendFile(resolve(directory, 'index.html'))
  })
}

module.exports = { serveClient }
