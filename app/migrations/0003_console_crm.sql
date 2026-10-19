ALTER TABLE console_users ADD COLUMN receive_calls INTEGER NOT NULL DEFAULT 1 CHECK (receive_calls IN (0, 1));

ALTER TABLE outreach_events ADD COLUMN lead_id TEXT REFERENCES console_leads(id) ON DELETE SET NULL;
ALTER TABLE outreach_events ADD COLUMN disposition TEXT;
ALTER TABLE outreach_events ADD COLUMN notes TEXT;
ALTER TABLE outreach_events ADD COLUMN tags_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE outreach_events ADD COLUMN scheduled_at TEXT;

CREATE TABLE IF NOT EXISTS console_leads (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual',
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new','contacted','qualified','proposal','won','lost')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  owner_user_id INTEGER REFERENCES console_users(id) ON DELETE SET NULL,
  next_follow_up_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_by INTEGER REFERENCES console_users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS console_leads_stage_idx ON console_leads(stage, updated_at);
CREATE INDEX IF NOT EXISTS console_leads_owner_idx ON console_leads(owner_user_id, updated_at);
CREATE INDEX IF NOT EXISTS outreach_events_lead_idx ON outreach_events(lead_id, created_at);
CREATE INDEX IF NOT EXISTS outreach_events_schedule_idx ON outreach_events(scheduled_at, status);

CREATE TABLE IF NOT EXISTS console_tasks (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES console_leads(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES console_users(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES console_users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  due_at TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS console_tasks_due_idx ON console_tasks(status, due_at);

CREATE TABLE IF NOT EXISTS console_presence (
  user_id INTEGER PRIMARY KEY REFERENCES console_users(id) ON DELETE CASCADE,
  voice_identity TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1)),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);
