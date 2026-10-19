CREATE TABLE IF NOT EXISTS console_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'manager', 'agent')),
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_iterations INTEGER NOT NULL DEFAULT 120000,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS console_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES console_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS console_sessions_token_idx ON console_sessions(token_hash);
CREATE INDEX IF NOT EXISTS console_sessions_expiry_idx ON console_sessions(expires_at);

CREATE TABLE IF NOT EXISTS console_login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  succeeded INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS console_login_attempts_lookup_idx
  ON console_login_attempts(username, ip_hash, attempted_at);

CREATE TABLE IF NOT EXISTS outreach_events (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES console_users(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'call')),
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  counterpart TEXT NOT NULL,
  twilio_sid TEXT UNIQUE,
  status TEXT NOT NULL,
  body_preview TEXT,
  duration_seconds INTEGER,
  error_code TEXT,
  price REAL,
  price_unit TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS outreach_events_user_idx ON outreach_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS outreach_events_counterpart_idx ON outreach_events(counterpart, created_at);
CREATE INDEX IF NOT EXISTS outreach_events_channel_idx ON outreach_events(channel, direction, created_at);

CREATE TABLE IF NOT EXISTS console_contacts (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL UNIQUE,
  consent_status TEXT NOT NULL DEFAULT 'pending' CHECK (consent_status IN ('opted_in', 'pending', 'opted_out')),
  consent_source TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_by INTEGER REFERENCES console_users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS console_suppressions (
  phone TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
