// Model: only database reads and writes belong in this file.
const { requireValue } = require('../validation')

function createTemplateModel(db) {
  const Template = {
    findById(id, kind) {
      return db.prepare('SELECT * FROM templates WHERE id = ? AND kind = ?').get(id, kind)
    },
    find() {
      return db.prepare('SELECT * FROM templates ORDER BY kind, name').all()
    },
    findByKindAndId(kind, id) {
      return db.prepare('SELECT * FROM templates WHERE kind = ? AND id = ?').get(kind, id)
    },
    update(enabled, premium, kind, id, name) {
      return db
        .prepare('UPDATE templates SET enabled = ?, premium = ?, name = COALESCE(?, name) WHERE kind = ? AND id = ?')
        .run(enabled, premium, name ?? null, kind, id)
    },
    async requireAvailable(id, kind, user) {
      const template = await Template.findById(id, kind)
      requireValue(template?.enabled, 'This template is unavailable. Choose another template.')
      requireValue(
        !template.premium || user.plan === 'premium',
        'This template requires Premium. Choose a free template or upgrade.',
        403,
      )
    },
  }
  return Template
}

module.exports = createTemplateModel
