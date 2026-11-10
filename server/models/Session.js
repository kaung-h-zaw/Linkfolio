// Model: only database reads and writes belong in this file.

function createSessionModel(db) {
  const Session = {
    deleteByToken(tokenHash) {
      return db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash)
    },
    deleteExpired(currentTime) {
      return db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(currentTime)
    },
    create(tokenHash, userId, expiresAt) {
      return db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(tokenHash, userId, expiresAt)
    },
    findActiveUser(tokenHash, currentTime) {
      return db
        .prepare(
          'SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? AND u.disabled = 0',
        )
        .get(tokenHash, currentTime)
    },
    deleteByUserId(userId) {
      return db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId)
    },
  }
  return Session
}

module.exports = createSessionModel
