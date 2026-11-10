const { DatabaseSync } = require('node:sqlite')
const { mkdirSync } = require('node:fs')
const { dirname } = require('node:path')

function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user',
      plan TEXT NOT NULL DEFAULT 'free', disabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS documents_owner ON documents(user_id);
    CREATE TABLE IF NOT EXISTS publications (
      document_id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
      slug TEXT NOT NULL UNIQUE, visibility TEXT NOT NULL DEFAULT 'private', updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS analytics (
      document_id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
      views INTEGER NOT NULL DEFAULT 0, clicks INTEGER NOT NULL DEFAULT 0, last_viewed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      sender_name TEXT NOT NULL, sender_email TEXT NOT NULL, message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT NOT NULL, kind TEXT NOT NULL, name TEXT NOT NULL,
      premium INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (id, kind)
    );
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, resume_limit INTEGER NOT NULL,
      portfolio_limit INTEGER NOT NULL, enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO plans VALUES ('free', 'Free', 1, 1, 1), ('premium', 'Premium', 20, 20, 1);
  `)
  const { templateSeeds } = require('./databaseSeeds')
  const insert = db.prepare(
    'INSERT OR IGNORE INTO templates (id, kind, name, premium) VALUES (?, ?, ?, ?)',
  )
  for (const values of templateSeeds) insert.run(...values)
  require('./relationalContent').initializeSqliteContent(db)
  return db
}

module.exports = { openDatabase }
