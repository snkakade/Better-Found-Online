CREATE TABLE IF NOT EXISTS call_compliance_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  legal_seller_name TEXT NOT NULL DEFAULT 'Qboid Businesses',
  trading_name TEXT NOT NULL DEFAULT 'Better Found Online',
  approved_caller_id TEXT NOT NULL DEFAULT '+15707077078',
  opening_script TEXT NOT NULL DEFAULT 'Hello, this is {{agent}} calling from Better Found Online, the trading name of Qboid Businesses. I am calling about our digital services for {{company}}.',
  recording_notice_script TEXT NOT NULL DEFAULT 'This call may be recorded with your permission.',
  calls_enabled INTEGER NOT NULL DEFAULT 1 CHECK (calls_enabled IN (0, 1)),
  ai_voice_enabled INTEGER NOT NULL DEFAULT 0 CHECK (ai_voice_enabled IN (0, 1)),
  recording_enabled INTEGER NOT NULL DEFAULT 0 CHECK (recording_enabled IN (0, 1)),
  default_window_start INTEGER NOT NULL DEFAULT 480,
  default_window_end INTEGER NOT NULL DEFAULT 1200,
  record_retention_years INTEGER NOT NULL DEFAULT 5,
  national_dnc_checked_at TEXT,
  state_policy_reviewed_at TEXT,
  ai_voice_counsel_reviewed_at TEXT,
  updated_by INTEGER REFERENCES console_users(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO call_compliance_settings (id) VALUES (1);

CREATE TABLE IF NOT EXISTS call_state_policies (
  state_code TEXT PRIMARY KEY,
  state_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'review_required' CHECK (status IN ('approved', 'review_required', 'blocked')),
  window_start INTEGER NOT NULL DEFAULT 480,
  window_end INTEGER NOT NULL DEFAULT 1200,
  notes TEXT NOT NULL DEFAULT '',
  reviewed_by INTEGER REFERENCES console_users(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO call_state_policies (state_code, state_name) VALUES
  ('AL','Alabama'),('AK','Alaska'),('AZ','Arizona'),('AR','Arkansas'),('CA','California'),
  ('CO','Colorado'),('CT','Connecticut'),('DE','Delaware'),('DC','District of Columbia'),('FL','Florida'),
  ('GA','Georgia'),('HI','Hawaii'),('ID','Idaho'),('IL','Illinois'),('IN','Indiana'),
  ('IA','Iowa'),('KS','Kansas'),('KY','Kentucky'),('LA','Louisiana'),('ME','Maine'),
  ('MD','Maryland'),('MA','Massachusetts'),('MI','Michigan'),('MN','Minnesota'),('MS','Mississippi'),
  ('MO','Missouri'),('MT','Montana'),('NE','Nebraska'),('NV','Nevada'),('NH','New Hampshire'),
  ('NJ','New Jersey'),('NM','New Mexico'),('NY','New York'),('NC','North Carolina'),('ND','North Dakota'),
  ('OH','Ohio'),('OK','Oklahoma'),('OR','Oregon'),('PA','Pennsylvania'),('RI','Rhode Island'),
  ('SC','South Carolina'),('SD','South Dakota'),('TN','Tennessee'),('TX','Texas'),('UT','Utah'),
  ('VT','Vermont'),('VA','Virginia'),('WA','Washington'),('WV','West Virginia'),('WI','Wisconsin'),
  ('WY','Wyoming');

CREATE TABLE IF NOT EXISTS call_recipient_profiles (
  phone TEXT PRIMARY KEY,
  recipient_type TEXT NOT NULL DEFAULT 'unknown' CHECK (recipient_type IN ('business', 'consumer', 'unknown')),
  company_name TEXT NOT NULL DEFAULT '',
  us_state TEXT REFERENCES call_state_policies(state_code) ON DELETE SET NULL,
  timezone TEXT NOT NULL DEFAULT '',
  relationship TEXT NOT NULL DEFAULT 'cold_business' CHECK (relationship IN ('cold_business', 'existing_customer', 'requested_call', 'other')),
  screening_basis TEXT NOT NULL DEFAULT 'not_screened' CHECK (screening_basis IN ('not_screened', 'business_line_verified', 'screened_clear', 'listed_do_not_call')),
  screening_checked_at TEXT,
  consent_type TEXT NOT NULL DEFAULT 'none' CHECK (consent_type IN ('none', 'express', 'express_written')),
  consent_obtained_at TEXT,
  consent_evidence TEXT NOT NULL DEFAULT '',
  ai_voice_consent INTEGER NOT NULL DEFAULT 0 CHECK (ai_voice_consent IN (0, 1)),
  recording_consent INTEGER NOT NULL DEFAULT 0 CHECK (recording_consent IN (0, 1)),
  business_verified_at TEXT,
  updated_by INTEGER REFERENCES console_users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS call_preflight_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES console_users(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  state_code TEXT,
  timezone TEXT NOT NULL DEFAULT '',
  recipient_local_time TEXT,
  relationship TEXT NOT NULL,
  screening_basis TEXT NOT NULL,
  call_mode TEXT NOT NULL CHECK (call_mode IN ('live_agent', 'ai_or_prerecorded')),
  recording_mode TEXT NOT NULL CHECK (recording_mode IN ('off', 'on')),
  caller_id TEXT NOT NULL,
  seller_identity TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('allowed', 'blocked')),
  reasons_json TEXT NOT NULL DEFAULT '[]',
  warnings_json TEXT NOT NULL DEFAULT '[]',
  agent_attested INTEGER NOT NULL DEFAULT 0 CHECK (agent_attested IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS call_preflight_phone_idx ON call_preflight_logs(phone, created_at);
CREATE INDEX IF NOT EXISTS call_preflight_user_idx ON call_preflight_logs(user_id, created_at);

CREATE TABLE IF NOT EXISTS call_compliance_events (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES console_users(id) ON DELETE SET NULL,
  phone TEXT,
  event_type TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS call_compliance_events_time_idx ON call_compliance_events(created_at);
CREATE INDEX IF NOT EXISTS call_compliance_events_phone_idx ON call_compliance_events(phone, created_at);

ALTER TABLE outreach_events ADD COLUMN call_preflight_id TEXT;
ALTER TABLE outreach_events ADD COLUMN caller_id_used TEXT;
ALTER TABLE outreach_events ADD COLUMN call_mode TEXT;
ALTER TABLE outreach_events ADD COLUMN recording_mode TEXT;
ALTER TABLE outreach_events ADD COLUMN seller_identity TEXT;
ALTER TABLE outreach_events ADD COLUMN recipient_local_time TEXT;

