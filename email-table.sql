-- Table for email collection
CREATE TABLE IF NOT EXISTS email_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'map',
  subscribed_at TEXT DEFAULT (datetime('now')),
  ip_address TEXT,
  user_agent TEXT,
  unsubscribed BOOLEAN DEFAULT FALSE,
  unsubscribed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_subscribed ON email_subscribers(unsubscribed);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_created ON email_subscribers(created_at DESC);



