import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test, { beforeEach } from 'node:test';
import vm from 'node:vm';
import { handleConsoleApi } from '../src/lib/console-api.server.ts';

beforeEach(context => context.mock.timers.enable({ apis: ['Date'], now: Date.UTC(2026, 10, 6, 17) }));

// Exercise the actual authenticated endpoint with an in-memory D1 adapter.
// No Twilio connection, production database or real call is used.
const settings = {
  legal_seller_name: 'Qboid Businesses', trading_name: 'Better Found Online',
  approved_caller_id: '+12025550100', opening_script: 'Hello from Better Found Online.',
  recording_notice_script: 'Recording notice', calls_enabled: 1, ai_voice_enabled: 0,
  recording_enabled: 0, default_window_start: 0, default_window_end: 1439,
  record_retention_years: 5, national_dnc_checked_at: null, ai_voice_counsel_reviewed_at: null,
};
const valid = {
  phone: '+12025550123', recipientType: 'business', companyName: '', stateCode: 'FL',
  timezone: 'America/New_York', relationship: 'existing_customer', screeningBasis: 'business_line_verified',
  callMode: 'live_agent', recordingMode: 'off', consentType: 'none', consentEvidence: '', agentAttested: true,
};
function database(overrides = {}) {
  const writes = [];
  const DB = { prepare(sql) {
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async first() {
        if (sql.includes('FROM console_sessions s')) return { id: 1, username: 'agent', display_name: 'Test Agent', role: 'agent', email: null, active: 1 };
        if (sql.includes('FROM call_compliance_settings')) return { ...settings, ...overrides.settings };
        if (sql.includes('FROM console_suppressions')) return overrides.suppression || null;
        if (sql.includes('FROM call_state_policies')) return { state_code: 'FL', state_name: 'Florida', status: 'review_required', window_start: 0, window_end: 1439, ...overrides.policy };
        if (sql.includes('COUNT(*)')) return { count: overrides.recentCalls || 0 };
        if (sql.includes('FROM call_recipient_profiles')) return overrides.profile || null;
        throw new Error(`Unexpected SQL: ${sql}`);
      },
      async run() { writes.push({ sql, values }); return { meta: { changes: 1 } }; },
    };
  }};
  return { DB, writes };
}
async function review(payload = {}, overrides = {}) {
  const fixture = database(overrides);
  const response = await handleConsoleApi(new Request('https://console.example.test/api/console/call-preflight', {
    method: 'POST', headers: { authorization: 'Bearer test-session', 'content-type': 'application/json' },
    body: JSON.stringify({ ...valid, ...payload }),
  }), fixture);
  return { response, body: await response.json(), writes: fixture.writes };
}

test('verified live business call proceeds without a business name or AI consent', async () => {
  const { response, body, writes } = await review();
  assert.equal(response.status, 201);
  assert.equal(body.allowed, true);
  assert.deepEqual(body.reasons, []);
  assert.ok(body.warnings.some(value => value.includes('Florida')));
  const saved = writes.find(entry => entry.sql.includes('INSERT INTO call_recipient_profiles'));
  assert.equal(saved.values[2], '');
  assert.equal(writes.find(entry => entry.sql.includes('INSERT INTO call_preflight_logs')).values[14], 'allowed');
});

for (const [name, payload, overrides, reason] of [
  ['internal do-not-call', {}, { suppression: { reason: 'Do not contact' } }, /internal do-not-call/],
  ['recipient do-not-call', { screeningBasis: 'listed_do_not_call' }, {}, /marked do not call/],
  ['paused workspace', {}, { settings: { calls_enabled: 0 } }, /paused by an administrator/],
  ['blocked state', {}, { policy: { status: 'blocked' } }, /blocked by the current/],
  ['outside local hours', {}, { settings: { default_window_start: 1440, default_window_end: 1441 } }, /outside the/],
  ['unknown line', { recipientType: 'unknown' }, {}, /business or consumer/],
  ['unchecked business line', { screeningBasis: 'not_screened' }, {}, /business line or completed screening/],
  ['unchecked consumer line', { recipientType: 'consumer', screeningBasis: 'business_line_verified' }, {}, /Consumer lines require/],
  ['truthful caller identity unchecked', { agentAttested: false }, {}, /truthful identity/],
  ['unapproved AI voice', { callMode: 'ai_or_prerecorded' }, {}, /AI and prerecorded voice are disabled/],
  ['AI consent missing', { callMode: 'ai_or_prerecorded' }, { settings: { ai_voice_enabled: 1, ai_voice_counsel_reviewed_at: '2026-11-01' } }, /documented prior express written consent/],
  ['recording disabled', { recordingMode: 'on', recordingConsent: true }, {}, /recording is disabled/],
  ['recording permission missing', { recordingMode: 'on' }, { settings: { recording_enabled: 1 } }, /recipient consent/],
]) test(`${name} still blocks a call`, async () => {
  const { response, body } = await review(payload, overrides);
  assert.equal(response.status, 409);
  assert.equal(body.allowed, false);
  assert.ok(body.reasons.some(value => reason.test(value)), body.reasons.join('; '));
});

test('recipient location is still explicitly required', async () => {
  const { response, body } = await review({ stateCode: '', timezone: '' });
  assert.equal(response.status, 400);
  assert.match(body.error, /state and time zone/);
});

test('saved recipient facts are returned without inventing verification or consent', async () => {
  const profile = { recipient_type: 'business', us_state: 'FL', timezone: 'America/New_York', screening_basis: 'business_line_verified', company_name: '', consent_type: 'none' };
  const response = await handleConsoleApi(new Request('https://console.example.test/api/console/call-preflight?phone=%2B12025550123', { headers: { authorization: 'Bearer test-session' } }), database({ profile }));
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).profile, profile);
});

const clientSource = readFileSync(new URL('../public/console/assets/js/admin.js', import.meta.url), 'utf8');
function clientFixture(result = { id: 'manual-session' }, status = 201) {
  const nodes = new Map();
  const listeners = new Map();
  const timers = [];
  const requests = [];
  const events = new Map();
  let connects = 0;
  let disconnects = 0;
  function node(selector) {
    if (!nodes.has(selector)) nodes.set(selector, {
      value: '', checked: false, hidden: true, disabled: false, open: false, textContent: '', innerHTML: '',
      closest() { return this; }, setAttribute() {}, removeAttribute() {}, focus() {}, append() {}, remove() {},
      querySelectorAll() { return []; }, querySelector(s) { return node(s); },
      close() { this.open = false; }, showModal() { this.open = true; }, reset() {},
      addEventListener() {}, classList: { contains() { return true; }, toggle() {} },
    });
    return nodes.get(selector);
  }
  const storage = { getItem() { return null; }, setItem() {} };
  const context = vm.createContext({
    document: { querySelector: selector => selector === 'dialog[open]' ? null : node(selector), createElement: () => node('toast'), querySelectorAll() { return []; }, activeElement: { tagName: 'BUTTON' }, addEventListener(event, handler) { listeners.set(event, handler); } },
    localStorage: storage, sessionStorage: storage, navigator: {}, clearInterval() {},
    window: { setTimeout(fn) { timers.push(fn); }, setInterval() {}, addEventListener() {} }, Date, console,
    fetch: async (path, options) => { requests.push({ path, options }); return { ok: status < 400, status, json: async () => result }; },
  });
  const boundary = clientSource.lastIndexOf('  if ("serviceWorker" in navigator');
  vm.runInContext(`${clientSource.slice(0, boundary)}globalThis.fixture = {state, placeCall, cancelCall, endCallUI, registerEvents};})();`, context);
  const fixture = context.fixture;
  node('#phone-input').value = valid.phone;
  fixture.state.voice.device = { connect: async () => { connects++; return call; } };
  const call = { parameters: { CallSid: 'CA-current' }, on(event, fn) { events.set(event, fn); }, disconnect() { disconnects++; events.get('disconnect')?.(); }, status() { return 'pending'; } };
  return { ...fixture, node, context, listeners, requests, events, timers, call, connects: () => connects, disconnects: () => disconnects };
}

test('one click connects with only a phone number and no pre-call dialog', async () => {
  const fixture = clientFixture();
  await fixture.placeCall();
  assert.equal(fixture.connects(), 1);
  assert.equal(fixture.requests[0].path, '/api/console/calls');
  assert.deepEqual(JSON.parse(fixture.requests[0].options.body), { phone: valid.phone });
  assert.equal(fixture.node('#call-preflight-dialog').open, false);
  assert.equal(fixture.node('#in-call').hidden, false);
  assert.equal(fixture.state.voice.call, fixture.call);
  fixture.events.get('ringing')();
  assert.equal(fixture.node('#in-call-status').textContent, 'Ringing');
  fixture.events.get('accept')();
  assert.equal(fixture.node('#in-call-status').textContent, 'Connected');
});

test('double-clicking while the server responds creates one connection', async () => {
  const fixture = clientFixture();
  let resolve;
  fixture.context.fetch = () => new Promise(done => { resolve = done; });
  const pending = fixture.placeCall();
  await fixture.placeCall();
  resolve({ ok: true, status: 201, json: async () => ({ id: 'manual-session' }) });
  await pending;
  assert.equal(fixture.connects(), 1);
});

test('hang-up during the session request prevents a late connection', async () => {
  const fixture = clientFixture();
  let resolve;
  fixture.context.fetch = () => new Promise(done => { resolve = done; });
  const pending = fixture.placeCall();
  fixture.cancelCall();
  resolve({ ok: true, status: 201, json: async () => ({ id: 'manual-session' }) });
  await pending;
  assert.equal(fixture.connects(), 0);
  assert.equal(fixture.node('#in-call').hidden, true);
  assert.equal(fixture.state.voice.connecting, false);
});

test('hang-up while Twilio connects disconnects the late call', async () => {
  const fixture = clientFixture();
  let resolve;
  fixture.state.voice.device.connect = () => new Promise(done => { resolve = done; });
  const pending = fixture.placeCall();
  while (!resolve) await new Promise(done => setImmediate(done));
  fixture.cancelCall();
  resolve(fixture.call);
  await pending;
  assert.equal(fixture.disconnects(), 1);
  assert.equal(fixture.state.voice.call, null);
});

for (const [name, body, status] of [
  ['blocked number', { error: 'This number is on the internal do-not-call list.' }, 409],
  ['paused calling', { error: 'Outbound calling is paused by an administrator.' }, 409],
  ['incomplete session response', {}, 201],
]) test(`${name} never connects and restores the dialer`, async () => {
  const fixture = clientFixture(body, status);
  await fixture.placeCall();
  assert.equal(fixture.connects(), 0);
  assert.equal(fixture.node('#in-call').hidden, true);
  assert.equal(fixture.node('#call-button').disabled, false);
  assert.equal(fixture.state.voice.connecting, false);
  assert.equal(fixture.node('#call-preflight-dialog').open, false);
});

test('changing the dialed number during a call does not misattribute post-call feedback', async () => {
  const fixture = clientFixture();
  await fixture.placeCall();
  fixture.node('#phone-input').value = '+12025550999';
  fixture.context.fetch = async () => ({ ok: true, status: 200, json: async () => ({ calls: [
    { id: 'other', twilio_sid: 'CA-other', direction: 'outbound', counterpart: valid.phone },
    { id: 'current', twilio_sid: 'CA-current', direction: 'outbound', counterpart: valid.phone },
  ] }) });
  fixture.call.disconnect();
  assert.equal(fixture.node('#call-outcome-dialog').open, false);
  await fixture.timers.at(-1)();
  assert.equal(fixture.node('#call-event-id').value, 'current');
  assert.equal(fixture.node('#call-outcome-dialog').open, true);
});

test('an old call event cannot close a newer call', async () => {
  const fixture = clientFixture();
  await fixture.placeCall();
  const oldDisconnect = fixture.events.get('disconnect');
  fixture.state.voice.call = { parameters: { CallSid: 'CA-new' } };
  oldDisconnect();
  assert.equal(fixture.node('#in-call').hidden, false);
});

test('invalid number never requests a session', async () => {
  const fixture = clientFixture();
  fixture.node('#phone-input').value = 'abc';
  await fixture.placeCall();
  assert.equal(fixture.requests.length, 0);
  assert.equal(fixture.connects(), 0);
});
