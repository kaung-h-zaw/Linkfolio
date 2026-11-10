// Model: only database reads and writes belong in this file.

function createPlanModel(db) {
  const Plan = {
    findById(id) {
      return db.prepare('SELECT * FROM plans WHERE id = ?').get(id)
    },
    find() {
      return db.prepare('SELECT * FROM plans').all()
    },
    findPremiumAvailability() {
      return db.prepare("SELECT enabled FROM plans WHERE id = 'premium'").get()
    },
    update(resumeLimit, portfolioLimit, enabled, id) {
      return db
        .prepare('UPDATE plans SET resume_limit = ?, portfolio_limit = ?, enabled = ? WHERE id = ?')
        .run(resumeLimit, portfolioLimit, enabled, id)
    },
  }
  return Plan
}

module.exports = createPlanModel
