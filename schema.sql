-- Trade Schools Database Schema for Cloudflare D1
-- Execute with: wrangler d1 execute trade-schools-db --file=schema.sql

-- Table for pending school submissions (awaiting admin approval)
CREATE TABLE IF NOT EXISTS pending_schools (
  id TEXT PRIMARY KEY,
  school_name TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  programs TEXT NOT NULL, -- JSON array
  program_other TEXT,
  school_description TEXT,
  submitter_name TEXT,
  submitted_at TEXT NOT NULL,
  client_ip TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Table for approved schools (live on the map)
CREATE TABLE IF NOT EXISTS approved_schools (
  id TEXT PRIMARY KEY,
  school_name TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  lat REAL, -- Geocoded latitude
  lon REAL, -- Geocoded longitude
  contact_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  programs TEXT NOT NULL, -- JSON array
  program_other TEXT,
  school_description TEXT,
  submitter_name TEXT,
  submitted_at TEXT NOT NULL,
  approved_at TEXT NOT NULL,
  approved_by TEXT,
  geocoded BOOLEAN DEFAULT FALSE,
  geocoded_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pending_schools_status ON pending_schools(status);
CREATE INDEX IF NOT EXISTS idx_pending_schools_submitted_at ON pending_schools(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_pending_schools_state ON pending_schools(state);
CREATE INDEX IF NOT EXISTS idx_pending_schools_name_city_state ON pending_schools(school_name, city, state);

CREATE INDEX IF NOT EXISTS idx_approved_schools_state ON approved_schools(state);
CREATE INDEX IF NOT EXISTS idx_approved_schools_name ON approved_schools(school_name);
CREATE INDEX IF NOT EXISTS idx_approved_schools_location ON approved_schools(city, state);
CREATE INDEX IF NOT EXISTS idx_approved_schools_geocoded ON approved_schools(geocoded);

-- Table for submission audit log
CREATE TABLE IF NOT EXISTS submission_audit_log (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  action TEXT NOT NULL, -- submitted, approved, rejected, edited
  performed_by TEXT,
  ip_address TEXT,
  user_agent TEXT,
  changes TEXT, -- JSON object with before/after
  timestamp TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_log_school_id ON submission_audit_log(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON submission_audit_log(timestamp DESC);

-- Table for admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'reviewer', -- reviewer, admin
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);

-- Insert default admin
INSERT OR IGNORE INTO admin_users (id, email, name, role)
VALUES ('admin-1', 'tom@bomforge.com', 'Tom', 'admin');

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_pending_schools_timestamp
AFTER UPDATE ON pending_schools
BEGIN
  UPDATE pending_schools SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_approved_schools_timestamp
AFTER UPDATE ON approved_schools
BEGIN
  UPDATE approved_schools SET updated_at = datetime('now') WHERE id = NEW.id;
END;
