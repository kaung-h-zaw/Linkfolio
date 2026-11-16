// Model: only database reads and writes belong in this file.

function createMessageModel(db) {
  const Message = {
    deleteByDocumentId(documentId) {
      return db.prepare('DELETE FROM messages WHERE document_id = ?').run(documentId)
    },
    create(id, documentId, senderName, senderEmail, message, createdAt) {
      return db
        .prepare(
          'INSERT INTO messages (id, document_id, sender_name, sender_email, message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .run(id, documentId, senderName, senderEmail, message, createdAt)
    },
    findByUserId(userId) {
      return db
        .prepare(
          'SELECT m.*, p.slug FROM messages m JOIN documents d ON d.id = m.document_id LEFT JOIN publications p ON p.document_id = d.id WHERE d.user_id = ? ORDER BY m.created_at DESC',
        )
        .all(userId)
    },
    findOwned(id, userId) {
      return db
        .prepare(
          'SELECT m.id, m.deleted_at FROM messages m JOIN documents d ON d.id = m.document_id WHERE m.id = ? AND d.user_id = ?',
        )
        .get(id, userId)
    },
    updateStatus(status, id) {
      return db.prepare('UPDATE messages SET status = ? WHERE id = ?').run(status, id)
    },
    moveToTrash(id, deletedAt) {
      return db.prepare('UPDATE messages SET deleted_at = ? WHERE id = ?').run(deletedAt, id)
    },
    restore(id) {
      return db.prepare('UPDATE messages SET deleted_at = NULL WHERE id = ?').run(id)
    },
    destroy(id) {
      return db.prepare('DELETE FROM messages WHERE id = ?').run(id)
    },
    emptyTrash(userId) {
      return db.prepare('DELETE FROM messages WHERE deleted_at IS NOT NULL AND document_id IN (SELECT id FROM documents WHERE user_id = ?)').run(userId)
    },
    purgeExpired(cutoff) {
      return db.prepare('DELETE FROM messages WHERE deleted_at IS NOT NULL AND deleted_at < ?').run(cutoff)
    },
    count() {
      return db.prepare('SELECT COUNT(*) AS n FROM messages').get()
    },
  }
  return Message
}

module.exports = createMessageModel
