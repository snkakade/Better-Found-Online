import type { D1Database } from "@cloudflare/workers-types";

type ConsoleEnv = {
  DB?: D1Database;
  CONSOLE_BOOTSTRAP_TOKEN?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_API_KEY?: string;
  TWILIO_API_SECRET?: string;
  TWILIO_CALLER_ID?: string;
  TWILIO_TWIML_APP_SID?: string;
  TWILIO_MESSAGING_SERVICE_SID?: string;
  TWILIO_SMS_ENABLED?: string;
  TWILIO_A2P_BRAND_STATUS?: string;
  TWILIO_A2P_CAMPAIGN_STATUS?: string;
};

type ConsoleUserRow = {
  id: number;
  username: string;
  display_name: string;
  email: string | null;
  role: "admin" | "manager" | "agent";
  password_salt: string;
  password_hash: string;
  password_iterations: number;
  active: number;
};

type AuthenticatedUser = Pick<ConsoleUserRow, "id" | "username" | "role"> & {
  name: string;
  email: string | null;
  permissions: string[];
};

const encoder = new TextEncoder();
const E164 = /^\+[1-9]\d{7,14}$/;
const PASSWORD_HASH_ITERATIONS = 100000;
const roles = ["agent", "manager", "admin"] as const;
const permissionsByRole = {
  agent: ["send_messages", "place_calls", "view_contacts"],
  manager: ["send_messages", "place_calls", "view_contacts", "view_team_performance"],
  admin: ["send_messages", "place_calls", "view_contacts", "view_team_performance", "manage_users", "manage_compliance", "manage_billing"],
} as const;

function json(value: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extraHeaders },
  });
}

function cleanPhone(value: unknown) {
  return String(value ?? "").replace(/[\s().-]/g, "");
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64Url(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function sha256(value: string) {
  return base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

async function hashPassword(password: string, salt: string, iterations: number) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations },
    key,
    256,
  );
  return base64Url(new Uint8Array(bits));
}

function constantTimeEqual(left: string, right: string) {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return difference === 0;
}

function publicUser(user: ConsoleUserRow): AuthenticatedUser {
  return {
    id: user.id,
    username: user.username,
    name: user.display_name,
    email: user.email,
    role: user.role,
    permissions: [...permissionsByRole[user.role]],
  };
}

function roleAtLeast(user: AuthenticatedUser, role: "manager" | "admin") {
  return roles.indexOf(user.role) >= roles.indexOf(role);
}

function requireDb(env: ConsoleEnv) {
  if (!env.DB) throw new Error("Console database binding is missing");
  return env.DB;
}

function requestIp(request: Request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function authenticate(request: Request, env: ConsoleEnv): Promise<AuthenticatedUser | null> {
  if (!env.DB) return null;
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(
    `SELECT u.id, u.username, u.display_name, u.email, u.role, u.password_salt,
            u.password_hash, u.password_iterations, u.active
       FROM console_sessions s
       JOIN console_users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.active = 1`,
  ).bind(tokenHash).first<ConsoleUserRow>();
  if (!row) return null;
  await env.DB.prepare("UPDATE console_sessions SET last_seen_at = datetime('now') WHERE token_hash = ?").bind(tokenHash).run();
  return publicUser(row);
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

async function readJson(request: Request) {
  try { return await request.json() as Record<string, unknown>; } catch { return null; }
}

function twilioConfigured(env: ConsoleEnv) {
  return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_CALLER_ID);
}

function twilioAuth(env: ConsoleEnv) {
  return `Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`;
}

async function twilioRequest(env: ConsoleEnv, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("authorization", twilioAuth(env));
  return fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}${path}`, { ...init, headers });
}

function normalizeMessage(row: Record<string, unknown>, ownNumber: string) {
  const from = String(row.from || "");
  const to = String(row.to || "");
  const outbound = from === ownNumber || String(row.direction || "") === "outbound";
  return {
    sid: row.twilio_sid || row.sid,
    direction: outbound ? "outbound" : "inbound",
    from,
    to,
    counterpart: row.counterpart || (outbound ? to : from),
    body: row.body_preview || row.body || "",
    status: row.status || "unknown",
    errorCode: row.error_code || null,
    price: row.price == null ? null : Number(row.price),
    priceUnit: row.price_unit || "USD",
    sentAt: row.created_at || row.date_sent || row.date_created,
    createdAt: row.created_at || row.date_created,
    userId: row.user_id || null,
    sentBy: row.display_name || null,
    scheduledAt: row.scheduled_at || null,
  };
}

async function validTwilioSignature(request: Request, authToken: string, entries: [string, string][]) {
  const provided = request.headers.get("X-Twilio-Signature") || "";
  if (!provided || !authToken) return false;
  const sorted = [...entries].sort(([ak, av], [bk, bv]) => ak === bk ? av.localeCompare(bv) : ak.localeCompare(bk));
  const payload = request.url + sorted.map(([key, value]) => `${key}${value}`).join("");
  const key = await crypto.subtle.importKey("raw", encoder.encode(authToken), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
  return constantTimeEqual(bytesToBase64(digest), provided);
}

async function verifiedForm(request: Request, env: ConsoleEnv) {
  const form = await request.clone().formData();
  const entries = [...form.entries()].map(([key, value]) => [key, String(value)] as [string, string]);
  return await validTwilioSignature(request, env.TWILIO_AUTH_TOKEN || "", entries) ? form : null;
}

function xml(body: string, status = 200) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${body}`, {
    status,
    headers: { "content-type": "text/xml; charset=utf-8", "cache-control": "no-store" },
  });
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character] || character);
}

async function handleSession(request: Request, env: ConsoleEnv) {
  const db = requireDb(env);
  if (request.method === "GET") {
    const user = await authenticate(request, env);
    return user ? json({ user }) : json({ error: "Your session has expired" }, 401);
  }
  if (request.method === "DELETE") {
    const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (token) await db.prepare("DELETE FROM console_sessions WHERE token_hash = ?").bind(await sha256(token)).run();
    return json({ ok: true });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "Cross-site request rejected" }, 403);
  const body = await readJson(request);
  const username = String(body?.username || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const ipHash = await sha256(requestIp(request));
  if (!username || !password) return json({ error: "Enter your username and password" }, 400);
  const attempts = await db.prepare(
    "SELECT COUNT(*) AS count FROM console_login_attempts WHERE username = ? AND ip_hash = ? AND succeeded = 0 AND attempted_at > datetime('now', '-15 minutes')",
  ).bind(username, ipHash).first<{ count: number }>();
  if (Number(attempts?.count || 0) >= 8) return json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
  const user = await db.prepare("SELECT * FROM console_users WHERE username = ? AND active = 1").bind(username).first<ConsoleUserRow>();
  const valid = user && constantTimeEqual(await hashPassword(password, user.password_salt, user.password_iterations), user.password_hash);
  await db.prepare("INSERT INTO console_login_attempts (username, ip_hash, succeeded) VALUES (?, ?, ?)").bind(username, ipHash, valid ? 1 : 0).run();
  if (!user || !valid) return json({ error: "Incorrect username or password" }, 401);
  const token = randomToken();
  await db.batch([
    db.prepare("DELETE FROM console_sessions WHERE expires_at <= datetime('now')"),
    db.prepare("INSERT INTO console_sessions (user_id, token_hash, expires_at, ip_hash, user_agent) VALUES (?, ?, datetime('now', '+12 hours'), ?, ?)")
      .bind(user.id, await sha256(token), ipHash, request.headers.get("user-agent")?.slice(0, 500) || ""),
    db.prepare("UPDATE console_users SET last_login_at = datetime('now') WHERE id = ?").bind(user.id),
  ]);
  return json({ token, user: publicUser(user) });
}

async function handleBootstrap(request: Request, env: ConsoleEnv) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "Cross-site request rejected" }, 403);
  if (!env.CONSOLE_BOOTSTRAP_TOKEN) return json({ error: "Bootstrap is disabled" }, 404);
  if (request.headers.get("authorization") !== `Bearer ${env.CONSOLE_BOOTSTRAP_TOKEN}`) return json({ error: "Invalid bootstrap token" }, 401);
  const db = requireDb(env);
  const existing = await db.prepare("SELECT COUNT(*) AS count FROM console_users").first<{ count: number }>();
  if (Number(existing?.count || 0) > 0) return json({ error: "An administrator already exists" }, 409);
  const body = await readJson(request);
  const username = String(body?.username || "").trim().toLowerCase();
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim() || null;
  const password = String(body?.password || "");
  if (!/^[a-z0-9._-]{3,40}$/.test(username) || name.length < 2 || password.length < 12) {
    return json({ error: "Use a valid username, display name, and a password of at least 12 characters" }, 400);
  }
  const salt = randomToken(18);
  const iterations = PASSWORD_HASH_ITERATIONS;
  await db.prepare("INSERT INTO console_users (username, display_name, email, role, password_salt, password_hash, password_iterations) VALUES (?, ?, ?, 'admin', ?, ?, ?)")
    .bind(username, name, email, salt, await hashPassword(password, salt, iterations), iterations).run();
  return json({ ok: true, username }, 201);
}

async function handleUsers(request: Request, env: ConsoleEnv, actor: AuthenticatedUser) {
  if (!roleAtLeast(actor, "admin")) return json({ error: "Administrator access required" }, 403);
  const db = requireDb(env);
  if (request.method === "GET") {
    const result = await db.prepare("SELECT id, username, display_name AS name, email, role, active, created_at, last_login_at FROM console_users ORDER BY display_name").all();
    return json({ users: result.results });
  }
  if (request.method === "POST") {
    const body = await readJson(request);
    const username = String(body?.username || "").trim().toLowerCase();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim() || null;
    const password = String(body?.password || "");
    const role = String(body?.role || "agent") as ConsoleUserRow["role"];
    if (!/^[a-z0-9._-]{3,40}$/.test(username) || name.length < 2 || password.length < 12 || !roles.includes(role)) {
      return json({ error: "Invalid user details" }, 400);
    }
    const salt = randomToken(18);
    const iterations = PASSWORD_HASH_ITERATIONS;
    try {
      const result = await db.prepare("INSERT INTO console_users (username, display_name, email, role, password_salt, password_hash, password_iterations) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(username, name, email, role, salt, await hashPassword(password, salt, iterations), iterations).run();
      return json({ id: result.meta.last_row_id, username, name, email, role }, 201);
    } catch { return json({ error: "That username already exists" }, 409); }
  }
  if (request.method === "PATCH") {
    const body = await readJson(request);
    const id = Number(body?.id);
    const role = String(body?.role || "") as ConsoleUserRow["role"];
    const active = body?.active === undefined ? null : body.active ? 1 : 0;
    if (!Number.isInteger(id) || (role && !roles.includes(role))) return json({ error: "Invalid user update" }, 400);
    if (id === actor.id && active === 0) return json({ error: "You cannot deactivate your own account" }, 409);
    if (role) await db.prepare("UPDATE console_users SET role = ?, updated_at = datetime('now') WHERE id = ?").bind(role, id).run();
    if (active !== null) await db.prepare("UPDATE console_users SET active = ?, updated_at = datetime('now') WHERE id = ?").bind(active, id).run();
    if (typeof body?.password === "string" && body.password.length >= 12) {
      const salt = randomToken(18);
      const iterations = PASSWORD_HASH_ITERATIONS;
      await db.prepare("UPDATE console_users SET password_salt = ?, password_hash = ?, password_iterations = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(salt, await hashPassword(body.password, salt, iterations), iterations, id).run();
      await db.prepare("DELETE FROM console_sessions WHERE user_id = ?").bind(id).run();
    }
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, 405);
}

async function handleStatus(env: ConsoleEnv) {
  const checkedAt = new Date().toISOString();
  const configured = twilioConfigured(env);
  const campaignStatus = String(env.TWILIO_A2P_CAMPAIGN_STATUS || "not_started").toLowerCase();
  const enabled = env.TWILIO_SMS_ENABLED === "true" || ["verified", "complete", "approved"].includes(campaignStatus);
  let accountStatus = configured ? "configured" : "configuration_required";
  let balance: number | null = null;
  let currency = "USD";
  let numberDetails: Record<string, unknown> | null = null;
  let twilioActivity: Record<string, unknown> = { recentCalls: 0, recentMessages: 0, usageRecords: [] };
  if (configured) {
    try {
      const phoneQuery = encodeURIComponent(env.TWILIO_CALLER_ID || "");
      const [accountResponse, balanceResponse, numberResponse, callsResponse, messagesResponse, usageResponse] = await Promise.all([
        twilioRequest(env, ".json"),
        fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Balance.json`, { headers: { authorization: twilioAuth(env) } }),
        twilioRequest(env, `/IncomingPhoneNumbers.json?PhoneNumber=${phoneQuery}&PageSize=1`),
        twilioRequest(env, "/Calls.json?PageSize=20"),
        twilioRequest(env, "/Messages.json?PageSize=20"),
        twilioRequest(env, "/Usage/Records/Today.json?PageSize=50"),
      ]);
      accountStatus = accountResponse.ok ? String((await accountResponse.json() as { status?: string }).status || "active") : "unavailable";
      if (balanceResponse.ok) {
        const value = await balanceResponse.json() as { balance?: string; currency?: string };
        balance = Number(value.balance);
        currency = value.currency || "USD";
      }
      if (numberResponse.ok) {
        const value = await numberResponse.json() as { incoming_phone_numbers?: Record<string, unknown>[] };
        const number = value.incoming_phone_numbers?.[0];
        if (number) numberDetails = { sid: number.sid, friendlyName: number.friendly_name, capabilities: number.capabilities, voiceUrl: number.voice_url, smsUrl: number.sms_url, statusCallback: number.status_callback };
      }
      const calls = callsResponse.ok ? await callsResponse.json() as { calls?: Record<string, unknown>[] } : {};
      const messages = messagesResponse.ok ? await messagesResponse.json() as { messages?: Record<string, unknown>[] } : {};
      const usage = usageResponse.ok ? await usageResponse.json() as { usage_records?: Record<string, unknown>[] } : {};
      twilioActivity = {
        recentCalls: calls.calls?.length || 0,
        recentMessages: messages.messages?.length || 0,
        missedCalls: calls.calls?.filter((call) => ["no-answer", "busy", "failed"].includes(String(call.status))).length || 0,
        failedMessages: messages.messages?.filter((message) => ["failed", "undelivered"].includes(String(message.status))).length || 0,
        usageRecords: (usage.usage_records || []).filter((record) => ["calls", "sms", "mms", "recordings"].some((value) => String(record.category || "").includes(value))).slice(0, 12),
      };
    } catch { accountStatus = "unavailable"; }
  }
  return json({
    checkedAt,
    account: { configured, status: accountStatus },
    number: { phoneNumber: env.TWILIO_CALLER_ID || null, capabilities: numberDetails?.capabilities || { sms: true, mms: true, voice: true }, details: numberDetails },
    messaging: {
      enabled: configured && enabled,
      state: !configured ? "configuration_required" : enabled ? "ready" : "setup_required",
      brandStatus: env.TWILIO_A2P_BRAND_STATUS || "not_started",
      campaignStatus,
      serviceConfigured: Boolean(env.TWILIO_MESSAGING_SERVICE_SID || env.TWILIO_CALLER_ID),
      inboundWebhookConfigured: configured,
    },
    voice: { enabled: Boolean(configured && env.TWILIO_API_KEY && env.TWILIO_API_SECRET && env.TWILIO_TWIML_APP_SID) },
    usage: { balance: Number.isFinite(balance) ? balance : null, currency },
    streams: twilioActivity,
  });
}

async function handleMessages(request: Request, env: ConsoleEnv, user: AuthenticatedUser) {
  const db = requireDb(env);
  if (request.method === "GET") {
    const pageSize = Math.min(Math.max(Number(new URL(request.url).searchParams.get("pageSize")) || 50, 1), 100);
    const result = await db.prepare(
      `SELECT e.*, u.display_name FROM outreach_events e LEFT JOIN console_users u ON u.id = e.user_id
        WHERE e.channel = 'sms' ORDER BY e.created_at DESC LIMIT ?`,
    ).bind(pageSize).all<Record<string, unknown>>();
    return json({ messages: result.results.map((row) => normalizeMessage(row, env.TWILIO_CALLER_ID || "")), pageSize });
  }
  if (request.method === "POST") {
    if (!sameOrigin(request)) return json({ error: "Cross-site request rejected" }, 403);
    if (!twilioConfigured(env)) return json({ error: "Twilio SMS is not configured", code: "SMS_NOT_CONFIGURED" }, 503);
    const campaignStatus = String(env.TWILIO_A2P_CAMPAIGN_STATUS || "").toLowerCase();
    const enabled = env.TWILIO_SMS_ENABLED === "true" || ["verified", "complete", "approved"].includes(campaignStatus);
    if (!enabled) return json({ error: "Messaging is disabled until A2P registration is approved.", code: "SMS_SETUP_REQUIRED" }, 409);
    const body = await readJson(request);
    const to = cleanPhone(body?.to);
    const messageBody = String(body?.body || "").trim();
    if (!E164.test(to)) return json({ error: "Enter a valid international recipient number" }, 400);
    if (!messageBody || messageBody.length > 1600) return json({ error: "Message must contain 1 to 1,600 characters" }, 400);
    const suppressed = await db.prepare("SELECT phone FROM console_suppressions WHERE phone = ?").bind(to).first();
    if (suppressed) return json({ error: "This number has opted out and cannot be messaged", code: "SUPPRESSED" }, 409);
    const twilioBody = new URLSearchParams({ To: to, Body: messageBody });
    if (env.TWILIO_MESSAGING_SERVICE_SID) twilioBody.set("MessagingServiceSid", env.TWILIO_MESSAGING_SERVICE_SID);
    else twilioBody.set("From", env.TWILIO_CALLER_ID || "");
    twilioBody.set("StatusCallback", `${new URL(request.url).origin}/api/console/sms-status-webhook`);
    if (body?.scheduledAt) {
      if (!env.TWILIO_MESSAGING_SERVICE_SID) return json({ error: "A Messaging Service SID is required for scheduled messages" }, 409);
      const scheduledAt = new Date(String(body.scheduledAt));
      if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() + 15 * 60_000 || scheduledAt.getTime() > Date.now() + 35 * 86_400_000) {
        return json({ error: "Schedule messages between 15 minutes and 35 days from now" }, 400);
      }
      twilioBody.set("ScheduleType", "fixed");
      twilioBody.set("SendAt", scheduledAt.toISOString());
    }
    const response = await twilioRequest(env, "/Messages.json", {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: twilioBody,
    });
    const data = await response.json() as Record<string, unknown>;
    if (!response.ok) return json({ error: data.message || "Twilio rejected the message", code: data.code }, response.status);
    await db.prepare(
      "INSERT INTO outreach_events (id, user_id, channel, direction, counterpart, twilio_sid, status, body_preview, scheduled_at, created_at) VALUES (?, ?, 'sms', 'outbound', ?, ?, ?, ?, ?, datetime('now'))",
    ).bind(crypto.randomUUID(), user.id, to, data.sid, data.status || "queued", messageBody, body?.scheduledAt ? String(body.scheduledAt) : null).run();
    return json({ message: { ...normalizeMessage(data, env.TWILIO_CALLER_ID || ""), userId: user.id, sentBy: user.name } }, 201);
  }
  if (request.method === "PATCH") {
    if (!sameOrigin(request)) return json({ error: "Cross-site request rejected" }, 403);
    const body = await readJson(request);
    const sid = String(body?.sid || "");
    if (!/^SM[0-9a-f]{32}$/i.test(sid) || body?.status !== "canceled") return json({ error: "Invalid cancellation request" }, 400);
    const response = await twilioRequest(env, `/Messages/${sid}.json`, {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ Status: "canceled" }),
    });
    const data = await response.json() as Record<string, unknown>;
    if (!response.ok) return json({ error: data.message || "Could not cancel the message", code: data.code }, response.status);
    await db.prepare("UPDATE outreach_events SET status = 'canceled', updated_at = datetime('now') WHERE twilio_sid = ?").bind(sid).run();
    return json({ message: normalizeMessage(data, env.TWILIO_CALLER_ID || "") });
  }
  return json({ error: "Method not allowed" }, 405);
}

async function generateVoiceToken(env: ConsoleEnv, identity: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ cty: "twilio-fpa;v=1", typ: "JWT", alg: "HS256" }));
  const payload = base64Url(JSON.stringify({
    jti: `${env.TWILIO_API_KEY}-${crypto.randomUUID()}`, iss: env.TWILIO_API_KEY, sub: env.TWILIO_ACCOUNT_SID,
    iat: now, exp: now + 3600,
    grants: { identity, voice: { outgoing: { application_sid: env.TWILIO_TWIML_APP_SID } } },
  }));
  const unsigned = `${header}.${payload}`;
  const key = await crypto.subtle.importKey("raw", encoder.encode(env.TWILIO_API_SECRET || ""), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(unsigned)));
  return `${unsigned}.${base64Url(signature)}`;
}

async function handleVoiceToken(env: ConsoleEnv, user: AuthenticatedUser) {
  const required = ["TWILIO_ACCOUNT_SID", "TWILIO_API_KEY", "TWILIO_API_SECRET", "TWILIO_TWIML_APP_SID"] as const;
  const missing = required.filter((key) => !env[key]);
  if (missing.length) return json({ error: "Voice service is not configured", missing }, 503);
  return json({ token: await generateVoiceToken(env, `bfo_user_${user.id}`), identity: `bfo_user_${user.id}` });
}

async function handlePresence(request: Request, env: ConsoleEnv, user: AuthenticatedUser) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = await readJson(request);
  const available = body?.available === false ? 0 : 1;
  await requireDb(env).prepare(
    `INSERT INTO console_presence (user_id, voice_identity, available, last_seen_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET available=excluded.available, last_seen_at=datetime('now')`,
  ).bind(user.id, `bfo_user_${user.id}`, available).run();
  return json({ ok: true, available: Boolean(available) });
}

async function handleIncomingVoiceWebhook(request: Request, env: ConsoleEnv) {
  const form = await verifiedForm(request, env);
  if (!form) return new Response("Invalid Twilio signature", { status: 403 });
  const from = cleanPhone(form.get("From"));
  const sid = String(form.get("CallSid") || "") || null;
  const db = requireDb(env);
  const prior = await db.prepare("SELECT owner_user_id, id FROM console_leads WHERE phone = ? LIMIT 1").bind(from).first<{ owner_user_id: number | null; id: string }>();
  await db.prepare(
    "INSERT OR IGNORE INTO outreach_events (id, user_id, lead_id, channel, direction, counterpart, twilio_sid, status) VALUES (?, ?, ?, 'call', 'inbound', ?, ?, 'ringing')",
  ).bind(crypto.randomUUID(), prior?.owner_user_id || null, prior?.id || null, from, sid).run();
  const agents = await db.prepare(
    `SELECT p.voice_identity FROM console_presence p JOIN console_users u ON u.id=p.user_id
     WHERE p.available=1 AND u.active=1 AND p.last_seen_at >= datetime('now','-90 seconds') ORDER BY p.last_seen_at DESC LIMIT 10`,
  ).all<{ voice_identity: string }>();
  if (!agents.results.length) return xml("<Response><Say>Thank you for calling Better Found Online. No team member is available right now. Please leave a message after the tone.</Say><Record maxLength=120 playBeep=true /><Hangup /></Response>");
  const clients = agents.results.map((agent) => `<Client>${escapeXml(agent.voice_identity)}</Client>`).join("");
  const callback = `${new URL(request.url).origin}/api/console/call-status-webhook`;
  return xml(`<Response><Dial timeout="25" answerOnBridge="true" action="${escapeXml(callback)}" method="POST">${clients}</Dial></Response>`);
}

async function handleContacts(request: Request, env: ConsoleEnv, user: AuthenticatedUser) {
  const db = requireDb(env);
  if (request.method === "GET") {
    const result = await db.prepare(`SELECT c.*, MAX(e.created_at) AS last_activity FROM console_contacts c LEFT JOIN outreach_events e ON e.counterpart=c.phone GROUP BY c.id ORDER BY c.updated_at DESC`).all();
    return json({ contacts: result.results });
  }
  if (request.method === "POST") {
    const body = await readJson(request);
    const phone = cleanPhone(body?.phone);
    if (!E164.test(phone) || !String(body?.firstName || "").trim()) return json({ error: "A name and valid international phone number are required" }, 400);
    const id = crypto.randomUUID();
    try {
      await db.prepare(`INSERT INTO console_contacts (id,first_name,last_name,company,phone,consent_status,consent_source,tags_json,created_by) VALUES (?,?,?,?,?,?,?,?,?)`)
        .bind(id, String(body?.firstName).trim(), String(body?.lastName || "").trim(), String(body?.company || "").trim(), phone, String(body?.consent || "pending"), "console", JSON.stringify(body?.tags || ["Contact"]), user.id).run();
      return json({ id }, 201);
    } catch { return json({ error: "That phone number already exists" }, 409); }
  }
  return json({ error: "Method not allowed" }, 405);
}

async function handleLeads(request: Request, env: ConsoleEnv, user: AuthenticatedUser) {
  const db = requireDb(env);
  const url = new URL(request.url);
  const id = url.pathname.match(/^\/api\/console\/leads\/([^/]+)$/)?.[1];
  if (request.method === "GET") {
    const result = await db.prepare(`SELECT l.*, u.display_name AS owner_name,
      (SELECT MAX(created_at) FROM outreach_events e WHERE e.lead_id=l.id OR e.counterpart=l.phone) AS last_activity
      FROM console_leads l LEFT JOIN console_users u ON u.id=l.owner_user_id ORDER BY l.updated_at DESC`).all();
    return json({ leads: result.results });
  }
  if (request.method === "POST") {
    const body = await readJson(request); const phone = cleanPhone(body?.phone);
    if (!E164.test(phone) || !String(body?.firstName || "").trim()) return json({ error: "A lead name and valid international phone number are required" }, 400);
    const leadId = crypto.randomUUID();
    try {
      await db.prepare(`INSERT INTO console_leads (id,first_name,last_name,company,phone,email,source,stage,priority,owner_user_id,next_follow_up_at,notes,tags_json,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(leadId, String(body?.firstName).trim(), String(body?.lastName || "").trim(), String(body?.company || "").trim(), phone, String(body?.email || "").trim(), String(body?.source || "manual"), String(body?.stage || "new"), String(body?.priority || "normal"), Number(body?.ownerUserId || user.id), body?.nextFollowUpAt || null, String(body?.notes || "").trim(), JSON.stringify(body?.tags || []), user.id).run();
      return json({ id: leadId }, 201);
    } catch { return json({ error: "That lead phone number already exists" }, 409); }
  }
  if (request.method === "PATCH" && id) {
    const body = await readJson(request);
    const allowedStages = ["new","contacted","qualified","proposal","won","lost"];
    const stage = allowedStages.includes(String(body?.stage)) ? String(body?.stage) : null;
    await db.prepare(`UPDATE console_leads SET stage=COALESCE(?,stage), priority=COALESCE(?,priority), owner_user_id=COALESCE(?,owner_user_id), next_follow_up_at=COALESCE(?,next_follow_up_at), notes=COALESCE(?,notes), updated_at=datetime('now') WHERE id=?`)
      .bind(stage, body?.priority || null, body?.ownerUserId || null, body?.nextFollowUpAt || null, body?.notes ?? null, id).run();
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, 405);
}

async function handleCalls(request: Request, env: ConsoleEnv) {
  const db = requireDb(env); const url = new URL(request.url);
  const id = url.pathname.match(/^\/api\/console\/calls\/([^/]+)$/)?.[1];
  if (request.method === "GET") {
    const result = await db.prepare(`SELECT e.*, u.display_name, l.first_name, l.last_name, l.company FROM outreach_events e LEFT JOIN console_users u ON u.id=e.user_id LEFT JOIN console_leads l ON l.id=e.lead_id WHERE e.channel='call' ORDER BY e.created_at DESC LIMIT 200`).all();
    return json({ calls: result.results });
  }
  if (request.method === "PATCH" && id) {
    const body = await readJson(request);
    await db.prepare(`UPDATE outreach_events SET disposition=?, notes=?, tags_json=?, lead_id=COALESCE(?,lead_id), updated_at=datetime('now') WHERE id=? AND channel='call'`)
      .bind(String(body?.disposition || ""), String(body?.notes || ""), JSON.stringify(body?.tags || []), body?.leadId || null, id).run();
    if (body?.nextFollowUpAt && body?.leadId) await db.prepare(`INSERT INTO console_tasks (id,lead_id,assigned_to,created_by,title,due_at) VALUES (?,?,?,?,?,?)`).bind(crypto.randomUUID(), body.leadId, body?.assignedTo || null, body?.assignedTo || null, "Follow up after call", body.nextFollowUpAt).run();
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, 405);
}

async function handleTasks(request: Request, env: ConsoleEnv, user: AuthenticatedUser) {
  const db = requireDb(env);
  if (request.method === "GET") {
    const result = await db.prepare(`SELECT t.*, l.first_name, l.last_name, l.phone, u.display_name AS assigned_name FROM console_tasks t LEFT JOIN console_leads l ON l.id=t.lead_id LEFT JOIN console_users u ON u.id=t.assigned_to ORDER BY CASE WHEN t.status='open' THEN 0 ELSE 1 END, t.due_at`).all();
    return json({ tasks: result.results });
  }
  if (request.method === "POST") {
    const body = await readJson(request); const id = crypto.randomUUID();
    await db.prepare(`INSERT INTO console_tasks (id,lead_id,assigned_to,created_by,title,due_at) VALUES (?,?,?,?,?,?)`).bind(id, body?.leadId || null, body?.assignedTo || user.id, user.id, String(body?.title || "Follow up").trim(), body?.dueAt || null).run();
    return json({ id }, 201);
  }
  if (request.method === "PATCH") {
    const body = await readJson(request);
    await db.prepare(`UPDATE console_tasks SET status=?, updated_at=datetime('now') WHERE id=?`).bind(body?.status === "done" ? "done" : "open", body?.id).run();
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, 405);
}

async function handleVoiceWebhook(request: Request, env: ConsoleEnv) {
  const form = await verifiedForm(request, env);
  if (!form) return new Response("Invalid Twilio signature", { status: 403 });
  const target = cleanPhone(form.get("TargetNumber"));
  const from = String(form.get("From") || "");
  const userId = Number(from.match(/^client:bfo_user_(\d+)$/)?.[1] || 0) || null;
  const callSid = String(form.get("CallSid") || "") || null;
  if (!E164.test(target)) return xml("<Response><Say>Invalid destination number.</Say></Response>", 400);
  await requireDb(env).prepare(
    "INSERT OR IGNORE INTO outreach_events (id, user_id, channel, direction, counterpart, twilio_sid, status) VALUES (?, ?, 'call', 'outbound', ?, ?, 'initiated')",
  ).bind(crypto.randomUUID(), userId, target, callSid).run();
  const callback = `${new URL(request.url).origin}/api/console/call-status-webhook`;
  return xml(`<Response><Dial callerId="${escapeXml(env.TWILIO_CALLER_ID || "")}" answerOnBridge="true"><Number statusCallback="${escapeXml(callback)}" statusCallbackEvent="initiated ringing answered completed" statusCallbackMethod="POST">${escapeXml(target)}</Number></Dial></Response>`);
}

async function handleSmsWebhook(request: Request, env: ConsoleEnv) {
  const form = await verifiedForm(request, env);
  if (!form) return new Response("Invalid Twilio signature", { status: 403 });
  const from = cleanPhone(form.get("From"));
  const body = String(form.get("Body") || "");
  const sid = String(form.get("MessageSid") || "") || null;
  const db = requireDb(env);
  const prior = await db.prepare(
    "SELECT user_id FROM outreach_events WHERE counterpart = ? AND direction = 'outbound' AND user_id IS NOT NULL ORDER BY created_at DESC LIMIT 1",
  ).bind(from).first<{ user_id: number }>();
  await db.prepare(
    "INSERT OR IGNORE INTO outreach_events (id, user_id, channel, direction, counterpart, twilio_sid, status, body_preview) VALUES (?, ?, 'sms', 'inbound', ?, ?, 'received', ?)",
  ).bind(crypto.randomUUID(), prior?.user_id || null, from, sid, body.slice(0, 1600)).run();
  if (/^(stop|unsubscribe|cancel|end|quit)$/i.test(body.trim())) {
    await db.prepare("INSERT OR REPLACE INTO console_suppressions (phone, reason, source, created_at) VALUES (?, ?, 'twilio_webhook', datetime('now'))")
      .bind(from, `Keyword: ${body.trim().toUpperCase()}`).run();
  }
  return xml("<Response></Response>");
}

async function handleStatusWebhook(request: Request, env: ConsoleEnv, channel: "sms" | "call") {
  const form = await verifiedForm(request, env);
  if (!form) return new Response("Invalid Twilio signature", { status: 403 });
  const sid = String(channel === "sms" ? form.get("MessageSid") : (form.get("ParentCallSid") || form.get("CallSid")) || "");
  const status = String(form.get(channel === "sms" ? "MessageStatus" : "CallStatus") || "unknown");
  const duration = Number(form.get("CallDuration") || 0) || null;
  const errorCode = String(form.get("ErrorCode") || "") || null;
  await requireDb(env).prepare(
    "UPDATE outreach_events SET status = ?, duration_seconds = COALESCE(?, duration_seconds), error_code = COALESCE(?, error_code), updated_at = datetime('now') WHERE twilio_sid = ?",
  ).bind(status, duration, errorCode, sid).run();
  return new Response(null, { status: 204 });
}

async function handlePerformance(request: Request, env: ConsoleEnv, actor: AuthenticatedUser) {
  if (!roleAtLeast(actor, "manager")) return json({ error: "Manager access required" }, 403);
  const days = Math.min(Math.max(Number(new URL(request.url).searchParams.get("days")) || 30, 1), 365);
  const result = await requireDb(env).prepare(
    `SELECT u.id, u.display_name AS name, u.username, u.role,
       SUM(CASE WHEN e.channel='sms' AND e.direction='outbound' THEN 1 ELSE 0 END) AS messages,
       SUM(CASE WHEN e.channel='sms' AND e.direction='outbound' AND e.status IN ('delivered','sent') THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN e.channel='sms' AND e.direction='inbound' THEN 1 ELSE 0 END) AS replies,
       SUM(CASE WHEN e.channel='call' AND e.direction='outbound' THEN 1 ELSE 0 END) AS calls,
       SUM(CASE WHEN e.channel='call' AND e.direction='outbound' AND e.status IN ('answered','completed') THEN 1 ELSE 0 END) AS connected,
       COALESCE(SUM(CASE WHEN e.channel='call' THEN e.duration_seconds ELSE 0 END), 0) AS talk_seconds
     FROM console_users u
     LEFT JOIN outreach_events e ON e.user_id = u.id AND e.created_at >= datetime('now', ?)
     WHERE u.active = 1 GROUP BY u.id ORDER BY messages + calls DESC, u.display_name`,
  ).bind(`-${days} days`).all<Record<string, unknown>>();
  type PerformanceUser = Record<string, unknown> & { messages: number; delivered: number; replies: number; calls: number; connected: number; talkTime: string };
  const users: PerformanceUser[] = result.results.map((row: Record<string, unknown>) => {
    const seconds = Number(row.talk_seconds || 0);
    return { ...row, messages: Number(row.messages || 0), delivered: Number(row.delivered || 0), replies: Number(row.replies || 0), calls: Number(row.calls || 0), connected: Number(row.connected || 0), talkTime: `${Math.floor(seconds / 60)}m ${seconds % 60}s` };
  });
  return json({ days, users, totals: {
    messages: users.reduce((sum: number, user: PerformanceUser) => sum + user.messages, 0),
    calls: users.reduce((sum: number, user: PerformanceUser) => sum + user.calls, 0),
    replies: users.reduce((sum: number, user: PerformanceUser) => sum + user.replies, 0),
    activeUsers: users.filter((user: PerformanceUser) => user.messages + user.calls > 0).length,
  } });
}

export async function handleConsoleApi(request: Request, env: ConsoleEnv) {
  try {
    const pathname = new URL(request.url).pathname.replace(/\/$/, "");
    if (pathname === "/api/console/session") return await handleSession(request, env);
    if (pathname === "/api/console/bootstrap") return await handleBootstrap(request, env);
    if (pathname === "/api/console/sms-webhook") return await handleSmsWebhook(request, env);
    if (pathname === "/api/console/sms-status-webhook") return await handleStatusWebhook(request, env, "sms");
    if (pathname === "/api/console/call-status-webhook") return await handleStatusWebhook(request, env, "call");
    if (pathname === "/api/console/voice-webhook") return await handleVoiceWebhook(request, env);
    if (pathname === "/api/console/incoming-voice-webhook") return await handleIncomingVoiceWebhook(request, env);
    const user = await authenticate(request, env);
    if (!user) return json({ error: "Authentication required" }, 401);
    if (request.method !== "GET" && request.method !== "HEAD" && !sameOrigin(request)) return json({ error: "Cross-site request rejected" }, 403);
    if (pathname === "/api/console/status") return await handleStatus(env);
    if (pathname === "/api/console/messages") return await handleMessages(request, env, user);
    if (pathname === "/api/console/voice-token" && request.method === "POST") return await handleVoiceToken(env, user);
    if (pathname === "/api/console/presence") return await handlePresence(request, env, user);
    if (pathname === "/api/console/contacts") return await handleContacts(request, env, user);
    if (pathname === "/api/console/leads" || pathname.startsWith("/api/console/leads/")) return await handleLeads(request, env, user);
    if (pathname === "/api/console/calls" || pathname.startsWith("/api/console/calls/")) return await handleCalls(request, env);
    if (pathname === "/api/console/tasks") return await handleTasks(request, env, user);
    if (pathname === "/api/console/performance") return await handlePerformance(request, env, user);
    if (pathname === "/api/console/users") return await handleUsers(request, env, user);
    return json({ error: "Console endpoint not found" }, 404);
  } catch (error) {
    console.error("Console API error", error);
    const message = error instanceof Error && error.message.includes("database binding") ? error.message : "Console service is unavailable";
    return json({ error: message }, 503);
  }
}
