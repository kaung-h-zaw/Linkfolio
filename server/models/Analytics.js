// Model: only database reads and writes belong in this file.
const { materializeDocument } = require('../relationalContent')

function createAnalyticsModel(db) {
  const Analytics = {
    deleteByDocumentId(documentId) {
      return db.prepare('DELETE FROM analytics WHERE document_id = ?').run(documentId)
    },
    recordView(documentId, viewedAt) {
      return db
        .prepare(
          'INSERT INTO analytics (document_id, views, last_viewed_at) VALUES (?, 1, ?) ON CONFLICT(document_id) DO UPDATE SET views = analytics.views + 1, last_viewed_at = excluded.last_viewed_at',
        )
        .run(documentId, viewedAt)
    },
    recordClick(documentId) {
      return db
        .prepare(
          'INSERT INTO analytics (document_id, clicks) VALUES (?, 1) ON CONFLICT(document_id) DO UPDATE SET clicks = analytics.clicks + 1',
        )
        .run(documentId)
    },
    async findByUserId(userId) {
      const rows = await db
        .prepare(
          'SELECT d.id, d.data, p.slug, p.visibility, COALESCE(a.views, 0) AS views, COALESCE(a.clicks, 0) AS clicks, a.last_viewed_at AS "lastViewedAt" FROM documents d LEFT JOIN analytics a ON a.document_id = d.id LEFT JOIN publications p ON p.document_id = d.id WHERE d.user_id = ?',
        )
        .all(userId)
      return Promise.all(rows.map((row) => materializeDocument(db, row)))
    },
    countViews() {
      return db.prepare('SELECT COALESCE(SUM(views), 0) AS n FROM analytics').get()
    },
  }
  return Analytics
}

module.exports = createAnalyticsModel
