const { text, requireValue } = require('../validation')
const { parseResumeText } = require('../../shared/resumeParser.mjs')
const { parseWithAI } = require('../services/resumeParsing')

module.exports = {
  capabilities(req, res) { res.json({ ai: Boolean(req.app.locals.config.env.OPENAI_API_KEY) }) },
  async parse(req, res) {
    const source = text(req.body.text, 'Resume text', 60000)
    requireValue(req.body.useAI === true, 'Choose AI-assisted parsing before sending resume text.')
    const { env } = req.app.locals.config
    requireValue(env.OPENAI_API_KEY, 'AI parsing is not configured. Continue with local parsing.', 503)
    const controller = new AbortController()
    const disconnect = () => { if (!res.writableEnded) controller.abort() }
    res.on('close', disconnect)
    const timeout = setTimeout(() => controller.abort(), 60000)
    try {
      const parsed = await parseWithAI(source, { apiKey: env.OPENAI_API_KEY, model: env.RESUME_IMPORT_MODEL || 'gpt-4.1-mini', signal: controller.signal })
      if (!controller.signal.aborted) res.json({ parsed, method: 'ai' })
    } catch {
      if (!res.destroyed) res.json({ parsed: parseResumeText(source), method: 'local', warning: 'AI parsing was unavailable. Used local parsing; please review the detected fields.' })
    } finally { clearTimeout(timeout); res.off('close', disconnect) }
  },
}
