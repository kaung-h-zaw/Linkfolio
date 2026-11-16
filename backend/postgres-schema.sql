-- Linkfolio uses its existing Express authentication. These tables are in a
-- private schema, outside Supabase's default public Data API schema.
-- Startup also applies schema/relational-content.sql and backfills domain rows.
CREATE SCHEMA IF NOT EXISTS linkfolio;
CREATE TABLE IF NOT EXISTS linkfolio.users (
  id TEXT PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user',
  plan TEXT NOT NULL DEFAULT 'free', disabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS linkfolio.sessions (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES linkfolio.users(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS linkfolio.password_resets (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES linkfolio.users(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS linkfolio.documents (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES linkfolio.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS documents_owner ON linkfolio.documents(user_id);
CREATE TABLE IF NOT EXISTS linkfolio.publications (
  document_id TEXT PRIMARY KEY REFERENCES linkfolio.documents(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE, visibility TEXT NOT NULL DEFAULT 'private', updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS linkfolio.analytics (
  document_id TEXT PRIMARY KEY REFERENCES linkfolio.documents(id) ON DELETE CASCADE,
  views INTEGER NOT NULL DEFAULT 0, clicks INTEGER NOT NULL DEFAULT 0, last_viewed_at TEXT
);
CREATE TABLE IF NOT EXISTS linkfolio.analytics_daily (
  document_id TEXT NOT NULL REFERENCES linkfolio.documents(id) ON DELETE CASCADE,
  activity_date TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 0, clicks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (document_id, activity_date)
);
INSERT INTO linkfolio.analytics_daily (document_id, activity_date, views, clicks)
  SELECT document_id, substring(last_viewed_at from 1 for 10), views, clicks
  FROM linkfolio.analytics WHERE last_viewed_at IS NOT NULL
  ON CONFLICT (document_id, activity_date) DO NOTHING;
CREATE TABLE IF NOT EXISTS linkfolio.messages (
  id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES linkfolio.documents(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL, sender_email TEXT NOT NULL, message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread', created_at TEXT NOT NULL, deleted_at TEXT
);
ALTER TABLE linkfolio.messages ADD COLUMN IF NOT EXISTS deleted_at TEXT;
CREATE TABLE IF NOT EXISTS linkfolio.templates (
  id TEXT NOT NULL, kind TEXT NOT NULL, name TEXT NOT NULL,
  premium INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (id, kind)
);
CREATE TABLE IF NOT EXISTS linkfolio.plans (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, resume_limit INTEGER NOT NULL,
  portfolio_limit INTEGER NOT NULL, enabled INTEGER NOT NULL DEFAULT 1
);
UPDATE linkfolio.plans SET portfolio_limit = 3 WHERE id = 'premium' AND portfolio_limit = 20;
CREATE TABLE IF NOT EXISTS linkfolio.payments (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES linkfolio.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL
);
