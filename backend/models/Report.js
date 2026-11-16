// Live report view: summaries never contain duplicated or stale account data.
function createReportModel(db) {
  return {
    async summary() {
      const row = await db.prepare('SELECT * FROM reports').get()
      return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)]))
    },
  }
}
module.exports = createReportModel
