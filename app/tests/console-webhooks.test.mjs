import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { handleConsoleApi } from '../src/lib/console-api.server.ts';

const token = 'test-only-webhook-secret';
const endpoint = 'https://console.example.test/api/console/voice-webhook';
const phone = '+12025550123';
const callerId = '+12025550100';
// Twilio's documented signing contract: case-sensitive key order; unique,
// case-sensitive sorted values for repeated form fields. No live calls occur.
function sign(url, entries) {
  const grouped = new Map();
  for (const [name, value] of entries) {
    if (!grouped.has(name)) grouped.set(name, new Set());
    grouped.get(name).add(value);
  }
  const message = [...grouped.keys()].sort().reduce((result, name) => result + [...grouped.get(name)].sort().map(value => name + value).join(''), url);
  return createHmac('sha1', token).update(message).digest('base64');
}
function form(extra = {}) {
  return Object.entries({
    AccountSid: 'AC-test', ApiVersion: '2010-04-01', ApplicationSid: 'AP-test',
    CallSid: 'CA-test', CallStatus: 'ringing', Called: '', Caller: '',
    From: 'client:bfo_user_1', To: '', TargetNumber: phone,
    PreflightId: 'review-1', CallMode: 'live_agent', Recording: 'off', ...extra,
  });
}
function fixture(t) {
  const sql = new DatabaseSync(':memory:');
  for (const name of ['0002_outreach_console.sql', '0003_console_crm.sql', '0004_call_compliance.sql']) sql.exec(readFileSync(new URL(`../migrations/${name}`, import.meta.url), 'utf8'));
  sql.prepare("INSERT INTO console_users (id,username,display_name,password_salt,password_hash) VALUES (1,'test','Test Agent','test','test')").run();
  sql.prepare(`INSERT INTO call_preflight_logs
    (id,user_id,phone,recipient_type,state_code,timezone,relationship,screening_basis,call_mode,recording_mode,caller_id,seller_identity,decision,agent_attested,expires_at)
    VALUES ('review-1',1,?,'business','FL','America/New_York','existing_customer','business_line_verified','live_agent','off',?,'Better Found Online','allowed',1,'2099-01-01 00:00:00')`).run(phone, callerId);
  const DB = { prepare(query) {
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async first() { return sql.prepare(query).get(...values) || null; },
      async run() { const result = sql.prepare(query).run(...values); return { meta: { changes: result.changes } }; },
      async all() { return { results: sql.prepare(query).all(...values) }; },
    };
  }};
  t.after(() => sql.close());
  return { sql, env: { DB, TWILIO_AUTH_TOKEN: token, TWILIO_CALLER_ID: callerId } };
}
function request(entries = form(), { url = endpoint, signature = sign(url, entries) } = {}) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'X-Twilio-Signature': signature }, body: new URLSearchParams(entries) });
}

test('valid Twilio voice callback reaches Dial and writes attribution using the real schema', async t => {
  const { env, sql } = fixture(t);
  const response = await handleConsoleApi(request(), env);
  assert.equal(response.status, 200, await response.clone().text());
  const body = await response.text();
  assert.match(response.headers.get('content-type'), /xml/);
  assert.match(body, /<Dial/);
  assert.ok(body.includes(`callerId="${callerId}"`));
  assert.ok(body.includes(`>${phone}</Number>`));
  assert.doesNotMatch(body, /record="/);
  assert.equal(sql.prepare('SELECT user_id FROM outreach_events').get().user_id, 1);
});

test('signature verification is independent of parameter arrival order', async t => {
  const { env } = fixture(t);
  const response = await handleConsoleApi(request(form().reverse()), env);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /<Dial/);
});

test('repeated form values match the Twilio SDK signing contract', async t => {
  const { env } = fixture(t);
  const entries = [...form(), ['CustomTag', 'a'], ['CustomTag', 'Z'], ['CustomTag', 'Z']];
  const response = await handleConsoleApi(request(entries), env);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /<Dial/);
});

for (const [name, make] of [
  ['missing signature', () => request(form(), { signature: '' })],
  ['wrong signature', () => request(form(), { signature: 'not-a-valid-signature' })],
  ['tampered destination', () => request(form({ TargetNumber: '+12025550199' }), { signature: sign(endpoint, form()) })],
  ['signature from another URL', () => request(form(), { signature: sign('https://different.example.test/api/console/voice-webhook', form()) })],
]) test(`${name} is rejected before any call is logged`, async t => {
  const { env, sql } = fixture(t);
  const response = await handleConsoleApi(make(), env);
  assert.equal(response.status, 403);
  assert.equal(sql.prepare('SELECT COUNT(*) AS count FROM outreach_events').get().count, 0);
});

for (const [name, setup, extra] of [
  ['expired review', sql => sql.exec("UPDATE call_preflight_logs SET expires_at='2000-01-01 00:00:00'"), {}],
  ['missing review', () => {}, { PreflightId: 'missing' }],
  ['different caller', () => {}, { From: 'client:bfo_user_2' }],
  ['different destination', () => {}, { TargetNumber: '+12025550199' }],
  ['new do-not-call entry', sql => sql.prepare("INSERT INTO console_suppressions (phone,reason,source) VALUES (?,'Do not call','test')").run(phone), {}],
]) test(`${name} returns a controlled explanation and never dials`, async t => {
  const { env, sql } = fixture(t); setup(sql);
  const response = await handleConsoleApi(request(form(extra)), env);
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /<Say>/);
  assert.match(body, /<Hangup\s*\/>/);
  assert.doesNotMatch(body, /<Dial/);
  assert.equal(sql.prepare('SELECT COUNT(*) AS count FROM outreach_events').get().count, 0);
});

test('client-supplied recording and caller ID cannot override the approved review', async t => {
  const { env } = fixture(t);
  const response = await handleConsoleApi(request(form({ Recording: 'on', CallerId: '+12025550199' })), env);
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.doesNotMatch(body, /record="/);
  assert.ok(body.includes(`callerId="${callerId}"`));
});

test('signed call status updates are accepted using the same validator', async t => {
  const { env, sql } = fixture(t);
  const first = await handleConsoleApi(request(), env);
  assert.equal(first.status, 200);
  const entries = form({ CallStatus: 'completed', CallDuration: '24' });
  const url = 'https://console.example.test/api/console/call-status-webhook';
  const response = await handleConsoleApi(request(entries, { url }), env);
  assert.equal(response.status, 204);
  const row = sql.prepare('SELECT status,duration_seconds FROM outreach_events').get();
  assert.equal(row.status, 'completed');
  assert.equal(row.duration_seconds, 24);
});
