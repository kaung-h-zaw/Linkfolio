// Model: only database reads and writes belong in this file.
const { requireValue } = require('../utils/validation.js')
const { randomInt } = require('node:crypto')
const { materializeDocument } = require('../database/relationalContent.js')

function createPublicationModel(db) {
  const Publication = {
    async availableSlug(name, documentId) {
      const base = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 53).replace(/-+$/g, '') || 'portfolio'
      let slug
      do { slug = `${base}-${randomInt(100000, 1000000)}` }
      while (await Publication.findSlugConflict(slug, documentId))
      return slug
    },
    findByDocumentId(documentId) {
      return db
        .prepare('SELECT slug, visibility FROM publications WHERE document_id = ?')
        .get(documentId)
    },
    async findPublic(slug) {
      const row = await db
        .prepare(
          "SELECT d.*, p.slug FROM publications p JOIN documents d ON d.id = p.document_id JOIN users u ON u.id = d.user_id WHERE p.slug = ? AND p.visibility = 'public' AND u.disabled = 0",
        )
        .get(slug)
      return materializeDocument(db, row)
    },
    deleteByDocumentId(documentId) {
      return db.prepare('DELETE FROM publications WHERE document_id = ?').run(documentId)
    },
    findSlugConflict(slug, documentId) {
      return db
        .prepare('SELECT document_id FROM publications WHERE slug = ? AND document_id != ?')
        .get(slug, documentId)
    },
    save(documentId, slug, visibility, updatedAt) {
      return db
        .prepare(
          'INSERT INTO publications VALUES (?, ?, ?, ?) ON CONFLICT(document_id) DO UPDATE SET slug = excluded.slug, visibility = excluded.visibility, updated_at = excluded.updated_at',
        )
        .run(documentId, slug, visibility, updatedAt)
    },
    countPublic() {
      return db.prepare("SELECT COUNT(*) AS n FROM publications WHERE visibility = 'public'").get()
    },
    async requirePublic(slug) {
      const row = await Publication.findPublic(slug)
      requireValue(row, 'Portfolio unavailable.', 404)
      return row
    },
  }
  return Publication
}

module.exports = createPublicationModel
