-- Additive domain tables. The existing documents row remains the editor
-- snapshot; these records are authoritative for structured content on reads.
CREATE TABLE IF NOT EXISTS relational_documents (
  document_id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS resumes (
  document_id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  title TEXT,
  template_id TEXT
);
CREATE TABLE IF NOT EXISTS portfolios (
  document_id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  resume_id TEXT REFERENCES resumes(document_id) ON DELETE CASCADE,
  title TEXT,
  template_id TEXT
);
CREATE TABLE IF NOT EXISTS profiles (
  document_id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  full_name TEXT, headline TEXT, email TEXT, phone TEXT, location TEXT,
  photo TEXT, summary TEXT, website TEXT, linkedin TEXT, github TEXT,
  extra_data TEXT NOT NULL, present_fields TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS themes (
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('resume', 'portfolio')),
  color TEXT, surface TEXT, font TEXT, layout TEXT,
  extra_data TEXT NOT NULL, present_fields TEXT NOT NULL,
  PRIMARY KEY (document_id, scope)
);
CREATE TABLE IF NOT EXISTS portfolio_settings (
  document_id TEXT PRIMARY KEY REFERENCES portfolios(document_id) ON DELETE CASCADE,
  contact INTEGER CHECK (contact IN (0, 1)),
  resume_download INTEGER CHECK (resume_download IN (0, 1)),
  extra_data TEXT NOT NULL, present_fields TEXT NOT NULL
);
-- Retain section headings, source format and order, including older drafts.
CREATE TABLE IF NOT EXISTS document_sections (
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('array', 'object')),
  options_data TEXT NOT NULL,
  PRIMARY KEY (document_id, section_key)
);
CREATE TABLE IF NOT EXISTS experiences (
  document_id TEXT NOT NULL, section_key TEXT NOT NULL, position INTEGER NOT NULL CHECK (position >= 0),
  entry_id TEXT, visible INTEGER CHECK (visible IN (0, 1)),
  job_title TEXT, company TEXT, employer_url TEXT, start_date TEXT, end_date TEXT,
  current INTEGER CHECK (current IN (0, 1)), location TEXT, content TEXT,
  extra_data TEXT NOT NULL, present_fields TEXT NOT NULL, primitive_data TEXT,
  PRIMARY KEY (document_id, section_key, position),
  FOREIGN KEY (document_id, section_key) REFERENCES document_sections(document_id, section_key) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS educations (
  document_id TEXT NOT NULL, section_key TEXT NOT NULL, position INTEGER NOT NULL CHECK (position >= 0),
  entry_id TEXT, visible INTEGER CHECK (visible IN (0, 1)),
  degree TEXT, school TEXT, school_url TEXT, start_date TEXT, end_date TEXT,
  current INTEGER CHECK (current IN (0, 1)), location TEXT, content TEXT,
  extra_data TEXT NOT NULL, present_fields TEXT NOT NULL, primitive_data TEXT,
  PRIMARY KEY (document_id, section_key, position),
  FOREIGN KEY (document_id, section_key) REFERENCES document_sections(document_id, section_key) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS skills (
  document_id TEXT NOT NULL, section_key TEXT NOT NULL, position INTEGER NOT NULL CHECK (position >= 0),
  entry_id TEXT, visible INTEGER CHECK (visible IN (0, 1)), name TEXT, level TEXT, content TEXT,
  extra_data TEXT NOT NULL, present_fields TEXT NOT NULL, primitive_data TEXT,
  PRIMARY KEY (document_id, section_key, position),
  FOREIGN KEY (document_id, section_key) REFERENCES document_sections(document_id, section_key) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS projects (
  document_id TEXT NOT NULL, section_key TEXT NOT NULL, position INTEGER NOT NULL CHECK (position >= 0),
  entry_id TEXT, visible INTEGER CHECK (visible IN (0, 1)),
  name TEXT, url TEXT, github TEXT, subtitle TEXT, start_date TEXT, end_date TEXT,
  current INTEGER CHECK (current IN (0, 1)), content TEXT,
  extra_data TEXT NOT NULL, present_fields TEXT NOT NULL, primitive_data TEXT,
  PRIMARY KEY (document_id, section_key, position),
  FOREIGN KEY (document_id, section_key) REFERENCES document_sections(document_id, section_key) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS certificates (
  document_id TEXT NOT NULL, section_key TEXT NOT NULL, position INTEGER NOT NULL CHECK (position >= 0),
  entry_id TEXT, visible INTEGER CHECK (visible IN (0, 1)),
  name TEXT, url TEXT, issuer TEXT, issue_date TEXT, expiry_date TEXT,
  no_expiry INTEGER CHECK (no_expiry IN (0, 1)), content TEXT,
  extra_data TEXT NOT NULL, present_fields TEXT NOT NULL, primitive_data TEXT,
  PRIMARY KEY (document_id, section_key, position),
  FOREIGN KEY (document_id, section_key) REFERENCES document_sections(document_id, section_key) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS links (
  document_id TEXT NOT NULL, section_key TEXT NOT NULL, position INTEGER NOT NULL CHECK (position >= 0),
  entry_id TEXT, type TEXT, name TEXT, label TEXT, url TEXT,
  extra_data TEXT NOT NULL, present_fields TEXT NOT NULL, primitive_data TEXT,
  PRIMARY KEY (document_id, section_key, position),
  FOREIGN KEY (document_id, section_key) REFERENCES document_sections(document_id, section_key) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS portfolios_resume ON portfolios(resume_id);
-- Admin is a user role, not a second copy of credentials. Reports are computed.
CREATE VIEW IF NOT EXISTS admins AS
  SELECT id AS user_id, full_name, email, created_at FROM users WHERE role = 'admin';
CREATE VIEW IF NOT EXISTS reports AS SELECT
  (SELECT COUNT(*) FROM users) AS user_count,
  (SELECT COUNT(*) FROM documents) AS document_count,
  (SELECT COUNT(*) FROM resumes) AS resume_count,
  (SELECT COUNT(*) FROM portfolios) AS portfolio_count,
  (SELECT COUNT(*) FROM publications WHERE visibility = 'public') AS published_count,
  (SELECT COUNT(*) FROM messages) AS message_count,
  (SELECT COALESCE(SUM(views), 0) FROM analytics) AS view_count,
  (SELECT COUNT(*) FROM payments WHERE status = 'paid') AS paid_upgrade_count;
