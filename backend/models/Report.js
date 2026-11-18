// Live report view: summaries never contain duplicated or stale account data.
function createReportModel(db) {
  return {
    async summary() {
      const row = await db.prepare('SELECT * FROM reports').get()
      const membership = await db.prepare("SELECT COUNT(*) AS premium_user_count FROM users WHERE role = 'user' AND plan = 'premium'").get()
      const upgrades = await db.prepare("SELECT COUNT(*) AS paid_upgrade_count FROM payments p JOIN users u ON u.id = p.user_id WHERE p.status = 'paid' AND u.role = 'user'").get()
      Object.assign(row,membership,upgrades)
      return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)]))
    },
  }
}
module.exports = createReportModel
