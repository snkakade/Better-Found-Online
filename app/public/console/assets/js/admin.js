(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const TOKEN_KEY = "bfo_console_token";
  const CONTACTS_KEY = "bfo_console_contacts_v2";
  const TEMPLATES_KEY = "bfo_console_templates_v2";
  const SCHEDULES_KEY = "bfo_console_schedules_v2";
  const AUDIO_INPUT_KEY = "bfo_console_audio_input";
  const AUDIO_OUTPUT_KEY = "bfo_console_audio_output";
  const LAST_DIALLED_KEY = "bfo_console_last_dialled";

  const seedContacts = [];
  const seedTemplates = [
    { id: "template-1", name: "Appointment reminder", category: "appointment", body: "Hi {{first_name}}, this is a reminder about your appointment on {{date}} at {{time}}. Reply C to confirm or call us to reschedule. Reply STOP to opt out.", updatedAt: "2026-10-06T09:00:00Z", usageCount: 0 },
    { id: "template-2", name: "Project follow-up", category: "follow_up", body: "Hi {{first_name}}, I wanted to follow up on our conversation. Is there a convenient time this week to continue? Reply STOP to opt out.", updatedAt: "2026-10-02T14:20:00Z", usageCount: 0 },
    { id: "template-3", name: "Service update", category: "service", body: "Hi {{first_name}}, your service request has been updated. Reply to this message if you need any help. Reply STOP to opt out.", updatedAt: "2026-09-29T11:05:00Z", usageCount: 0 }
  ];

  const load = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : fallback;
    } catch { return fallback; }
  };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const state = {
    token: sessionStorage.getItem(TOKEN_KEY) || "",
    user: null,
    team: [],
    performance: null,
    smsStatus: null,
    messages: [],
    contacts: load(CONTACTS_KEY, seedContacts),
    leads: [],
    calls: [],
    tasks: [],
    templates: load(TEMPLATES_KEY, seedTemplates),
    schedules: load(SCHEDULES_KEY, []),
    suppressions: [],
    compliance: null,
    selectedConversation: null,
    messageFilter: "all",
    conversationPage: 1,
    contactPage: 1,
    scheduleFilter: "upcoming",
    deferredInstall: null,
    voice: { device: null, call: null, incoming: null, timer: null, startedAt: null, presenceTimer: null, muted: false, micStream: null, micFrame: null, hiddenRecents: false, preflight: null, preflightPhone: "" }
  };

  function haptic(duration = 12) {
    if (navigator.vibrate) navigator.vibrate(duration);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function initials(firstName = "", lastName = "") {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?";
  }

  function formatPhone(value) {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return value || "Unknown number";
  }

  function relativeTime(value) {
    if (!value) return "No activity";
    const date = new Date(value);
    const seconds = Math.max(1, Math.round((Date.now() - date.getTime()) / 1000));
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
  }

  function fullDate(value) {
    if (!value) return "Not available";
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(value));
  }

  function toast(type, title, message = "") {
    const icon = type === "success" ? "check-circle" : type === "error" ? "x-circle" : type === "warning" ? "warning-circle" : "info";
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.innerHTML = `<i class="ph-bold ph-${icon}" aria-hidden="true"></i><div><strong>${escapeHtml(title)}</strong>${message ? `<p>${escapeHtml(message)}</p>` : ""}</div>`;
    $("#toast-region").append(node);
    window.setTimeout(() => node.remove(), 5200);
  }

  async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (state.token) headers.Authorization = `Bearer ${state.token}`;
    if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    const response = await fetch(path, { ...options, headers, cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 && path !== "/api/console/session") signOut(false);
    if (!response.ok) {
      const error = new Error(data.error || `Request failed (${response.status})`);
      error.code = data.code;
      error.status = response.status;
      error.details = data;
      throw error;
    }
    return data;
  }

  function showApp() {
    $("#login-gate").hidden = true;
    $("#admin-app").hidden = false;
    applyUserAccess();
    routeTo(location.hash.slice(1) || "overview", false);
    renderAll();
    refreshData();
    initVoice();
  }

  function showLogin() {
    $("#login-gate").hidden = false;
    $("#admin-app").hidden = true;
    window.setTimeout(() => $("#admin-username")?.focus(), 50);
  }

  async function verifySession() {
    if (!state.token) return showLogin();
    try {
      const result = await api("/api/console/session");
      state.user = result.user;
      showApp();
    } catch { showLogin(); }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const button = $("#login-btn");
    const error = $("#login-error");
    error.hidden = true;
    button.disabled = true;
    button.querySelector("span").textContent = "Signing in";
    try {
      const result = await api("/api/console/session", { method: "POST", body: JSON.stringify({ username: $("#admin-username").value, password: $("#admin-password").value }) });
      state.token = result.token;
      state.user = result.user;
      sessionStorage.setItem(TOKEN_KEY, result.token);
      $("#admin-username").value = "";
      $("#admin-password").value = "";
      showApp();
    } catch (exception) {
      error.textContent = exception.message || "Could not sign in. Check the password and try again.";
      error.hidden = false;
      $("#admin-password").focus();
    } finally {
      button.disabled = false;
      button.querySelector("span").textContent = "Sign in";
    }
  }

  function signOut(notify = true) {
    if (state.token) api("/api/console/session", { method: "DELETE" }).catch(() => {});
    state.token = "";
    state.user = null;
    sessionStorage.removeItem(TOKEN_KEY);
    if (state.voice.device) state.voice.device.destroy();
    showLogin();
    if (notify) toast("success", "Signed out");
  }

  const routes = new Set(["overview", "conversations", "leads", "contacts", "scheduled", "templates", "voice", "performance", "team", "compliance", "numbers", "usage", "settings"]);
  function routeTo(route, updateHash = true) {
    const target = routes.has(route) ? route : "overview";
    $$(".page").forEach((page) => page.classList.toggle("active", page.dataset.page === target));
    $$(".nav-item[data-route]").forEach((item) => item.classList.toggle("active", item.dataset.route === target));
    $$("[data-settings-route]").forEach((item) => item.classList.toggle("active", item.dataset.settingsRoute === target));
    const settingsRoutes = ["settings", "compliance", "numbers", "usage", "team", "templates"];
    const settingsNav = $(".nav-item[data-route='settings']");
    if (settingsNav) settingsNav.classList.toggle("active", settingsRoutes.includes(target));
    if (updateHash && location.hash !== `#${target}`) history.pushState(null, "", `#${target}`);
    document.title = `${target[0].toUpperCase()}${target.slice(1)} | Better Found Online Console`;
    closeSidebar();
    $("#main-content").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    if (target === "voice") initVoice();
    if (target === "voice") loadCalls();
    if (target === "leads") loadLeads();
    if (target === "scheduled") loadTasks();
    if (target === "performance") loadPerformance();
    if (target === "team") loadTeam();
    if (target === "compliance") loadCompliance();
  }

  function roleRank(role) {
    return { agent: 1, manager: 2, admin: 3 }[role] || 0;
  }

  function applyUserAccess() {
    const user = state.user || { name: "Team member", username: "", role: "agent", permissions: [] };
    const initialsValue = user.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "BF";
    $("#account-avatar").textContent = initialsValue;
    $("#account-name").textContent = user.name;
    $("#account-role").textContent = user.role;
    $("#settings-user-avatar").textContent = initialsValue;
    $("#settings-user-name").textContent = user.name;
    $("#settings-user-username").textContent = user.username ? `@${user.username}` : "";
    $("#settings-user-role").textContent = user.role;
    $("#current-permissions").innerHTML = (user.permissions || []).map((permission) => `<span><i class="ph-bold ph-check"></i>${escapeHtml(permission.replaceAll("_", " "))}</span>`).join("");
    $$('[data-min-role="manager"]').forEach((element) => { element.hidden = roleRank(user.role) < roleRank("manager"); });
    $$('[data-min-role="admin"]').forEach((element) => { element.hidden = roleRank(user.role) < roleRank("admin"); });
  }

  async function loadPerformance() {
    if (roleRank(state.user?.role) < roleRank("manager")) return;
    const days = Number($("#performance-window")?.value || 30);
    try {
      const result = await api(`/api/console/performance?days=${days}`);
      state.performance = result;
      const totals = result.totals || {};
      $("#performance-messages").textContent = totals.messages || 0;
      $("#performance-calls").textContent = totals.calls || 0;
      $("#performance-replies").textContent = totals.replies || 0;
      $("#performance-users").textContent = totals.activeUsers || 0;
      const rows = result.users || [];
      $("#performance-empty").hidden = rows.length > 0;
      $("#performance-table-body").innerHTML = rows.map((user) => `<tr><td><strong>${escapeHtml(user.name)}</strong><small>@${escapeHtml(user.username)}</small></td><td>${escapeHtml(user.role)}</td><td>${user.messages}</td><td>${user.delivered}</td><td>${user.replies}</td><td>${user.calls}</td><td>${user.connected}</td><td>${escapeHtml(user.talkTime)}</td></tr>`).join("");
    } catch (error) {
      toast("error", "Could not load team performance", error.message);
    }
  }

  async function loadTeam() {
    if (roleRank(state.user?.role) < roleRank("admin")) return;
    try {
      const result = await api("/api/console/users");
      state.team = result.users || [];
      $("#team-empty").hidden = state.team.length > 0;
      $("#team-table-body").innerHTML = state.team.map((user) => `<tr><td><strong>${escapeHtml(user.name)}</strong><small>@${escapeHtml(user.username)}${user.email ? ` · ${escapeHtml(user.email)}` : ""}</small></td><td><span class="badge">${escapeHtml(user.role)}</span></td><td><span class="badge ${user.active ? "badge-success" : "badge-danger"}">${user.active ? "Active" : "Inactive"}</span></td><td>${escapeHtml(user.last_login_at ? fullDate(user.last_login_at) : "Never")}</td><td>${escapeHtml(fullDate(user.created_at))}</td></tr>`).join("");
    } catch (error) {
      toast("error", "Could not load team access", error.message);
    }
  }

  async function handleCreateTeamUser(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = $("#create-team-user");
    button.disabled = true;
    try {
      await api("/api/console/users", { method: "POST", body: JSON.stringify({
        name: $("#team-user-name").value.trim(),
        username: $("#team-user-username").value.trim(),
        email: $("#team-user-email").value.trim(),
        role: $("#team-user-role").value,
        password: $("#team-user-password").value
      }) });
      form.reset();
      $("#team-user-dialog").close();
      toast("success", "User created", "Their calls and messages will now be attributed to their account.");
      await loadTeam();
    } catch (error) {
      toast("error", "Could not create user", error.message);
    } finally { button.disabled = false; }
  }

  function openSidebar() {
    $("#sidebar").classList.add("open");
    $("#sidebar-scrim").hidden = false;
  }
  function closeSidebar() {
    $("#sidebar").classList.remove("open");
    $("#sidebar-scrim").hidden = true;
  }

  async function refreshData() {
    const refresh = $("#refresh-data i");
    refresh?.classList.add("ph-spin");
    $("#main-content")?.setAttribute("aria-busy", "true");
    try {
      const [statusResult, messagesResult, contactsResult, leadsResult, callsResult, tasksResult, complianceResult, suppressionsResult] = await Promise.allSettled([
        api("/api/console/status"),
        api("/api/console/messages?pageSize=100"),
        api("/api/console/contacts"),
        api("/api/console/leads"),
        api("/api/console/calls"),
        api("/api/console/tasks"),
        api("/api/console/call-compliance"),
        api("/api/console/suppressions")
      ]);
      if (statusResult.status === "fulfilled") state.smsStatus = statusResult.value;
      else state.smsStatus = {
        checkedAt: new Date().toISOString(),
        account: { configured: false, status: "configuration_required" },
        number: { phoneNumber: "+15707077078", capabilities: { sms: true, mms: true, voice: true } },
        messaging: { enabled: false, state: "setup_required", brandStatus: "not_started", campaignStatus: "blocked", serviceConfigured: true, inboundWebhookConfigured: false },
        usage: { balance: null, currency: "USD" }
      };
      state.messages = messagesResult.status === "fulfilled" ? messagesResult.value.messages || [] : [];
      state.schedules = state.messages.filter((message) => message.scheduledAt).map((message) => ({ id: message.sid, sid: message.sid, to: message.counterpart, body: message.body, scheduledAt: message.scheduledAt, status: message.status === "canceled" ? "cancelled" : message.status, createdAt: message.createdAt, createdBy: message.sentBy }));
      if (contactsResult.status === "fulfilled") state.contacts = (contactsResult.value.contacts || []).map(normalizeContact);
      if (leadsResult.status === "fulfilled") state.leads = leadsResult.value.leads || [];
      if (callsResult.status === "fulfilled") state.calls = callsResult.value.calls || [];
      if (tasksResult.status === "fulfilled") state.tasks = tasksResult.value.tasks || [];
      if (complianceResult.status === "fulfilled") state.compliance = complianceResult.value;
      if (suppressionsResult.status === "fulfilled") state.suppressions = suppressionsResult.value.suppressions || [];
      syncOptOuts();
      updateStatusUI();
      renderMessages();
      renderOverview();
      renderContacts();
      renderLeads();
      renderCalls();
      renderTasks();
      renderCompliance();
      renderSuppressions();
    } finally {
      refresh?.classList.remove("ph-spin");
      $("#main-content")?.removeAttribute("aria-busy");
    }
  }

  function updateStatusUI() {
    const status = state.smsStatus;
    if (!status) return;
    const enabled = Boolean(status.messaging?.enabled);
    $(".nav-alert").hidden = enabled;
    $("#settings-messaging-dot").classList.toggle("status-warning", !enabled);
    $("#settings-messaging-status").textContent = enabled ? "Connected" : "Action required";
    if ($("#composer-disabled-note")) $("#composer-disabled-note").hidden = enabled;
    $("#send-message-button").disabled = !enabled;
    $("#last-updated").textContent = `Checked ${relativeTime(status.checkedAt)}`;
    const balance = status.usage?.balance;
    if (Number.isFinite(balance)) {
      $("#metric-balance").textContent = `${status.usage.currency === "USD" ? "$" : ""}${balance.toFixed(2)}`;
      $("#usage-balance").textContent = `${status.usage.currency === "USD" ? "$" : ""}${balance.toFixed(2)}`;
    }
    $("#webhook-status").textContent = status.messaging?.inboundWebhookConfigured ? "Configured" : "Not configured";
    $("#messaging-service-status").textContent = status.messaging?.serviceConfigured ? "Configured" : "Not configured";
  }

  function contactForPhone(phone) {
    return state.contacts.find((contact) => contact.phone === phone);
  }

  function normalizeContact(contact) {
    return {
      id: contact.id,
      firstName: contact.first_name || contact.firstName || "",
      lastName: contact.last_name || contact.lastName || "",
      company: contact.company || "",
      phone: contact.phone,
      consent: contact.consent_status || contact.consent || "pending",
      tags: Array.isArray(contact.tags) ? contact.tags : JSON.parse(contact.tags_json || "[]"),
      createdAt: contact.created_at || contact.createdAt,
      lastActivity: contact.last_activity || contact.lastActivity
    };
  }

  const leadStages = [
    ["new", "New"], ["contacted", "Contacted"], ["qualified", "Qualified"],
    ["proposal", "Proposal"], ["won", "Won"], ["lost", "Lost"]
  ];

  async function loadLeads() {
    try { const result = await api("/api/console/leads"); state.leads = result.leads || []; renderLeads(); }
    catch (error) { toast("error", "Could not load leads", error.message); }
  }

  function renderLeads() {
    const board = $("#pipeline-board");
    if (!board) return;
    const query = $("#lead-search")?.value.trim().toLowerCase() || "";
    const owner = $("#lead-owner-filter")?.value || "all";
    const priority = $("#lead-priority-filter")?.value || "all";
    const filtered = state.leads.filter((lead) => {
      const haystack = `${lead.first_name} ${lead.last_name} ${lead.company} ${lead.phone}`.toLowerCase();
      return (!query || haystack.includes(query)) && (owner !== "mine" || Number(lead.owner_user_id) === Number(state.user?.id)) && (priority === "all" || lead.priority === priority);
    });
    $("#nav-lead-count").textContent = state.leads.filter((lead) => !["won", "lost"].includes(lead.stage)).length;
    $("#pipeline-summary").innerHTML = leadStages.slice(0, 5).map(([stage, label]) => `<article><span>${label}</span><strong>${state.leads.filter((lead) => lead.stage === stage).length}</strong></article>`).join("");
    board.innerHTML = leadStages.map(([stage, label]) => {
      const items = filtered.filter((lead) => lead.stage === stage);
      return `<section class="pipeline-column" data-stage="${stage}"><header><span>${label}</span><strong>${items.length}</strong></header><div>${items.map((lead) => `<article class="lead-card" data-lead-id="${lead.id}"><div><span class="priority-dot ${lead.priority}" aria-label="${lead.priority} priority"></span><strong>${escapeHtml(`${lead.first_name} ${lead.last_name}`.trim())}</strong></div><p>${escapeHtml(lead.company || formatPhone(lead.phone))}</p><footer><span>${escapeHtml(lead.owner_name || "Unassigned")}</span><select data-lead-stage="${lead.id}" aria-label="Move ${escapeHtml(lead.first_name)}"><option value="">Move</option>${leadStages.filter(([value]) => value !== stage).map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}</select></footer><div class="lead-quick-actions"><button data-lead-call="${escapeHtml(lead.phone)}" aria-label="Call"><i class="ph ph-phone"></i></button><button data-lead-message="${escapeHtml(lead.phone)}" aria-label="Message"><i class="ph ph-chat-circle-text"></i></button></div></article>`).join("") || '<p class="column-empty">No leads</p>'}</div></section>`;
    }).join("");
  }

  async function loadCalls() {
    try { const result = await api("/api/console/calls"); state.calls = result.calls || []; renderCalls(); }
    catch (error) { toast("error", "Could not load calls", error.message); }
  }

  async function loadCompliance() {
    try {
      state.compliance = await api("/api/console/call-compliance");
      const result = await api("/api/console/suppressions");
      state.suppressions = result.suppressions || [];
      renderCompliance();
      renderSuppressions();
    } catch (error) { toast("error", "Could not load compliance controls", error.message); }
  }

  function renderCalls() {
    const body = $("#call-history-body"); if (!body) return;
    const calls = filteredCalls();
    $("#call-history-empty").hidden = calls.length > 0;
    $("#call-result-count").textContent = `${calls.length} ${calls.length === 1 ? "call" : "calls"}`;
    body.innerHTML = calls.map((call) => {
      const name = call.first_name ? `${call.first_name} ${call.last_name || ""}`.trim() : formatPhone(call.counterpart);
      const seconds = Number(call.duration_seconds || 0);
      const review = call.direction === "inbound" ? '<span class="badge">Inbound</span>' : call.call_preflight_id ? '<span class="badge badge-success"><i class="ph-bold ph-check"></i>Logged</span>' : '<span class="badge badge-warning">Legacy</span>';
      return `<tr><td>${escapeHtml(shortCallDate(call.created_at))}</td><td><strong>${escapeHtml(name)}</strong><small>${escapeHtml(call.company || call.counterpart)}</small></td><td>${call.direction === "inbound" ? "Inbound" : "Outbound"}</td><td>${escapeHtml(call.display_name || "Unassigned")}</td><td>${messageStatusBadge(call.status)}</td><td>${review}</td><td>${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s</td><td>${escapeHtml((call.disposition || "Untagged").replaceAll("_", " "))}</td><td><div class="call-row-actions"><button data-call-back="${escapeHtml(call.counterpart)}" aria-label="Call back"><i class="ph ph-phone"></i></button><button data-copy-number="${escapeHtml(call.counterpart)}" aria-label="Copy number"><i class="ph ph-copy"></i></button><button data-mark-dnc="${escapeHtml(call.counterpart)}" aria-label="Add to do-not-call list"><i class="ph ph-prohibit"></i></button><button data-tag-call="${call.id}" aria-label="Tag call"><i class="ph ph-tag"></i></button></div></td></tr>`;
    }).join("");
    renderCallMetrics();
    renderQuickCalls();
    renderDialContacts();
    syncCallOwnerFilter();
  }

  function callTimestamp(call) {
    const value = String(call?.created_at || "");
    return new Date(value && !value.includes("T") ? `${value.replace(" ", "T")}Z` : value);
  }

  function shortCallDate(value) {
    if (!value) return "Not available";
    const date = callTimestamp({ created_at: value });
    if (Number.isNaN(date.getTime())) return "Not available";
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
  }

  function filteredCalls() {
    const query = $("#call-search")?.value.trim().toLowerCase() || "";
    const direction = $("#call-direction-filter")?.value || "all";
    const outcome = $("#call-outcome-filter")?.value || "all";
    const owner = $("#call-owner-filter")?.value || "all";
    const days = $("#call-date-filter")?.value || "30";
    const cutoff = days === "all" ? 0 : Date.now() - Number(days) * 86400000;
    return state.calls.filter((call) => {
      const haystack = `${call.first_name || ""} ${call.last_name || ""} ${call.company || ""} ${call.counterpart || ""} ${call.display_name || ""}`.toLowerCase();
      const callOutcome = call.disposition || "untagged";
      return (!query || haystack.includes(query)) && (direction === "all" || call.direction === direction) && (outcome === "all" || callOutcome === outcome) && (owner === "all" || String(call.user_id || "unassigned") === owner) && (!cutoff || callTimestamp(call).getTime() >= cutoff);
    });
  }

  function renderCallMetrics() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todaysCalls = state.calls.filter((call) => callTimestamp(call) >= today);
    const connected = todaysCalls.filter((call) => ["completed", "answered", "connected"].includes(String(call.status).toLowerCase()));
    const talkSeconds = todaysCalls.reduce((sum, call) => sum + Number(call.duration_seconds || 0), 0);
    $("#call-stat-today").textContent = todaysCalls.length;
    $("#call-stat-connected").textContent = connected.length;
    $("#call-stat-talk").textContent = talkSeconds >= 3600 ? `${Math.floor(talkSeconds / 3600)}h ${Math.floor(talkSeconds % 3600 / 60)}m` : `${Math.floor(talkSeconds / 60)}m`;
    $("#call-stat-followups").textContent = state.calls.filter((call) => call.disposition === "follow_up").length;
  }

  function syncCallOwnerFilter() {
    const select = $("#call-owner-filter"); if (!select) return;
    const current = select.value;
    const owners = [...new Map(state.calls.filter((call) => call.user_id).map((call) => [String(call.user_id), call.display_name || "Team member"])).entries()];
    select.innerHTML = '<option value="all">All owners</option><option value="unassigned">Unassigned</option>' + owners.map(([id, name]) => `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`).join("");
    if ([...select.options].some((option) => option.value === current)) select.value = current;
  }

  function renderDialContacts() {
    const list = $("#dial-contact-list"); if (!list) return;
    const entries = [...state.leads.map((lead) => ({ phone: lead.phone, name: `${lead.first_name || ""} ${lead.last_name || ""}`.trim(), company: lead.company || "" })), ...state.contacts.map((contact) => ({ phone: contact.phone, name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(), company: contact.company || "" }))];
    list.innerHTML = entries.filter((entry) => entry.phone).map((entry) => `<option value="${escapeHtml(entry.phone)}">${escapeHtml([entry.name, entry.company].filter(Boolean).join(" · "))}</option>`).join("");
  }

  function renderQuickCalls() {
    const list = $("#quick-call-list"); if (!list) return;
    if (state.voice.hiddenRecents) { list.innerHTML = '<p class="compact-empty">Shortcuts cleared</p>'; return; }
    const unique = [...new Map(state.calls.filter((call) => call.counterpart).map((call) => [call.counterpart, call])).values()].slice(0, 5);
    list.innerHTML = unique.length ? unique.map((call) => { const name = call.first_name ? `${call.first_name} ${call.last_name || ""}`.trim() : formatPhone(call.counterpart); return `<div class="quick-call-item"><div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(call.counterpart)}</span></div><button data-call-back="${escapeHtml(call.counterpart)}" aria-label="Call ${escapeHtml(name)}"><i class="ph ph-phone"></i></button><button data-copy-number="${escapeHtml(call.counterpart)}" aria-label="Copy number"><i class="ph ph-copy"></i></button></div>`; }).join("") : '<p class="compact-empty">No recent numbers</p>';
  }

  async function loadTasks() {
    try { const result = await api("/api/console/tasks"); state.tasks = result.tasks || []; renderTasks(); }
    catch (error) { toast("error", "Could not load tasks", error.message); }
  }

  function renderTasks() {
    const strip = $("#task-strip"); if (!strip) return;
    const open = state.tasks.filter((task) => task.status === "open");
    strip.innerHTML = open.length ? open.slice(0, 8).map((task) => `<article class="task-card ${task.due_at && new Date(task.due_at) < new Date() ? "overdue" : ""}"><button data-complete-task="${task.id}" aria-label="Complete task"><i class="ph ph-circle"></i></button><div><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(task.first_name ? `${task.first_name} ${task.last_name || ""}` : "General task")} · ${task.due_at ? fullDate(task.due_at) : "No due date"}</span></div><small>${escapeHtml(task.assigned_name || "Unassigned")}</small></article>`).join("") : '<div class="empty-inline"><i class="ph ph-check-circle"></i><span>No open follow-up tasks.</span></div>';
  }

  function populateLeadSelects() {
    const options = state.leads.map((lead) => `<option value="${lead.id}">${escapeHtml(`${lead.first_name} ${lead.last_name}`.trim())} · ${escapeHtml(lead.company || lead.phone)}</option>`).join("");
    [$("#task-lead"), $("#call-lead")].forEach((select) => { if (select) select.innerHTML = `<option value="">No linked lead</option>${options}`; });
  }

  function setupSettingsTabs() {
    const source = $(".settings-tabs");
    if (!source) return;
    ["compliance", "numbers", "usage", "team", "templates"].forEach((route) => {
      const page = $(`.page[data-page='${route}']`);
      if (page && !page.querySelector(".settings-tabs")) page.querySelector(".page-header")?.insertAdjacentElement("afterend", source.cloneNode(true));
    });
  }

  function syncOptOuts() {
    const commands = /^(stop|unsubscribe|cancel|end|quit)$/i;
    let changed = false;
    state.messages.filter((message) => message.direction === "inbound" && commands.test(String(message.body || "").trim())).forEach((message) => {
      const contact = state.contacts.find((item) => item.phone === message.from);
      if (contact && contact.consent !== "opted_out") { contact.consent = "opted_out"; changed = true; }
    });
    if (changed) {
      save(CONTACTS_KEY, state.contacts);
      renderContacts();
    }
  }

  function messageStatusBadge(status) {
    const normalized = String(status || "unknown").toLowerCase();
    const tone = ["delivered", "sent", "received"].includes(normalized) ? "success" : ["failed", "undelivered"].includes(normalized) ? "danger" : "warning";
    return `<span class="badge badge-${tone}">${escapeHtml(normalized.replace(/_/g, " "))}</span>`;
  }

  function renderOverview() {
    const sent = state.messages.filter((message) => message.direction === "outbound");
    const inbound = state.messages.filter((message) => message.direction === "inbound");
    const delivered = sent.filter((message) => message.status === "delivered").length;
    const failed = sent.filter((message) => ["failed", "undelivered"].includes(message.status)).length;
    const pending = Math.max(0, sent.length - delivered - failed);
    $("#metric-sent").textContent = sent.length;
    $("#metric-responses").textContent = inbound.length;
    $("#metric-delivery").textContent = sent.length ? `${Math.round((delivered / sent.length) * 100)}%` : "Not available";
    $("#legend-delivered").textContent = delivered;
    $("#legend-pending").textContent = pending;
    $("#legend-failed").textContent = failed;
    $("#delivery-donut span").textContent = state.messages.length;
    $("#delivery-donut").style.background = sent.length
      ? `radial-gradient(circle at center,#fff 0 55%,transparent 57%),conic-gradient(var(--success) 0 ${Math.round(delivered / sent.length * 100)}%,#db9430 0 ${Math.round((delivered + pending) / sent.length * 100)}%,var(--danger) 0)`
      : "radial-gradient(circle at center,#fff 0 55%,transparent 57%),conic-gradient(var(--surface-strong) 0 100%)";
    $("#usage-sms").textContent = state.messages.length;
    const spend = state.messages.reduce((sum, message) => sum + Math.abs(Number(message.price || 0)), 0);
    $("#usage-spend").textContent = `$${spend.toFixed(2)}`;

    const recent = state.messages.slice(0, 6);
    $("#recent-empty").hidden = recent.length > 0;
    $("#recent-table-wrap").hidden = recent.length === 0;
    $("#recent-message-body").innerHTML = recent.map((message) => {
      const contact = contactForPhone(message.counterpart);
      const name = contact ? `${contact.firstName} ${contact.lastName}`.trim() : formatPhone(message.counterpart);
      return `<tr><td><strong>${escapeHtml(name)}</strong></td><td>${escapeHtml(message.body).slice(0, 70)}</td><td>${message.direction === "inbound" ? "Received" : "Sent"}</td><td>${messageStatusBadge(message.status)}</td><td>${escapeHtml(relativeTime(message.sentAt))}</td></tr>`;
    }).join("");
    renderActivityChart();
  }

  function renderActivityChart() {
    const chart = $("#activity-chart");
    const empty = $("#activity-chart-empty");
    if (!state.messages.length) { chart.hidden = true; empty.hidden = false; return; }
    const days = Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (13 - index));
      const count = state.messages.filter((message) => {
        const value = new Date(message.sentAt || message.createdAt);
        return value >= date && value < new Date(date.getTime() + 86400000);
      }).length;
      return { date, count };
    });
    const max = Math.max(...days.map((day) => day.count), 1);
    chart.innerHTML = days.map((day) => `<span class="activity-bar" style="height:${Math.max(5, day.count / max * 100)}%" data-label="${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(day.date)}: ${day.count}"></span>`).join("");
    chart.hidden = false;
    empty.hidden = true;
  }

  function groupedConversations() {
    const groups = new Map();
    state.messages.forEach((message) => {
      const key = message.counterpart;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(message);
    });
    return [...groups.entries()].map(([phone, messages]) => ({ phone, messages: messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt)), latest: messages[messages.length - 1] })).sort((a, b) => new Date(b.latest.sentAt) - new Date(a.latest.sentAt));
  }

  function renderMessages() {
    const list = $("#conversation-list");
    const search = $("#conversation-search")?.value.trim().toLowerCase() || "";
    let conversations = groupedConversations();
    if (search) conversations = conversations.filter((conversation) => {
      const contact = contactForPhone(conversation.phone);
      return `${contact?.firstName || ""} ${contact?.lastName || ""} ${conversation.phone} ${conversation.latest.body}`.toLowerCase().includes(search);
    });
    if (state.messageFilter === "failed") conversations = conversations.filter((conversation) => conversation.messages.some((message) => ["failed", "undelivered"].includes(message.status)));
    if (!conversations.length) {
      list.innerHTML = `<div class="conversation-empty"><span class="empty-icon"><i class="ph ph-chat-circle-text"></i></span><p>${state.messages.length ? "No conversations match this filter." : "No message history yet. Conversations will appear here after SMS is enabled."}</p></div>`;
      $("#nav-message-count").textContent = "0";
      $("#conversation-page").textContent = "Page 1 of 1";
      $("#conversation-prev").disabled = true;
      $("#conversation-next").disabled = true;
      if (!state.selectedConversation) renderThread(null);
      return;
    }
    $("#nav-message-count").textContent = conversations.length;
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(conversations.length / pageSize));
    state.conversationPage = Math.min(state.conversationPage, totalPages);
    const visibleConversations = conversations.slice((state.conversationPage - 1) * pageSize, state.conversationPage * pageSize);
    $("#conversation-page").textContent = `Page ${state.conversationPage} of ${totalPages}`;
    $("#conversation-prev").disabled = state.conversationPage === 1;
    $("#conversation-next").disabled = state.conversationPage === totalPages;
    list.innerHTML = visibleConversations.map((conversation) => {
      const contact = contactForPhone(conversation.phone);
      const name = contact ? `${contact.firstName} ${contact.lastName}`.trim() : formatPhone(conversation.phone);
      const active = state.selectedConversation === conversation.phone ? " active" : "";
      return `<button class="conversation-item${active}" data-conversation="${escapeHtml(conversation.phone)}"><span class="avatar">${escapeHtml(contact ? initials(contact.firstName, contact.lastName) : "#")}</span><span class="conversation-copy"><div><strong>${escapeHtml(name)}</strong><time>${escapeHtml(relativeTime(conversation.latest.sentAt))}</time></div><p>${conversation.latest.direction === "outbound" ? "You: " : ""}${escapeHtml(conversation.latest.body)}</p></span></button>`;
    }).join("");
    $$("[data-conversation]", list).forEach((button) => button.addEventListener("click", () => {
      state.selectedConversation = button.dataset.conversation;
      renderMessages();
      renderThread(state.selectedConversation);
    }));
    if (state.selectedConversation) renderThread(state.selectedConversation);
  }

  function renderThread(phone) {
    const panel = $("#thread-panel");
    if (!phone) {
      panel.innerHTML = '<div class="thread-empty"><span class="empty-icon"><i class="ph ph-chats"></i></span><h2>Select a conversation</h2><p>Choose a contact to view the complete message history.</p></div>';
      return;
    }
    const contact = contactForPhone(phone);
    const name = contact ? `${contact.firstName} ${contact.lastName}`.trim() : formatPhone(phone);
    const messages = state.messages.filter((message) => message.counterpart === phone).sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    panel.innerHTML = `<header class="thread-header"><div class="thread-contact"><span class="avatar">${escapeHtml(contact ? initials(contact.firstName, contact.lastName) : "#")}</span><div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(formatPhone(phone))}</span></div></div><button class="icon-button" data-thread-call aria-label="Call ${escapeHtml(name)}"><i class="ph ph-phone"></i></button></header><div class="message-stream">${messages.map((message) => `<article class="message-bubble ${message.direction}"><p>${escapeHtml(message.body)}</p><footer><span>${escapeHtml(relativeTime(message.sentAt))}</span><span>${escapeHtml(message.status)}</span></footer></article>`).join("")}</div><form class="thread-composer"><label class="sr-only" for="thread-message">Reply</label><textarea id="thread-message" placeholder="Reply to ${escapeHtml(name)}" ${state.smsStatus?.messaging?.enabled ? "" : "disabled"}></textarea><button class="button button-primary" type="submit" ${state.smsStatus?.messaging?.enabled ? "" : "disabled"}><i class="ph-bold ph-paper-plane-tilt"></i>Send</button></form>`;
    $("[data-thread-call]", panel)?.addEventListener("click", () => { routeTo("voice"); $("#phone-input").value = phone; updateCallButton(); });
    $(".thread-composer", panel)?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const field = $("textarea", event.currentTarget);
      await sendMessage(phone, field.value);
      field.value = "";
    });
    $(".message-stream", panel).scrollTop = $(".message-stream", panel).scrollHeight;
  }

  function renderContacts() {
    const query = $("#contact-search")?.value.trim().toLowerCase() || "";
    const consent = $("#contact-consent-filter")?.value || "all";
    const sort = $("#contact-sort")?.value || "recent";
    let contacts = [...state.contacts];
    if (query) contacts = contacts.filter((contact) => `${contact.firstName} ${contact.lastName} ${contact.company} ${contact.phone}`.toLowerCase().includes(query));
    if (consent !== "all") contacts = contacts.filter((contact) => contact.consent === consent);
    contacts.sort(sort === "name" ? (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`) : (a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    $("#contact-result-count").textContent = `${contacts.length} contact${contacts.length === 1 ? "" : "s"}`;
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(contacts.length / pageSize));
    state.contactPage = Math.min(state.contactPage, totalPages);
    const visibleContacts = contacts.slice((state.contactPage - 1) * pageSize, state.contactPage * pageSize);
    $("#contact-page").textContent = `Page ${state.contactPage} of ${totalPages}`;
    $("#contact-prev").disabled = state.contactPage === 1;
    $("#contact-next").disabled = state.contactPage === totalPages;
    $("#contacts-table-body").innerHTML = visibleContacts.map((contact) => {
      const consentLabel = { opted_in: "Opted in", opted_out: "Opted out", pending: "Pending proof" }[contact.consent];
      const tone = contact.consent === "opted_in" ? "success" : contact.consent === "opted_out" ? "danger" : "warning";
      return `<tr><td><input type="checkbox" aria-label="Select ${escapeHtml(contact.firstName)}"></td><td><div class="contact-cell"><span class="avatar">${escapeHtml(initials(contact.firstName, contact.lastName))}</span><span><strong>${escapeHtml(`${contact.firstName} ${contact.lastName}`.trim())}</strong><small>${escapeHtml(contact.company || "No company")}</small></span></div></td><td>${escapeHtml(formatPhone(contact.phone))}</td><td><span class="badge badge-${tone}">${consentLabel}</span></td><td>${contact.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join(" ")}</td><td>${escapeHtml(relativeTime(contact.lastActivity))}</td><td><button class="icon-button" data-contact-action="${escapeHtml(contact.id)}" aria-label="Contact actions"><i class="ph ph-dots-three"></i></button></td></tr>`;
    }).join("");
    const counts = { opted_in: 0, pending: 0, opted_out: 0 };
    state.contacts.forEach((contact) => counts[contact.consent]++);
    if ($("#consent-opted-in")) $("#consent-opted-in").textContent = counts.opted_in;
    if ($("#consent-pending")) $("#consent-pending").textContent = counts.pending;
    if ($("#consent-opted-out")) $("#consent-opted-out").textContent = counts.opted_out;
  }

  function renderTemplates() {
    const query = $("#template-search")?.value.trim().toLowerCase() || "";
    const category = $("#template-category-filter")?.value || "all";
    const templates = state.templates.filter((template) => (!query || `${template.name} ${template.body}`.toLowerCase().includes(query)) && (category === "all" || template.category === category));
    $("#template-grid").innerHTML = templates.length ? templates.map((template) => `<article class="template-card"><header><div><h2>${escapeHtml(template.name)}</h2><span>${escapeHtml(template.category.replace(/_/g, " "))}</span></div><div class="template-actions"><button class="icon-button" data-use-template="${escapeHtml(template.id)}" aria-label="Use ${escapeHtml(template.name)}"><i class="ph ph-paper-plane-tilt"></i></button><button class="icon-button" data-delete-template="${escapeHtml(template.id)}" aria-label="Delete ${escapeHtml(template.name)}"><i class="ph ph-trash"></i></button></div></header><p>${escapeHtml(template.body)}</p><footer><span>Updated ${escapeHtml(relativeTime(template.updatedAt))}</span><span>Used ${template.usageCount || 0} times</span></footer></article>`).join("") : '<div class="empty-state"><span class="empty-icon"><i class="ph ph-note-blank"></i></span><h3>No templates found</h3><p>Create a reusable message or change the current filters.</p></div>';
    $$("[data-use-template]").forEach((button) => button.addEventListener("click", () => openComposer({ templateId: button.dataset.useTemplate })));
    $$("[data-delete-template]").forEach((button) => button.addEventListener("click", () => {
      state.templates = state.templates.filter((template) => template.id !== button.dataset.deleteTemplate);
      save(TEMPLATES_KEY, state.templates);
      renderTemplates();
      toast("success", "Template removed");
    }));
  }

  function renderSchedules() {
    const now = Date.now();
    const schedules = state.schedules.filter((schedule) => state.scheduleFilter === "upcoming" ? schedule.status === "scheduled" && new Date(schedule.scheduledAt).getTime() > now : schedule.status === state.scheduleFilter);
    $("#upcoming-count").textContent = state.schedules.filter((schedule) => schedule.status === "scheduled" && new Date(schedule.scheduledAt).getTime() > now).length;
    $("#nav-scheduled-count").textContent = $("#upcoming-count").textContent;
    $("#scheduled-empty").hidden = schedules.length > 0;
    $("#scheduled-table-body").closest(".responsive-table").hidden = schedules.length === 0;
    $("#scheduled-table-body").innerHTML = schedules.map((schedule) => `<tr><td>${escapeHtml(formatPhone(schedule.to))}</td><td>${escapeHtml(schedule.body).slice(0, 90)}</td><td>${escapeHtml(fullDate(schedule.scheduledAt))}</td><td>${escapeHtml(schedule.createdBy || state.user?.name || "Team member")}</td><td><span class="badge badge-warning">${escapeHtml(schedule.status)}</span></td><td><button class="icon-button" data-cancel-schedule="${escapeHtml(schedule.id)}" aria-label="Cancel scheduled message"><i class="ph ph-x"></i></button></td></tr>`).join("");
    $$("[data-cancel-schedule]").forEach((button) => button.addEventListener("click", async () => {
      const schedule = state.schedules.find((item) => item.id === button.dataset.cancelSchedule);
      if (!schedule) return;
      button.disabled = true;
      try {
        if (schedule.sid) await api("/api/console/messages", { method: "PATCH", body: JSON.stringify({ sid: schedule.sid, status: "canceled" }) });
        schedule.status = "cancelled";
        save(SCHEDULES_KEY, state.schedules);
        renderSchedules();
        toast("success", "Scheduled message cancelled");
      } catch (error) {
        button.disabled = false;
        toast("error", "Could not cancel message", error.message);
      }
    }));
  }

  const minutesToInput = (minutes) => `${String(Math.floor(Number(minutes || 0) / 60)).padStart(2, "0")}:${String(Number(minutes || 0) % 60).padStart(2, "0")}`;
  const inputToMinutes = (value) => { const [hours, minutes] = String(value || "00:00").split(":").map(Number); return hours * 60 + minutes; };

  function renderCompliance() {
    const result = state.compliance;
    if (!result?.settings) return;
    const settings = result.settings;
    const counts = result.counts || {};
    $("#calls-enabled").checked = settings.callsEnabled;
    $("#ai-voice-enabled").checked = settings.aiVoiceEnabled;
    $("#recording-enabled").checked = settings.recordingEnabled;
    $("#calling-window-start").value = minutesToInput(settings.defaultWindowStart);
    $("#calling-window-end").value = minutesToInput(settings.defaultWindowEnd);
    $("#opening-script").value = settings.openingScript || "";
    $("#recording-notice").value = settings.recordingNoticeScript || "";
    $("#compliance-seller").textContent = settings.sellerIdentity;
    $("#compliance-caller-id").textContent = formatPhone(settings.approvedCallerId);
    $("#compliance-retention").textContent = `${settings.recordRetentionYears} years`;
    $("#policy-updated-at").textContent = settings.updatedAt ? `Updated ${relativeTime(settings.updatedAt)}` : "Not reviewed";
    $("#compliance-calls-status").textContent = settings.callsEnabled ? "Enabled with preflight" : "Paused";
    $("#compliance-calls-dot").className = `status-indicator ${settings.callsEnabled ? "" : "status-warning"}`;
    $("#compliance-dnc-count").textContent = `${Number(counts.suppressed || 0)} records`;
    $("#compliance-states-status").textContent = `${Number(counts.states_approved || 0)} approved, ${Number(counts.states_pending || 0)} pending`;
    $("#compliance-states-dot").className = `status-indicator ${Number(counts.states_pending || 0) ? "status-warning" : ""}`;
    $("#compliance-ai-status").textContent = settings.aiVoiceEnabled ? "Enabled with consent gate" : "Disabled";
    $("#compliance-ai-dot").className = `status-indicator ${settings.aiVoiceEnabled ? "status-warning" : ""}`;
    $("#call-policy-seller").textContent = settings.tradingName;
    $("#call-policy-caller-id").textContent = formatPhone(settings.approvedCallerId);
    $("#call-policy-mode").textContent = `Live agent, ${settings.recordingEnabled ? "recording available" : "not recorded"}`;
    const callingNeedsReview = !settings.callsEnabled || Number(counts.states_pending || 0) > 0;
    $("#settings-calling-dot").className = `status-indicator ${callingNeedsReview ? "status-warning" : ""}`;
    $("#settings-calling-status").textContent = !settings.callsEnabled ? "Outbound calls paused" : Number(counts.states_pending || 0) ? `${Number(counts.states_pending)} state reviews pending` : "Policy reviewed";
    $(".nav-alert").hidden = Boolean(state.smsStatus?.messaging?.enabled) && !callingNeedsReview;

    const stateSelect = $("#state-policy-select");
    const preflightState = $("#preflight-state");
    const current = stateSelect.value;
    const options = (result.states || []).map((item) => `<option value="${escapeHtml(item.state_code)}">${escapeHtml(item.state_name)}</option>`).join("");
    stateSelect.innerHTML = options;
    preflightState.innerHTML = `<option value="">Select</option>${options}`;
    if (current && [...stateSelect.options].some((option) => option.value === current)) stateSelect.value = current;
    syncStatePolicyForm();

    const events = result.recentEvents || [];
    $("#compliance-audit-list").innerHTML = events.length ? events.map((event) => `<article><span class="audit-icon"><i class="ph ${event.event_type.includes("blocked") || event.event_type.includes("do_not_call") ? "ph-prohibit" : "ph-shield-check"}"></i></span><div><strong>${escapeHtml(event.event_type.replaceAll("_", " "))}</strong><small>${escapeHtml([event.phone ? formatPhone(event.phone) : "Workspace", event.display_name || "System"].join(" · "))}</small></div><time>${escapeHtml(relativeTime(event.created_at))}</time></article>`).join("") : '<p class="compact-empty">No compliance events</p>';
  }

  function syncStatePolicyForm() {
    const selected = state.compliance?.states?.find((item) => item.state_code === $("#state-policy-select")?.value) || state.compliance?.states?.[0];
    if (!selected) return;
    $("#state-policy-select").value = selected.state_code;
    $("#state-policy-status").value = selected.status;
    $("#state-window-start").value = minutesToInput(selected.window_start);
    $("#state-window-end").value = minutesToInput(selected.window_end);
    $("#state-policy-notes").value = selected.notes || "";
    const badge = $("#state-policy-badge");
    badge.className = `badge ${selected.status === "approved" ? "badge-success" : selected.status === "blocked" ? "badge-danger" : "badge-warning"}`;
    badge.textContent = selected.status.replaceAll("_", " ");
  }

  function renderSuppressions() {
    const empty = $("#suppression-empty");
    const body = $("#suppression-table-body");
    if (!empty || !body) return;
    empty.hidden = state.suppressions.length > 0;
    body.closest(".responsive-table").hidden = state.suppressions.length === 0;
    body.innerHTML = state.suppressions.map((entry) => `<tr><td>${escapeHtml(formatPhone(entry.phone))}</td><td>${escapeHtml(entry.reason)}</td><td>${escapeHtml(entry.source)}</td><td>${escapeHtml(fullDate(entry.created_at || entry.createdAt))}</td></tr>`).join("");
  }

  function renderAll() {
    renderContacts();
    renderTemplates();
    renderSchedules();
    renderSuppressions();
    renderMessages();
    renderOverview();
    renderLeads();
    renderCalls();
    renderTasks();
    renderCompliance();
  }

  function openDialog(dialog) {
    if (!dialog.open) dialog.showModal();
    haptic();
  }

  function openComposer(options = {}) {
    const dialog = $("#composer-dialog");
    $("#composer-form").reset();
    $("#message-recipient").value = options.to || "";
    const template = options.templateId ? state.templates.find((item) => item.id === options.templateId) : null;
    $("#message-body").value = template?.body || "";
    $("#schedule-toggle").checked = Boolean(options.schedule);
    $("#schedule-fields").hidden = !options.schedule;
    updateComposerCount();
    openDialog(dialog);
    window.setTimeout(() => $("#message-recipient").focus(), 80);
  }

  function updateComposerCount() {
    const length = $("#message-body").value.length;
    const segments = length ? Math.ceil(length / (/[^\u0000-\u007f]/.test($("#message-body").value) ? 70 : 160)) : 0;
    $("#segment-count").textContent = `${length} character${length === 1 ? "" : "s"}, ${segments} segment${segments === 1 ? "" : "s"}`;
  }

  async function sendMessage(to, body, scheduledAt = null) {
    if (!state.smsStatus?.messaging?.enabled) {
      toast("warning", "SMS setup required", "Complete A2P brand and campaign registration before sending.");
      routeTo("compliance");
      return false;
    }
    const suppressed = state.suppressions.some((entry) => entry.phone === to) || state.contacts.some((contact) => contact.phone === to && contact.consent === "opted_out");
    if (suppressed) {
      toast("error", "Recipient is opted out", "Remove the suppression only after receiving new consent.");
      return false;
    }
    try {
      const result = await api("/api/console/messages", { method: "POST", body: JSON.stringify({ to, body, scheduledAt }) });
      if (result.message) state.messages.unshift(result.message);
      toast("success", scheduledAt ? "Message scheduled" : "Message queued", scheduledAt ? fullDate(scheduledAt) : `Sending to ${formatPhone(to)}`);
      renderMessages();
      renderOverview();
      return true;
    } catch (error) {
      if (error.code === "SMS_SETUP_REQUIRED") routeTo("compliance");
      toast("error", "Message not sent", error.message);
      return false;
    }
  }

  async function handleComposerSubmit(event) {
    event.preventDefault();
    const button = $("#send-message-button");
    const to = $("#message-recipient").value.replace(/[\s().-]/g, "");
    const body = $("#message-body").value.trim();
    let scheduledAt = null;
    if ($("#schedule-toggle").checked) {
      const date = $("#schedule-date").value;
      const time = $("#schedule-time").value;
      if (!date || !time) return toast("warning", "Choose a schedule date and time");
      scheduledAt = new Date(`${date}T${time}:00+05:30`).toISOString();
    }
    button.disabled = true;
    try {
      const sent = await sendMessage(to, body, scheduledAt);
      if (sent) {
        if (scheduledAt) {
          state.schedules.unshift({ id: crypto.randomUUID(), sid: state.messages[0]?.sid || null, to, body, scheduledAt, status: "scheduled", createdAt: new Date().toISOString(), createdBy: state.user?.name || "Team member" });
          save(SCHEDULES_KEY, state.schedules);
          renderSchedules();
        }
        $("#composer-dialog").close();
      }
    } finally { button.disabled = !state.smsStatus?.messaging?.enabled; }
  }

  async function handleAddContact(event) {
    event.preventDefault();
    const contact = {
      id: crypto.randomUUID(),
      firstName: $("#contact-first-name").value.trim(),
      lastName: $("#contact-last-name").value.trim(),
      phone: $("#contact-phone").value.replace(/[\s().-]/g, ""),
      company: $("#contact-company").value.trim(),
      consent: $("#contact-consent").value,
      tags: ["Contact"],
      createdAt: new Date().toISOString(),
      lastActivity: null
    };
    if (!/^\+[1-9]\d{7,14}$/.test(contact.phone)) return toast("error", "Enter a valid international phone number");
    if (state.contacts.some((item) => item.phone === contact.phone)) return toast("warning", "This phone number already exists");
    try {
      await api("/api/console/contacts", { method: "POST", body: JSON.stringify(contact) });
      const result = await api("/api/console/contacts");
      state.contacts = (result.contacts || []).map(normalizeContact);
      renderContacts(); $("#contact-dialog").close(); event.currentTarget.reset();
      toast("success", "Contact added", `${contact.firstName} is ready for messaging.`);
    } catch (error) { toast("error", "Could not add contact", error.message); }
  }

  async function handleAddLead(event) {
    event.preventDefault();
    try {
      await api("/api/console/leads", { method: "POST", body: JSON.stringify({
        firstName: $("#lead-first-name").value.trim(), lastName: $("#lead-last-name").value.trim(), company: $("#lead-company").value.trim(),
        phone: $("#lead-phone").value.trim(), email: $("#lead-email").value.trim(), source: $("#lead-source").value,
        priority: $("#lead-priority").value, notes: $("#lead-notes").value.trim()
      }) });
      event.currentTarget.reset(); $("#lead-dialog").close(); await loadLeads(); populateLeadSelects(); toast("success", "Lead added");
    } catch (error) { toast("error", "Could not add lead", error.message); }
  }

  async function handleAddTask(event) {
    event.preventDefault();
    try {
      const due = $("#task-due").value ? new Date($("#task-due").value).toISOString() : null;
      await api("/api/console/tasks", { method: "POST", body: JSON.stringify({ title: $("#task-title").value.trim(), leadId: $("#task-lead").value || null, dueAt: due }) });
      event.currentTarget.reset(); $("#task-dialog").close(); await loadTasks(); toast("success", "Follow-up task added");
    } catch (error) { toast("error", "Could not add task", error.message); }
  }

  async function handleCallOutcome(event) {
    event.preventDefault(); const id = $("#call-event-id").value;
    try {
      await api(`/api/console/calls/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({
        disposition: $("#call-disposition").value, leadId: $("#call-lead").value || null,
        tags: $("#call-tags").value.split(",").map((tag) => tag.trim()).filter(Boolean), notes: $("#call-notes").value.trim(),
        nextFollowUpAt: $("#call-follow-up").value ? new Date($("#call-follow-up").value).toISOString() : null, assignedTo: state.user?.id
      }) });
      $("#call-outcome-dialog").close(); event.currentTarget.reset(); await Promise.all([loadCalls(), loadTasks(), loadCompliance()]); toast("success", "Call outcome saved");
    } catch (error) { toast("error", "Could not save call outcome", error.message); }
  }

  function handleAddTemplate(event) {
    event.preventDefault();
    state.templates.unshift({ id: crypto.randomUUID(), name: $("#template-name").value.trim(), category: $("#template-category").value, body: $("#template-body").value.trim(), updatedAt: new Date().toISOString(), usageCount: 0 });
    save(TEMPLATES_KEY, state.templates);
    renderTemplates();
    $("#template-dialog").close();
    event.currentTarget.reset();
    toast("success", "Template saved");
  }

  async function recordSuppression(phone, reason = "Manual do-not-call", source = "admin_console") {
    await api("/api/console/suppressions", { method: "POST", body: JSON.stringify({ phone, reason, source }) });
    const result = await api("/api/console/suppressions");
    state.suppressions = result.suppressions || [];
    renderSuppressions();
  }

  async function addSuppression() {
    const phone = window.prompt("Phone number in international format, for example +12125550142");
    if (!phone) return;
    const normalized = phone.replace(/[\s().-]/g, "");
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) return toast("error", "Enter a valid international phone number");
    try {
      await recordSuppression(normalized);
      toast("success", "Number added to the do-not-call list");
    } catch (error) { toast("error", "Could not record do-not-call", error.message); }
  }

  function updateNetworkStatus() {
    const node = $("#network-status"); if (!node) return;
    const online = navigator.onLine;
    node.classList.toggle("offline", !online);
    node.innerHTML = online ? '<i class="ph ph-wifi-high"></i><span>Online</span>' : '<i class="ph ph-wifi-slash"></i><span>Offline</span>';
  }

  async function populateAudioDevices(requestPermission = false) {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    let permissionStream = null;
    try {
      if (requestPermission) permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const input = $("#audio-input"); const output = $("#audio-output");
      const savedInput = localStorage.getItem(AUDIO_INPUT_KEY) || "default";
      const savedOutput = localStorage.getItem(AUDIO_OUTPUT_KEY) || "default";
      const microphones = devices.filter((device) => device.kind === "audioinput");
      const speakers = devices.filter((device) => device.kind === "audiooutput");
      input.innerHTML = '<option value="default">System default</option>' + microphones.filter((device) => device.deviceId !== "default").map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${index + 1}`)}</option>`).join("");
      output.innerHTML = '<option value="default">System default</option>' + speakers.filter((device) => device.deviceId !== "default").map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Speaker ${index + 1}`)}</option>`).join("");
      if ([...input.options].some((option) => option.value === savedInput)) input.value = savedInput;
      if ([...output.options].some((option) => option.value === savedOutput)) output.value = savedOutput;
      output.disabled = !("setSinkId" in HTMLMediaElement.prototype);
      await applyVoiceAudioDevices();
    } catch (error) {
      if (requestPermission) toast("error", "Microphone access unavailable", error.message);
    } finally { permissionStream?.getTracks().forEach((track) => track.stop()); }
  }

  async function applyVoiceAudioDevices() {
    const audio = state.voice.device?.audio; if (!audio) return;
    try {
      const inputId = $("#audio-input")?.value || "default";
      const outputId = $("#audio-output")?.value || "default";
      if (inputId !== "default" && audio.setInputDevice) await audio.setInputDevice(inputId);
      else if (inputId === "default" && audio.unsetInputDevice) await audio.unsetInputDevice();
      if (outputId !== "default" && audio.speakerDevices?.set) await audio.speakerDevices.set(outputId);
      if (outputId !== "default" && audio.ringtoneDevices?.set) await audio.ringtoneDevices.set(outputId);
    } catch (error) { toast("error", "Could not switch audio device", error.message); }
  }

  function stopMicrophoneTest() {
    if (state.voice.micFrame) cancelAnimationFrame(state.voice.micFrame);
    state.voice.micFrame = null;
    state.voice.micStream?.getTracks().forEach((track) => track.stop());
    state.voice.micStream = null;
    $("#mic-level span").style.width = "0";
    $("#test-microphone").classList.remove("testing");
    $("#test-microphone").innerHTML = '<i class="ph ph-waveform"></i>Test microphone';
  }

  async function testMicrophone() {
    if (state.voice.micStream) { stopMicrophoneTest(); return; }
    try {
      const deviceId = $("#audio-input").value;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: deviceId === "default" ? true : { deviceId: { exact: deviceId } } });
      state.voice.micStream = stream;
      await populateAudioDevices(false);
      const context = new AudioContext(); const source = context.createMediaStreamSource(stream); const analyser = context.createAnalyser(); const data = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser); analyser.fftSize = 256;
      $("#test-microphone").classList.add("testing");
      $("#test-microphone").innerHTML = '<i class="ph ph-stop"></i>Stop test';
      const draw = () => { analyser.getByteFrequencyData(data); const average = data.reduce((sum, value) => sum + value, 0) / data.length; $("#mic-level span").style.width = `${Math.min(100, average * 1.8)}%`; state.voice.micFrame = requestAnimationFrame(draw); };
      draw();
      window.setTimeout(async () => { if (state.voice.micStream === stream) { stopMicrophoneTest(); await context.close(); } }, 7000);
    } catch (error) { toast("error", "Microphone test failed", error.message); }
  }

  async function initVoice() {
    if (state.voice.device || !window.Twilio?.Device || !state.token) return;
    const chip = $("#voice-connection-chip");
    try {
      const result = await api("/api/console/voice-token", { method: "POST" });
      const device = new window.Twilio.Device(result.token, { codecPreferences: ["opus", "pcmu"], closeProtection: true });
      state.voice.device = device;
      device.on("registered", () => { chip.className = "integration-chip success"; chip.innerHTML = '<span class="status-indicator"></span><span>Voice ready</span>'; });
      device.on("error", (error) => { chip.className = "integration-chip warning"; chip.innerHTML = '<span class="status-indicator status-warning"></span><span>Voice unavailable</span>'; toast("error", "Voice connection failed", error.message); });
      device.on("tokenWillExpire", async () => { const refresh = await api("/api/console/voice-token", { method: "POST" }); device.updateToken(refresh.token); });
      device.on("incoming", (call) => {
        state.voice.incoming = call;
        $("#incoming-call-number").textContent = formatPhone(call.parameters?.From || "Unknown number");
        $("#incoming-call-dialog").showModal();
        call.on("cancel", () => { state.voice.incoming = null; $("#incoming-call-dialog").close(); loadCalls(); });
        call.on("disconnect", () => { state.voice.incoming = null; $("#incoming-call-dialog").close(); loadCalls(); });
      });
      await device.register();
      await populateAudioDevices(false);
      const heartbeat = () => api("/api/console/presence", { method: "POST", body: JSON.stringify({ available: $("#receive-calls-toggle")?.checked !== false }) }).catch(() => {});
      heartbeat();
      clearInterval(state.voice.presenceTimer);
      state.voice.presenceTimer = window.setInterval(heartbeat, 30000);
    } catch (error) {
      chip.className = "integration-chip warning";
      chip.innerHTML = '<span class="status-indicator status-warning"></span><span>Voice unavailable</span>';
    }
  }

  function normalizedDialNumber() {
    const input = $("#phone-input").value.trim().replace(/[\s().-]/g, "");
    if (input.startsWith("+")) return input;
    return input.length === 10 ? `+1${input}` : input;
  }

  function updateCallButton() {
    const number = normalizedDialNumber();
    if (state.voice.preflightPhone && state.voice.preflightPhone !== number) resetCallPreflight();
    $("#call-button").disabled = !/^\+[1-9]\d{7,14}$/.test(number) || Boolean(state.voice.call);
    const match = state.leads.find((lead) => lead.phone === number) || state.contacts.find((contact) => contact.phone === number);
    const name = match ? `${match.first_name || match.firstName || ""} ${match.last_name || match.lastName || ""}`.trim() : "";
    $("#dial-contact-match").textContent = name ? [name, match.company].filter(Boolean).join(" · ") : "No contact selected";
  }

  function resetCallPreflight() {
    state.voice.preflight = null;
    state.voice.preflightPhone = "";
    [["#preflight-recipient", "Review"], ["#preflight-time", "Review"], ["#preflight-dnc", "Review"], ["#preflight-voice", "Live"]].forEach(([selector, text]) => { const node = $(selector); if (node) { node.textContent = text; node.closest("span")?.removeAttribute("data-state"); } });
    const buttonText = $("#call-button span"); if (buttonText) buttonText.textContent = "Review call";
  }

  function renderPreflightChecks(result) {
    const byId = Object.fromEntries((result.checks || []).map((check) => [check.id, check]));
    const set = (selector, check, fallback) => {
      const node = $(selector); if (!node) return;
      node.textContent = check?.detail || fallback;
      node.closest("span")?.setAttribute("data-state", check?.status || "pending");
    };
    set("#preflight-recipient", byId.screening, result.allowed ? "Clear" : "Blocked");
    set("#preflight-time", byId.window, result.localTime || "Unknown");
    set("#preflight-dnc", byId.suppression, result.allowed ? "Clear" : "Blocked");
    set("#preflight-voice", byId.voice, "Live agent");
  }

  function renderPreflightResult(result) {
    const panel = $("#preflight-result");
    const reasons = result.reasons || [];
    const warnings = result.warnings || [];
    panel.hidden = false;
    panel.className = `preflight-result ${reasons.length ? "blocked" : warnings.length ? "warning" : "allowed"}`;
    panel.innerHTML = `<strong><i class="ph-bold ph-${reasons.length ? "prohibit" : warnings.length ? "warning-circle" : "check-circle"}"></i>${reasons.length ? "Call blocked" : warnings.length ? "Allowed with review notes" : "Checks passed"}</strong>${[...reasons, ...warnings].map((item) => `<p>${escapeHtml(item)}</p>`).join("")}${result.openingScript && !reasons.length ? `<div class="approved-opening"><small>Approved opening</small><p>${escapeHtml(result.openingScript).replace("{{agent}}", state.user?.name || "the agent").replace("{{company}}", $("#preflight-company").value.trim() || "your business")}</p></div>` : ""}`;
  }

  async function openCallPreflight() {
    const to = normalizedDialNumber();
    if (!/^\+[1-9]\d{7,14}$/.test(to)) return toast("warning", "Enter a valid phone number");
    resetCallPreflight();
    if (!state.compliance) await loadCompliance();
    const form = $("#call-preflight-form");
    form.reset();
    $("#preflight-submit span").textContent = "Review and call";
    $("#preflight-dialog-number").textContent = formatPhone(to);
    $("#preflight-result").hidden = true;
    const match = state.leads.find((lead) => lead.phone === to) || state.contacts.find((contact) => contact.phone === to);
    $("#preflight-company").value = match?.company || "";
    try {
      const result = await api(`/api/console/call-preflight?phone=${encodeURIComponent(to)}`);
      const profile = result.profile || {};
      $("#preflight-recipient-type").value = profile.recipient_type || (match?.company ? "business" : "unknown");
      $("#preflight-company").value = profile.company_name || match?.company || "";
      $("#preflight-state").value = profile.us_state || "";
      $("#preflight-timezone").value = profile.timezone || "";
      $("#preflight-relationship").value = profile.relationship || "cold_business";
      $("#preflight-screening").value = result.suppressed ? "listed_do_not_call" : profile.screening_basis || "not_screened";
      $("#preflight-consent-type").value = profile.consent_type || "none";
      $("#preflight-consent-evidence").value = profile.consent_evidence || "";
      if (result.suppressed) renderPreflightResult({ reasons: [`Internal do-not-call: ${result.suppressed.reason || "Do-not-call request"}`], warnings: [] });
    } catch (error) { toast("error", "Could not load call review", error.message); }
    togglePreflightConsentFields();
    openDialog($("#call-preflight-dialog"));
    window.setTimeout(() => $("#preflight-recipient-type").focus(), 60);
  }

  function togglePreflightConsentFields() {
    $("#ai-consent-row").hidden = $("#preflight-call-mode").value !== "ai_or_prerecorded";
    $("#recording-consent-row").hidden = $("#preflight-recording-mode").value !== "on";
  }

  async function handleCallPreflight(event) {
    event.preventDefault();
    const button = $("#preflight-submit");
    const to = normalizedDialNumber();
    if (state.voice.preflight?.allowed && state.voice.preflightPhone === to && new Date(state.voice.preflight.expiresAt).getTime() > Date.now()) return connectApprovedCall();
    button.disabled = true;
    const payload = {
      phone: to,
      recipientType: $("#preflight-recipient-type").value,
      companyName: $("#preflight-company").value.trim(),
      stateCode: $("#preflight-state").value,
      timezone: $("#preflight-timezone").value,
      relationship: $("#preflight-relationship").value,
      screeningBasis: $("#preflight-screening").value,
      callMode: $("#preflight-call-mode").value,
      recordingMode: $("#preflight-recording-mode").value,
      consentType: $("#preflight-consent-type").value,
      consentEvidence: $("#preflight-consent-evidence").value.trim(),
      aiVoiceConsent: $("#preflight-ai-consent").checked,
      recordingConsent: $("#preflight-recording-consent").checked,
      agentAttested: $("#preflight-attestation").checked
    };
    try {
      const result = await api("/api/console/call-preflight", { method: "POST", body: JSON.stringify(payload) });
      renderPreflightResult(result);
      renderPreflightChecks(result);
      state.voice.preflight = result;
      state.voice.preflightPhone = to;
      $("#call-button span").textContent = "Approved";
      $("#preflight-submit span").textContent = "Start approved call";
    } catch (error) {
      const result = error.details || { reasons: [error.message], warnings: [] };
      renderPreflightResult(result);
      renderPreflightChecks(result);
      state.voice.preflight = null;
      state.voice.preflightPhone = "";
      $("#preflight-submit span").textContent = "Review and call";
    } finally { button.disabled = false; }
  }

  async function connectApprovedCall() {
    const to = normalizedDialNumber();
    const preflight = state.voice.preflight;
    if (!preflight?.allowed || state.voice.preflightPhone !== to || new Date(preflight.expiresAt).getTime() <= Date.now()) return openCallPreflight();
    if (!state.voice.device) await initVoice();
    if (!state.voice.device) return toast("error", "Voice is not available", "Check the Twilio Voice API configuration.");
    try {
      haptic(20);
      const call = await state.voice.device.connect({ params: { TargetNumber: to, PreflightId: preflight.id, CallMode: $("#preflight-call-mode").value, Recording: $("#preflight-recording-mode").value } });
      $("#call-preflight-dialog").close();
      state.voice.call = call;
      state.voice.muted = false;
      state.voice.startedAt = Date.now();
      localStorage.setItem(LAST_DIALLED_KEY, to);
      $("#in-call").hidden = false;
      $("#in-call-number").textContent = formatPhone(to);
      $("#in-call-status").textContent = "Connecting";
      $("#call-button").hidden = true;
      call.on("accept", () => { $("#in-call-status").textContent = "Connected"; startCallTimer(); });
      call.on("disconnect", endCallUI);
      call.on("cancel", endCallUI);
      call.on("error", (error) => { toast("error", "Call failed", error.message); endCallUI(); });
    } catch (error) { toast("error", "Could not place call", error.message); endCallUI(); }
  }

  function placeCall() { return openCallPreflight(); }

  function startCallTimer() {
    clearInterval(state.voice.timer);
    state.voice.timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.voice.startedAt) / 1000);
      $("#call-timer").textContent = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
    }, 1000);
  }

  function endCallUI() {
    clearInterval(state.voice.timer);
    state.voice.timer = null;
    state.voice.call = null;
    state.voice.muted = false;
    $("#in-call").hidden = true;
    $("#call-button").hidden = false;
    $("#call-timer").textContent = "00:00";
    $("#mute-call").setAttribute("aria-pressed", "false");
    $("#mute-call").innerHTML = '<i class="ph ph-microphone"></i><span>Mute</span>';
    updateCallButton();
    haptic(18);
    window.setTimeout(async () => {
      await loadCalls();
      const recent = state.calls.find((call) => call.direction === "outbound" && call.counterpart === normalizedDialNumber() && !call.disposition);
      if (recent) { populateLeadSelects(); $("#call-event-id").value = recent.id; openDialog($("#call-outcome-dialog")); }
    }, 1200);
  }

  function toggleMute() {
    const call = state.voice.call; if (!call?.mute) return;
    state.voice.muted = !state.voice.muted;
    call.mute(state.voice.muted);
    $("#mute-call").setAttribute("aria-pressed", String(state.voice.muted));
    $("#mute-call").innerHTML = state.voice.muted ? '<i class="ph ph-microphone-slash"></i><span>Unmute</span>' : '<i class="ph ph-microphone"></i><span>Mute</span>';
  }

  function prepareCall(number) {
    $("#phone-input").value = number || "";
    updateCallButton();
    routeTo("voice");
    $("#phone-input").focus();
  }

  function exportFilteredCalls() {
    const rows = [["date", "contact", "company", "number", "direction", "owner", "status", "preflight_id", "caller_id", "voice_mode", "recording", "recipient_local_time", "duration_seconds", "outcome"], ...filteredCalls().map((call) => [call.created_at, `${call.first_name || ""} ${call.last_name || ""}`.trim(), call.company || "", call.counterpart, call.direction, call.display_name || "Unassigned", call.status, call.call_preflight_id || "", call.caller_id_used || "", call.call_mode || "", call.recording_mode || "", call.recipient_local_time || "", call.duration_seconds || 0, call.disposition || "untagged"])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); anchor.download = `bfo-calls-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(anchor.href);
  }

  function acceptIncomingCall() {
    const call = state.voice.incoming; if (!call) return;
    state.voice.call = call; state.voice.incoming = null; state.voice.startedAt = Date.now(); state.voice.muted = false;
    const number = call.parameters?.From || "Unknown number";
    $("#in-call").hidden = false; $("#in-call-number").textContent = formatPhone(number); $("#in-call-status").textContent = "Connected"; $("#call-button").hidden = true;
    call.accept(); startCallTimer(); $("#incoming-call-dialog").close(); routeTo("voice");
    call.on("disconnect", endCallUI); call.on("error", endCallUI);
  }

  async function saveCallingPolicy(event) {
    event.preventDefault();
    try {
      await api("/api/console/call-compliance", { method: "PATCH", body: JSON.stringify({
        callsEnabled: $("#calls-enabled").checked,
        aiVoiceEnabled: $("#ai-voice-enabled").checked,
        recordingEnabled: $("#recording-enabled").checked,
        defaultWindowStart: inputToMinutes($("#calling-window-start").value),
        defaultWindowEnd: inputToMinutes($("#calling-window-end").value),
        openingScript: $("#opening-script").value.trim(),
        recordingNoticeScript: $("#recording-notice").value.trim(),
        nationalDncReviewed: $("#national-dnc-reviewed").checked,
        aiVoiceCounselReviewed: $("#ai-counsel-reviewed").checked
      }) });
      $("#national-dnc-reviewed").checked = false;
      $("#ai-counsel-reviewed").checked = false;
      await loadCompliance();
      toast("success", "Calling policy saved");
    } catch (error) { toast("error", "Could not save calling policy", error.message); }
  }

  async function saveStatePolicy(event) {
    event.preventDefault();
    try {
      await api("/api/console/call-compliance", { method: "PATCH", body: JSON.stringify({
        stateCode: $("#state-policy-select").value,
        status: $("#state-policy-status").value,
        windowStart: inputToMinutes($("#state-window-start").value),
        windowEnd: inputToMinutes($("#state-window-end").value),
        notes: $("#state-policy-notes").value.trim()
      }) });
      await loadCompliance();
      toast("success", "State policy saved");
    } catch (error) { toast("error", "Could not save state policy", error.message); }
  }

  function registerEvents() {
    $("#login-form").addEventListener("submit", handleLogin);
    window.addEventListener("hashchange", () => routeTo(location.hash.slice(1), false));
    $$("[data-route]").forEach((item) => item.addEventListener("click", (event) => { event.preventDefault(); routeTo(item.dataset.route); }));
    $$("[data-route-jump]").forEach((item) => item.addEventListener("click", () => { item.closest("dialog")?.close(); routeTo(item.dataset.routeJump); }));
    $("#open-sidebar").addEventListener("click", openSidebar);
    $("#close-sidebar").addEventListener("click", closeSidebar);
    $("#sidebar-scrim").addEventListener("click", closeSidebar);
    $("#account-menu-button").addEventListener("click", () => { const menu = $("#account-menu"); menu.hidden = !menu.hidden; $("#account-menu-button").setAttribute("aria-expanded", String(!menu.hidden)); });
    $("#logout-button").addEventListener("click", () => signOut());
    $("#settings-signout").addEventListener("click", () => signOut());
    $("#refresh-data").addEventListener("click", () => { haptic(); refreshData(); });
    $("#refresh-performance").addEventListener("click", loadPerformance);
    $("#performance-window").addEventListener("change", loadPerformance);
    $("#refresh-team").addEventListener("click", loadTeam);
    $("#refresh-compliance").addEventListener("click", loadCompliance);
    $("#calling-policy-form").addEventListener("submit", saveCallingPolicy);
    $("#state-policy-form").addEventListener("submit", saveStatePolicy);
    $("#state-policy-select").addEventListener("change", syncStatePolicyForm);
    $("#new-team-user").addEventListener("click", () => openDialog($("#team-user-dialog")));
    $("#team-user-form").addEventListener("submit", handleCreateTeamUser);
    $$("[data-settings-route]").forEach((button) => button.addEventListener("click", () => routeTo(button.dataset.settingsRoute)));
    $("#open-composer").addEventListener("click", () => openComposer());
    $$('[data-open-composer]').forEach((button) => button.addEventListener("click", () => openComposer({ schedule: button.dataset.schedule === "true" })));
    $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
    $$("dialog").forEach((dialog) => dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); }));
    $("#composer-form").addEventListener("submit", handleComposerSubmit);
    $("#message-body").addEventListener("input", updateComposerCount);
    $("#schedule-toggle").addEventListener("change", (event) => { $("#schedule-fields").hidden = !event.target.checked; $("#send-message-button span").textContent = event.target.checked ? "Schedule message" : "Send message"; });
    $("#insert-template").addEventListener("click", () => { const template = state.templates[0]; if (!template) return toast("warning", "No templates available"); $("#message-body").value = template.body; updateComposerCount(); toast("success", `Inserted ${template.name}`); });
    $("#add-contact-button").addEventListener("click", () => openDialog($("#contact-dialog")));
    $("#contact-form").addEventListener("submit", handleAddContact);
    $("#add-lead-button").addEventListener("click", () => openDialog($("#lead-dialog")));
    $("#lead-form").addEventListener("submit", handleAddLead);
    $("#lead-search").addEventListener("input", renderLeads);
    $("#lead-owner-filter").addEventListener("change", renderLeads);
    $("#lead-priority-filter").addEventListener("change", renderLeads);
    $("#pipeline-board").addEventListener("change", async (event) => {
      if (!event.target.matches("[data-lead-stage]") || !event.target.value) return;
      await api(`/api/console/leads/${event.target.dataset.leadStage}`, { method: "PATCH", body: JSON.stringify({ stage: event.target.value }) });
      await loadLeads(); toast("success", "Lead stage updated");
    });
    $("#pipeline-board").addEventListener("click", (event) => {
      const call = event.target.closest("[data-lead-call]"); const message = event.target.closest("[data-lead-message]");
      if (call) { $("#phone-input").value = call.dataset.leadCall; routeTo("voice"); updateCallButton(); }
      if (message) openComposer({ to: message.dataset.leadMessage });
    });
    $("#add-task-button").addEventListener("click", () => { populateLeadSelects(); openDialog($("#task-dialog")); });
    $("#task-form").addEventListener("submit", handleAddTask);
    $("#task-strip").addEventListener("click", async (event) => { const button = event.target.closest("[data-complete-task]"); if (!button) return; await api("/api/console/tasks", { method: "PATCH", body: JSON.stringify({ id: button.dataset.completeTask, status: "done" }) }); await loadTasks(); });
    $("#refresh-calls").addEventListener("click", loadCalls);
    $("#call-history-body").addEventListener("click", async (event) => {
      const tag = event.target.closest("[data-tag-call]"); const callback = event.target.closest("[data-call-back]"); const copy = event.target.closest("[data-copy-number]"); const dnc = event.target.closest("[data-mark-dnc]");
      if (tag) { populateLeadSelects(); $("#call-event-id").value = tag.dataset.tagCall; openDialog($("#call-outcome-dialog")); }
      if (callback) prepareCall(callback.dataset.callBack);
      if (copy) { await navigator.clipboard.writeText(copy.dataset.copyNumber); toast("success", "Number copied"); }
      if (dnc) { try { await recordSuppression(dnc.dataset.markDnc, "Do-not-call request", "call_history"); toast("success", "Number added to the do-not-call list"); } catch (error) { toast("error", "Could not record do-not-call", error.message); } }
    });
    $("#call-outcome-form").addEventListener("submit", handleCallOutcome);
    $("#call-preflight-form").addEventListener("submit", handleCallPreflight);
    $("#call-preflight-form").addEventListener("input", () => {
      if (!state.voice.preflight) return;
      state.voice.preflight = null;
      state.voice.preflightPhone = "";
      $("#preflight-result").hidden = true;
      $("#preflight-submit span").textContent = "Review and call";
      $("#call-button span").textContent = "Review call";
    });
    $("#preflight-call-mode").addEventListener("change", togglePreflightConsentFields);
    $("#preflight-recording-mode").addEventListener("change", togglePreflightConsentFields);
    $("#receive-calls-toggle").addEventListener("change", (event) => api("/api/console/presence", { method: "POST", body: JSON.stringify({ available: event.target.checked }) }).then(() => toast("success", event.target.checked ? "Browser calls enabled" : "Browser calls paused")).catch((error) => toast("error", "Could not update availability", error.message)));
    $("#answer-call").addEventListener("click", acceptIncomingCall);
    $("#decline-call").addEventListener("click", () => { state.voice.incoming?.reject(); state.voice.incoming = null; $("#incoming-call-dialog").close(); });
    $("#new-template-button").addEventListener("click", () => openDialog($("#template-dialog")));
    $("#template-form").addEventListener("submit", handleAddTemplate);
    $("#add-suppression").addEventListener("click", addSuppression);
    $("#conversation-search").addEventListener("input", renderMessages);
    $("#conversation-prev").addEventListener("click", () => { state.conversationPage = Math.max(1, state.conversationPage - 1); renderMessages(); });
    $("#conversation-next").addEventListener("click", () => { state.conversationPage += 1; renderMessages(); });
    $("#conversation-filter-button").addEventListener("click", () => { const filters = $("#conversation-filters"); filters.hidden = !filters.hidden; $("#conversation-filter-button").setAttribute("aria-expanded", String(!filters.hidden)); });
    $$("[data-message-filter]").forEach((button) => button.addEventListener("click", () => { state.messageFilter = button.dataset.messageFilter; $$("[data-message-filter]").forEach((item) => item.classList.toggle("active", item === button)); renderMessages(); }));
    $("#contact-search").addEventListener("input", renderContacts);
    $("#contact-consent-filter").addEventListener("change", renderContacts);
    $("#contact-sort").addEventListener("change", renderContacts);
    $("#contact-prev").addEventListener("click", () => { state.contactPage = Math.max(1, state.contactPage - 1); renderContacts(); });
    $("#contact-next").addEventListener("click", () => { state.contactPage += 1; renderContacts(); });
    $("#template-search").addEventListener("input", renderTemplates);
    $("#template-category-filter").addEventListener("change", renderTemplates);
    $$("[data-schedule-filter]").forEach((button) => button.addEventListener("click", () => { state.scheduleFilter = button.dataset.scheduleFilter; $$("[data-schedule-filter]").forEach((item) => item.classList.toggle("active", item === button)); renderSchedules(); }));
    $("#import-contacts").addEventListener("click", () => toast("info", "CSV import ready", "Use columns: first_name, last_name, phone, company and consent."));
    $$('[data-save-settings]').forEach((button) => button.addEventListener("click", () => toast("success", "Settings saved")));
    $$('[data-copy]').forEach((button) => button.addEventListener("click", async () => { await navigator.clipboard.writeText(button.dataset.copy); toast("success", "Webhook URL copied"); }));
    $$('[data-action="export"]').forEach((button) => button.addEventListener("click", () => {
      const rows = [["date", "direction", "from", "to", "status", "body"], ...state.messages.map((message) => [message.sentAt, message.direction, message.from, message.to, message.status, message.body])];
      const csv = rows.map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      anchor.download = `bfo-outreach-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    }));
    $("#global-search-input").addEventListener("input", (event) => { if (event.target.value) { routeTo("conversations"); $("#conversation-search").value = event.target.value; renderMessages(); } });
    [$("#call-search"), $("#call-direction-filter"), $("#call-outcome-filter"), $("#call-owner-filter"), $("#call-date-filter")].forEach((control) => control.addEventListener(control.tagName === "INPUT" ? "input" : "change", renderCalls));
    $("#export-calls").addEventListener("click", exportFilteredCalls);
    $("#quick-call-list").addEventListener("click", async (event) => { const callback = event.target.closest("[data-call-back]"); const copy = event.target.closest("[data-copy-number]"); if (callback) prepareCall(callback.dataset.callBack); if (copy) { await navigator.clipboard.writeText(copy.dataset.copyNumber); toast("success", "Number copied"); } });
    $("#clear-recent-calls").addEventListener("click", () => { state.voice.hiddenRecents = true; renderQuickCalls(); });
    $("#redial-number").addEventListener("click", () => { const number = localStorage.getItem(LAST_DIALLED_KEY); if (!number) return toast("info", "No recent outbound call"); prepareCall(number); });
    $("#paste-number").addEventListener("click", async () => { try { prepareCall(await navigator.clipboard.readText()); } catch { toast("error", "Clipboard access unavailable"); } });
    $("#audio-input").addEventListener("change", async (event) => { localStorage.setItem(AUDIO_INPUT_KEY, event.target.value); await applyVoiceAudioDevices(); });
    $("#audio-output").addEventListener("change", async (event) => { localStorage.setItem(AUDIO_OUTPUT_KEY, event.target.value); await applyVoiceAudioDevices(); });
    $("#test-microphone").addEventListener("click", testMicrophone);
    $("#mute-call").addEventListener("click", toggleMute);
    navigator.mediaDevices?.addEventListener?.("devicechange", () => populateAudioDevices(false));
    window.addEventListener("online", updateNetworkStatus); window.addEventListener("offline", updateNetworkStatus); updateNetworkStatus();
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#global-search-input").focus(); }
      if (event.key === "Escape") { $$("dialog[open]").forEach((dialog) => dialog.close()); closeSidebar(); if (state.voice.call) state.voice.call.disconnect(); }
      if ($(".page[data-page='voice']").classList.contains("active") && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        if (/^[0-9*#]$/.test(event.key)) { if (state.voice.call?.sendDigits) state.voice.call.sendDigits(event.key); else $("#phone-input").value += event.key; updateCallButton(); }
        if (event.key === "Backspace") { $("#phone-input").value = $("#phone-input").value.slice(0, -1); updateCallButton(); }
        if (event.key === "Enter" && !$("#call-button").disabled) placeCall();
      }
    });
    $$("#keypad [data-digit]").forEach((button) => button.addEventListener("click", () => { const digit = button.dataset.digit; if (state.voice.call?.sendDigits) state.voice.call.sendDigits(digit); else $("#phone-input").value += digit; updateCallButton(); haptic(8); }));
    $("#phone-input").addEventListener("input", updateCallButton);
    $("#clear-number").addEventListener("click", () => { $("#phone-input").value = ""; updateCallButton(); });
    $("#backspace-number").addEventListener("click", () => { $("#phone-input").value = $("#phone-input").value.slice(0, -1); updateCallButton(); });
    $("#call-button").addEventListener("click", placeCall);
    $("#hangup-button").addEventListener("click", () => state.voice.call?.disconnect());
    window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); state.deferredInstall = event; $("#install-app").hidden = false; });
    $("#install-app").addEventListener("click", async () => { if (!state.deferredInstall) return; state.deferredInstall.prompt(); await state.deferredInstall.userChoice; state.deferredInstall = null; $("#install-app").hidden = true; });
  }

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    const scope = location.hostname === "console.betterfoundonline.com" ? "/" : "/console/";
    navigator.serviceWorker.register("/console/sw.js", { scope }).catch(() => {});
  }
  setupSettingsTabs();
  registerEvents();
  verifySession();
})();
