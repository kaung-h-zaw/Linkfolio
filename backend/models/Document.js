// Model: only database reads and writes belong in this file.
const { requireValue } = require('../utils/validation.js')
const { saveRelationalDocument, materializeDocument } = require('../database/relationalContent.js')

function createDocumentModel(db) {
  const Document = {
    async findOwned(id, userId) {
      const row = await db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?').get(id, userId)
      requireValue(row, 'Document not found.', 404)
      return materializeDocument(db, row)
    },
    async findByUserId(userId) {
      const rows = await db
        .prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC')
        .all(userId)
      return Promise.all(rows.map((row) => materializeDocument(db, row)))
    },
    async findById(id) {
      return materializeDocument(db, await db.prepare('SELECT * FROM documents WHERE id = ?').get(id))
    },
    findOthersByUserId(userId, id) {
      return db
        .prepare('SELECT kind, data FROM documents WHERE user_id = ? AND id != ?')
        .all(userId, id)
    },
    save(id, userId, kind, data, updatedAt) {
      return db.atomic(async () => {
        const result = await db
        .prepare(
          'INSERT INTO documents VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at',
        )
        .run(id, userId, kind, data, updatedAt)
        await saveRelationalDocument(db, { id, user_id:userId, kind, data, updated_at:updatedAt })
        return result
      })
    },
    destroy(id) {
      return db.prepare('DELETE FROM documents WHERE id = ?').run(id)
    },
    updateData(data, updatedAt, id) {
      return db.atomic(async () => {
        const result = await db
        .prepare('UPDATE documents SET data = ?, updated_at = ? WHERE id = ?')
        .run(data, updatedAt, id)
        const row = await db.prepare('SELECT * FROM documents WHERE id = ?').get(id)
        if (row) await saveRelationalDocument(db, row)
        return result
      })
    },
    count() {
      return db.prepare('SELECT COUNT(*) AS n FROM documents').get()
    },
    async withPublication(row) {
      const publication = await db
        .prepare('SELECT slug, visibility FROM publications WHERE document_id = ?')
        .get(row.id)
      return {
        ...JSON.parse(row.data),
        updatedAt: row.updated_at,
        publication: publication || null,
      }
    },
  }
  return Document
}

module.exports = createDocumentModel
