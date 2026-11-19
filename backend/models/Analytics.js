// Model: only database reads and writes belong in this file.
const { materializeDocument } = require('../database/relationalContent.js')

function createAnalyticsModel(db) {
  const Analytics = {
    deleteByDocumentId(documentId) {
      return db.prepare('DELETE FROM analytics WHERE document_id = ?').run(documentId)
    },
    recordView(documentId, viewedAt) {
      const day = viewedAt.slice(0, 10)
      return db.atomic(async () => {
        await db.prepare(
          'INSERT INTO analytics (document_id, views, last_viewed_at) VALUES (?, 1, ?) ON CONFLICT(document_id) DO UPDATE SET views = analytics.views + 1, last_viewed_at = excluded.last_viewed_at',
        ).run(documentId, viewedAt)
        return db.prepare(
          'INSERT INTO analytics_daily (document_id, activity_date, views) VALUES (?, ?, 1) ON CONFLICT(document_id, activity_date) DO UPDATE SET views = analytics_daily.views + 1',
        ).run(documentId, day)
      })
    },
    recordClick(documentId, clickedAt) {
      const day = clickedAt.slice(0, 10)
      return db.atomic(async () => {
        await db.prepare(
          'INSERT INTO analytics (document_id, clicks) VALUES (?, 1) ON CONFLICT(document_id) DO UPDATE SET clicks = analytics.clicks + 1',
        ).run(documentId)
        return db.prepare(
          'INSERT INTO analytics_daily (document_id, activity_date, clicks) VALUES (?, ?, 1) ON CONFLICT(document_id, activity_date) DO UPDATE SET clicks = analytics_daily.clicks + 1',
        ).run(documentId, day)
      })
    },
    async findByUserId(userId) {
      const [rows, history] = await Promise.all([
        db.prepare(
          'SELECT d.id, d.data, p.slug, p.visibility, COALESCE(a.views, 0) AS views, COALESCE(a.clicks, 0) AS clicks, a.last_viewed_at AS "lastViewedAt" FROM documents d LEFT JOIN analytics a ON a.document_id = d.id LEFT JOIN publications p ON p.document_id = d.id WHERE d.user_id = ?',
        ).all(userId),
        db.prepare(
          'SELECT ad.document_id AS "documentId", ad.activity_date AS "date", ad.views, ad.clicks FROM analytics_daily ad JOIN documents d ON d.id = ad.document_id WHERE d.user_id = ? ORDER BY ad.activity_date',
        ).all(userId),
      ])
      const materialized = await Promise.all(rows.map((row) => materializeDocument(db, row)))
      return materialized.map((row) => ({
        ...row,
        history: history.filter((entry) => entry.documentId === row.id),
      }))
    },
    countViews() {
      return db.prepare('SELECT COALESCE(SUM(views), 0) AS n FROM analytics').get()
    },
  }
  return Analytics
}

module.exports = createAnalyticsModel
