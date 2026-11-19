require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') })
const { randomUUID } = require('node:crypto')
const { openConfiguredDatabase } = require('../database/configured.js')
const { hashPassword } = require('../utils/security.js')
const { email, password, text } = require('../utils/validation.js')

async function createAdmin() {
  const address = email(process.env.ADMIN_EMAIL)
  const secret = password(process.env.ADMIN_PASSWORD)
  const name = text(process.env.ADMIN_NAME || 'Administrator', 'Admin name', 120)
  const db = await openConfiguredDatabase()
  try {
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(address)
  const hash = await hashPassword(secret)
  if (existing)
    await db.prepare("UPDATE users SET role = 'admin', disabled = 0, password_hash = ? WHERE id = ?").run(
      hash,
      existing.id,
    )
  else
    await db.prepare(
      "INSERT INTO users (id, full_name, email, password_hash, role, plan, created_at) VALUES (?, ?, ?, ?, 'admin', 'premium', ?)",
    ).run(randomUUID(), name, address, hash, new Date().toISOString())
  if (existing) await db.prepare('DELETE FROM sessions WHERE user_id = ?').run(existing.id)
  console.log(`Administrator account ready for ${address}.`)
  } finally { await db.close() }
}

createAdmin().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
