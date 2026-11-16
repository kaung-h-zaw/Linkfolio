// Model: only database reads and writes belong in this file.

function createPaymentModel(db) {
  const Payment = {
    findStripeById(id) {
      return db.prepare("SELECT * FROM payments WHERE id = ? AND provider = 'stripe'").get(id)
    },
    markPaid(id) {
      return db.prepare("UPDATE payments SET status = 'paid' WHERE id = ?").run(id)
    },
    createDemo(id, userId, createdAt) {
      return db
        .prepare(
          "INSERT INTO payments (id, user_id, provider, created_at) VALUES (?, ?, 'demo', ?)",
        )
        .run(id, userId, createdAt)
    },
    createStripe(id, userId, createdAt) {
      return db
        .prepare(
          "INSERT INTO payments (id, user_id, provider, created_at) VALUES (?, ?, 'stripe', ?)",
        )
        .run(id, userId, createdAt)
    },
    findOwnedDemo(id, userId) {
      return db
        .prepare("SELECT * FROM payments WHERE id = ? AND user_id = ? AND provider = 'demo'")
        .get(id, userId)
    },
    updateStatus(status, id) {
      return db.prepare('UPDATE payments SET status = ? WHERE id = ?').run(status, id)
    },
    findOwnedStripe(id, userId) {
      return db
        .prepare("SELECT * FROM payments WHERE id = ? AND user_id = ? AND provider = 'stripe'")
        .get(id, userId)
    },
    countPaid() {
      return db.prepare("SELECT COUNT(*) AS n FROM payments WHERE status = 'paid'").get()
    },
  }
  return Payment
}

module.exports = createPaymentModel
