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
function clientFixture(result = {}, status = 201) {
  const nodes = new Map();
  function node(selector) {
    if (!nodes.has(selector)) nodes.set(selector, {
      value: '', checked: false, hidden: false, disabled: false, open: true, textContent: '', innerHTML: '',
      closest() { return this; }, setAttribute() {}, removeAttribute() {}, focus() {},
      querySelectorAll() { return []; }, querySelector(s) { return node(s); },
      close() { this.open = false; }, showModal() { this.open = true; }, reset() {},
    });
    return nodes.get(selector);
  }
  const storage = { getItem() { return null; }, setItem() {} };
  const context = vm.createContext({
    document: { querySelector: node, querySelectorAll() { return []; } },
    localStorage: storage, sessionStorage: storage, navigator: {},
    window: { setTimeout() {} }, Date, console,
    fetch: async () => ({ ok: status < 400, status, json: async () => result }),
  });
  // Expose the real functions in the test VM, without running application boot.
  const boundary = clientSource.lastIndexOf('  if ("serviceWorker" in navigator');
  vm.runInContext(`${clientSource.slice(0, boundary)}globalThis.fixture = {state, handleCallPreflight, renderPreflightResult, togglePreflightConsentFields, openCallPreflight};})();`, context);
  const fixture = context.fixture;
  for (const [selector, value] of Object.entries({
    '#phone-input': valid.phone, '#preflight-recipient-type': valid.recipientType,
    '#preflight-state': valid.stateCode, '#preflight-timezone': valid.timezone,
    '#preflight-screening': valid.screeningBasis, '#preflight-relationship': valid.relationship,
    '#preflight-call-mode': 'live_agent', '#preflight-recording-mode': 'off', '#preflight-consent-type': 'none',
  })) node(selector).value = value;
  node('#preflight-attestation').checked = true;
  fixture.state.compliance = {};
  let connects = 0;
  let disconnects = 0;
  fixture.state.voice.device = { connect: async () => { connects++; return { on() {}, disconnect() { disconnects++; } }; } };
  return { ...fixture, node, context, connects: () => connects, disconnects: () => disconnects };
}
const allowedResult = () => ({ id: 'test-review', allowed: true, expiresAt: new Date(Date.now() + 600000).toISOString(), reasons: [], warnings: ['State policy review pending.'], checks: [] });
const submit = fixture => fixture.handleCallPreflight({ preventDefault() {} });

test('one submit connects after a successful check, including non-blocking warnings', async () => {
  const fixture = clientFixture(allowedResult());
  await submit(fixture);
  assert.equal(fixture.connects(), 1);
  assert.equal(fixture.node('#call-preflight-dialog').open, false);
  assert.match(fixture.node('#dial-review-notes').innerHTML, /State policy review pending/);
});

test('a blocked review leaves the dialog open and never connects', async () => {
  const fixture = clientFixture({ allowed: false, reasons: ['This number is on the internal do-not-call list.'], warnings: ['State policy review pending.'] }, 409);
  await submit(fixture);
  assert.equal(fixture.connects(), 0);
  assert.equal(fixture.node('#call-preflight-dialog').open, true);
  assert.match(fixture.node('#preflight-result').innerHTML, /Before you can call/);
  assert.doesNotMatch(fixture.node('#preflight-result').innerHTML, /State policy review/);
  assert.match(fixture.node('#preflight-notes').innerHTML, /These do not block/);
  assert.equal(fixture.node('#preflight-submit').disabled, false);
});

test('duplicate submits while a check is pending create only one connection', async () => {
  const fixture = clientFixture();
  let resolve;
  fixture.context.fetch = () => new Promise(done => { resolve = done; });
  const pending = submit(fixture);
  await submit(fixture);
  resolve({ ok: true, status: 201, json: async () => allowedResult() });
  await pending;
  assert.equal(fixture.connects(), 1);
});

test('validation errors are shown as problems rather than a successful check', async () => {
  const fixture = clientFixture({ error: 'Choose the recipient state and time zone' }, 400);
  await submit(fixture);
  assert.equal(fixture.connects(), 0);
  assert.match(fixture.node('#preflight-result').innerHTML, /Choose the recipient state and time zone/);
  assert.doesNotMatch(fixture.node('#preflight-result').innerHTML, /Ready to connect/);
  assert.equal(fixture.node('#preflight-submit').disabled, false);
});

test('an incomplete review response never starts a call or claims success', async () => {
  const fixture = clientFixture({});
  await submit(fixture);
  assert.equal(fixture.connects(), 0);
  assert.match(fixture.node('#preflight-result').innerHTML, /could not be completed/);
});

test('closing the dialog while checks run prevents a late connection', async () => {
  const fixture = clientFixture();
  let resolve;
  fixture.context.fetch = () => new Promise(done => { resolve = done; });
  const pending = submit(fixture);
  fixture.node('#call-preflight-dialog').close();
  fixture.state.voice.reviewRequest++;
  resolve({ ok: true, status: 201, json: async () => allowedResult() });
  await pending;
  assert.equal(fixture.connects(), 0);
});

test('cancelling during connection tears down the pending call', async () => {
  const fixture = clientFixture(allowedResult());
  let resolve;
  fixture.state.voice.device.connect = () => new Promise(done => { resolve = done; });
  const pending = submit(fixture);
  while (!resolve) await new Promise(done => setImmediate(done));
  fixture.node('#call-preflight-dialog').close();
  resolve({ disconnect() { fixture.state.cancelledConnection = true; } });
  await pending;
  assert.equal(fixture.state.cancelledConnection, true);
  assert.equal(fixture.state.voice.call, null);
});

test('live mode hides AI evidence; AI and recording reveal only their own controls', () => {
  const fixture = clientFixture();
  fixture.togglePreflightConsentFields();
  assert.equal(fixture.node('#preflight-ai-fields').hidden, true);
  assert.equal(fixture.node('#recording-consent-row').hidden, true);
  fixture.node('#preflight-call-mode').value = 'ai_or_prerecorded';
  fixture.togglePreflightConsentFields();
  assert.equal(fixture.node('#preflight-ai-fields').hidden, false);
  assert.equal(fixture.node('#recording-consent-row').hidden, true);
  fixture.node('#preflight-call-mode').value = 'live_agent';
  fixture.node('#preflight-recording-mode').value = 'on';
  fixture.togglePreflightConsentFields();
  assert.equal(fixture.node('#preflight-ai-fields').hidden, true);
  assert.equal(fixture.node('#recording-consent-row').hidden, false);
});

test('reopening loads saved facts but keeps recording off and permission unchecked', async () => {
  const fixture = clientFixture({ profile: { recipient_type: 'business', us_state: 'FL', timezone: 'America/New_York', screening_basis: 'business_line_verified', company_name: 'Acme', recording_consent: 1 } }, 200);
  await fixture.openCallPreflight();
  assert.equal(fixture.node('#preflight-company').value, 'Acme');
  assert.equal(fixture.node('#preflight-state').value, 'FL');
  assert.equal(fixture.node('#preflight-screening').value, 'business_line_verified');
  assert.equal(fixture.node('#preflight-recording-mode').value, 'off');
  assert.equal(fixture.node('#preflight-recording-consent').checked, false);
  assert.equal(fixture.connects(), 0);
});
