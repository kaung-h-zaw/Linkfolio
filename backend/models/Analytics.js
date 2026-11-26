// Model: only database reads and writes belong in this file.
const { materializeDocument } = require('../database/relationalContent.js')

function calendarDate(formatter, timestamp) {
  const parts = Object.fromEntries(formatter.formatToParts(new Date(timestamp)).map(({ type, value }) => [type, value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

function createAnalyticsModel(db) {
  function recordActivity(documentId, timestamp, views, clicks) {
    return db.prepare(
      'INSERT INTO analytics_events (document_id, occurred_at, views, clicks) VALUES (?, ?, ?, ?) ON CONFLICT(document_id, occurred_at) DO UPDATE SET views = analytics_events.views + excluded.views, clicks = analytics_events.clicks + excluded.clicks',
    ).run(documentId, timestamp, views, clicks)
  }

  const Analytics = {
    async deleteByDocumentId(documentId) {
      await db.prepare('DELETE FROM analytics WHERE document_id = ?').run(documentId)
      await db.prepare('DELETE FROM analytics_daily WHERE document_id = ?').run(documentId)
      await db.prepare('DELETE FROM analytics_events WHERE document_id = ?').run(documentId)
    },
    recordView(documentId, viewedAt) {
      return db.atomic(async () => {
        await db.prepare(
          'INSERT INTO analytics (document_id, views, last_viewed_at) VALUES (?, 1, ?) ON CONFLICT(document_id) DO UPDATE SET views = analytics.views + 1, last_viewed_at = excluded.last_viewed_at',
        ).run(documentId, viewedAt)
        return recordActivity(documentId, viewedAt, 1, 0)
      })
    },
    recordClick(documentId, clickedAt) {
      return db.atomic(async () => {
        await db.prepare(
          'INSERT INTO analytics (document_id, clicks) VALUES (?, 1) ON CONFLICT(document_id) DO UPDATE SET clicks = analytics.clicks + 1',
        ).run(documentId)
        return recordActivity(documentId, clickedAt, 0, 1)
      })
    },
    async findByUserId(userId, timeZone = 'UTC') {
      const formatter = new Intl.DateTimeFormat('en', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' })
      // Include a buffer around the dashboard's longest range of 90 local days.
      const start = new Date(Date.now() - 91 * 86_400_000).toISOString()
      const [rows, history, events] = await Promise.all([
        db.prepare(
          'SELECT d.id, d.data, p.slug, p.visibility, COALESCE(a.views, 0) AS views, COALESCE(a.clicks, 0) AS clicks, a.last_viewed_at AS "lastViewedAt" FROM documents d LEFT JOIN analytics a ON a.document_id = d.id LEFT JOIN publications p ON p.document_id = d.id WHERE d.user_id = ?',
        ).all(userId),
        db.prepare(
          'SELECT ad.document_id AS "documentId", ad.activity_date AS "date", ad.views, ad.clicks FROM analytics_daily ad JOIN documents d ON d.id = ad.document_id WHERE d.user_id = ? ORDER BY ad.activity_date',
        ).all(userId),
        db.prepare(
          'SELECT e.document_id AS "documentId", e.occurred_at AS "occurredAt", e.views, e.clicks FROM analytics_events e JOIN documents d ON d.id = e.document_id WHERE d.user_id = ? AND e.occurred_at >= ?',
        ).all(userId, start),
      ])
      const byDocument = new Map(rows.map(({ id }) => [id, new Map()]))
      for (const entry of history) byDocument.get(entry.documentId)?.set(entry.date, entry)
      for (const { documentId, occurredAt, views, clicks } of events) {
        const days = byDocument.get(documentId)
        if (!days) continue
        const date = calendarDate(formatter, occurredAt)
        const daily = days.get(date) || { documentId, date, views:0, clicks:0 }
        daily.views += views
        daily.clicks += clicks
        days.set(date, daily)
      }
      const materialized = await Promise.all(rows.map((row) => materializeDocument(db, row)))
      return materialized.map((row) => ({
        ...row,
        history: [...byDocument.get(row.id).values()].sort((a, b) => a.date.localeCompare(b.date)),
      }))
    },
    countViews() {
      return db.prepare('SELECT COALESCE(SUM(views), 0) AS n FROM analytics').get()
    },
  }
  return Analytics
}

module.exports = createAnalyticsModel
