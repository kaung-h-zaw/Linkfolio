const { randomBytes, scrypt: scryptCallback, timingSafeEqual, createHash } = require('node:crypto')
const { promisify } = require('node:util')
const scrypt = promisify(scryptCallback)
// A session/reset token is a random secret. It is separate from a password.
const token = () => randomBytes(32).toString('hex')
const digest = (value) => createHash('sha256').update(value).digest('hex')
// Called when registering or resetting a password.
async function hashPassword(password) {
  // The salt makes two identical passwords produce different saved hashes.
  const salt = randomBytes(16).toString('hex')
  const hash = await scrypt(password, salt, 64)
  return `${salt}:${hash.toString('hex')}`
}
async function checkPassword(password, stored) {
  // Reuse the saved salt to hash the entered password, then compare the results.
  const [salt, encoded] = stored.split(':')
  const actual = await scrypt(password, salt, 64)
  const expected = Buffer.from(encoded, 'hex')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
function sessionCookie(req) {
  const value = (req.headers.cookie || '')
    .split(';')
    .map((x) => x.trim())
    .find((x) => x.startsWith('linkfolio_session='))
  return value?.slice('linkfolio_session='.length)
}
const publicUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  plan: row.plan,
})

module.exports = { hashPassword, checkPassword, sessionCookie, token, digest, publicUser }
