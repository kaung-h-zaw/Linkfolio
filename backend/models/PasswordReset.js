// Model: only database reads and writes belong in this file.

function createPasswordResetModel(db) {
  const PasswordReset = {
    deletePreviousAndExpired(userId, currentTime) {
      return db
        .prepare('DELETE FROM password_resets WHERE user_id = ? OR expires_at < ?')
        .run(userId, currentTime)
    },
    create(tokenHash, userId, expiresAt) {
      return db
        .prepare('INSERT INTO password_resets VALUES (?, ?, ?)')
        .run(tokenHash, userId, expiresAt)
    },
    findActive(tokenHash, currentTime) {
      return db
        .prepare(`SELECT * FROM password_resets WHERE token_hash = ? AND expires_at > ?${db.engine === 'postgres' ? ' FOR UPDATE' : ''}`)
        .get(tokenHash, currentTime)
    },
    deleteByUserId(userId) {
      return db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(userId)
    },
  }
  return PasswordReset
}

module.exports = createPasswordResetModel
