const { randomUUID } = require('node:crypto')
const { hashPassword, checkPassword, token } = require('../utils/security.js')
const { requireValue } = require('../utils/validation.js')

// Unknown emails still run a password check, keeping failed logins similar in timing.
const dummyHash = hashPassword(token())

// Like the recipe app: account operations live in User.register and User.login.

function createUserModel(db) {
  const User = {
    async register(fullName, email, password) {
      // 1. Reject duplicate emails before doing the expensive password hash.
      requireValue(!(await User.findIdByEmail(email)), 'An account with this email already exists.', 409)
      // 2. Save a salted hash, never the password entered in the form.
      const hash = await hashPassword(password)
      // Another request may have registered this email while hashing.
      requireValue(!(await User.findIdByEmail(email)), 'An account with this email already exists.', 409)
      // 3. Create and return the account so the controller can sign it in.
      const id = randomUUID()
      await User.create(id, fullName, email, hash, new Date().toISOString())
      return User.findById(id)
    },
    async login(email, password) {
      // Find the account and compare the entered password with its saved hash.
      const user = await User.findByEmail(email)
      const valid = await checkPassword(password, user?.password_hash || (await dummyHash))
      requireValue(user && valid && !user.disabled, 'Email or password is incorrect.', 401)
      return user
    },
    findById(id) {
      return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    },
    lockDocuments(id) {
      return db.prepare(`SELECT id FROM users WHERE id = ?${db.engine === 'postgres' ? ' FOR UPDATE' : ''}`).get(id)
    },
    downgrade(id) {
      return db.prepare("UPDATE users SET plan = 'free' WHERE id = ?").run(id)
    },
    upgrade(id) {
      return db.prepare("UPDATE users SET plan = 'premium' WHERE id = ?").run(id)
    },
    findIdByEmail(email) {
      return db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    },
    create(id, fullName, email, passwordHash, createdAt) {
      return db
        .prepare(
          'INSERT INTO users (id, full_name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
        )
        .run(id, fullName, email, passwordHash, createdAt)
    },
    findByEmail(email) {
      return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    },
    updateName(fullName, id) {
      return db.prepare('UPDATE users SET full_name = ? WHERE id = ?').run(fullName, id)
    },
    deleteById(id) {
      return db.prepare('DELETE FROM users WHERE id = ?').run(id)
    },
    findActiveByEmail(email) {
      return db.prepare('SELECT * FROM users WHERE email = ? AND disabled = 0').get(email)
    },
    updatePassword(passwordHash, id) {
      return db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id)
    },
    find() {
      return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all()
    },
    updateDisabled(disabled, id) {
      return db.prepare('UPDATE users SET disabled = ? WHERE id = ?').run(disabled, id)
    },
  }
  return User
}

module.exports = createUserModel
