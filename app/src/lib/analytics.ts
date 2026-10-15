export type ConsentPreferences = {
  version: 1;
  analytics: boolean;
  advertising: boolean;
  personalization: boolean;
  updatedAt: string;
};

type EventParameters = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const CONSENT_STORAGE_KEY = "bfo_consent_v1";
export const CONSENT_EVENT = "bfo:consent-changed";
export const OPEN_CONSENT_EVENT = "bfo:open-consent";

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const adsId = import.meta.env.VITE_GOOGLE_ADS_ID?.trim();
let initialized = false;

export function readConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null") as Partial<ConsentPreferences> | null;
    if (!value || value.version !== 1 || typeof value.analytics !== "boolean" || typeof value.advertising !== "boolean") return null;
    if (typeof value.personalization !== "boolean") value.personalization = value.advertising;
    return value as ConsentPreferences;
  } catch {
    return null;
  }
}

export function saveConsent(preferences: Pick<ConsentPreferences, "analytics" | "advertising" | "personalization">) {
  const value: ConsentPreferences = { version: 1, ...preferences, updatedAt: new Date().toISOString() };
  try {
    window.localStorage?.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Some hardened browsers disable storage. Consent still applies for the
    // current page without breaking the visitor's controls.
  }
  applyConsent(value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  return value;
}

function consentPayload(preferences: Pick<ConsentPreferences, "analytics" | "advertising" | "personalization"> | null) {
  return {
    analytics_storage: preferences?.analytics ? "granted" : "denied",
    ad_storage: preferences?.advertising ? "granted" : "denied",
    ad_user_data: preferences?.advertising ? "granted" : "denied",
    ad_personalization: preferences?.personalization ? "granted" : "denied",
  };
}

export function applyConsent(preferences: Pick<ConsentPreferences, "analytics" | "advertising" | "personalization">) {
  window.gtag?.("consent", "update", consentPayload(preferences));
  window.gtag?.("event", "consent_update", {
    analytics_consent: preferences.analytics ? "granted" : "denied",
    advertising_consent: preferences.advertising ? "granted" : "denied",
    personalization_consent: preferences.personalization ? "granted" : "denied",
  });
}

export function trackEvent(name: string, parameters: EventParameters = {}) {
  window.gtag?.("event", name, parameters);
}

function pageData() {
  return {
    page_title: document.title,
    page_location: `${window.location.origin}${window.location.pathname}`,
    page_path: window.location.pathname,
  };
}

export function trackPageView() {
  trackEvent("page_view", pageData());
}

export function initGoogleMeasurement() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? function gtag(...args: unknown[]) { window.dataLayer?.push(args); };

  const preferences = readConsent();
  window.gtag("consent", "default", {
    ...consentPayload(preferences),
    wait_for_update: 500,
    ads_data_redaction: true,
    url_passthrough: true,
  });
  window.gtag("set", "developer_id.dZGIzZG", true);

  const tagId = measurementId || adsId;
  if (tagId && !document.querySelector('script[data-bfo-google-tag="true"]')) {
    const script = document.createElement("script");
    script.async = true;
    script.dataset.bfoGoogleTag = "true";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`;
    document.head.appendChild(script);
  }

  if (measurementId) {
    window.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: true,
    });
  }
  if (adsId) {
    window.gtag("config", adsId, {
      send_page_view: false,
    });
  }
}

function safeLabel(element: HTMLElement) {
  const anchor = element instanceof HTMLAnchorElement ? element : element.closest<HTMLAnchorElement>("a");
  if (anchor?.protocol === "mailto:") return "email_link";
  if (anchor?.protocol === "tel:") return "phone_link";
  if (anchor && /wa\.me|whatsapp\.com/i.test(anchor.hostname)) return "whatsapp_link";
  return (element.dataset.analyticsLabel || element.getAttribute("aria-label") || element.textContent || element.tagName)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function safeLinkPath(anchor: HTMLAnchorElement) {
  if (!anchor.href || anchor.protocol === "mailto:" || anchor.protocol === "tel:") return undefined;
  try {
    const url = new URL(anchor.href, window.location.href);
    return url.origin === window.location.origin ? url.pathname : url.hostname;
  } catch {
    return undefined;
  }
}

function elementContext(element: HTMLElement) {
  const section = element.closest<HTMLElement>("section[id], main[id], footer[id], nav[id]");
  if (section?.id) return section.id;
  return element.closest("header") ? "header" : "page";
}

export function installInteractionTracking() {
  initGoogleMeasurement();
  let currentPath = window.location.pathname;
  let scrollMilestones = new Set<number>();
  let startedForms = new WeakSet<HTMLFormElement>();
  const viewedSections = new Set<string>();
  const videoProgress = new WeakMap<HTMLVideoElement, Set<number>>();

  const sendPageView = () => {
    const nextPath = window.location.pathname;
    if (nextPath !== currentPath) {
      currentPath = nextPath;
      scrollMilestones = new Set();
    }
    window.setTimeout(trackPageView, 0);
  };

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    window.dispatchEvent(new Event("bfo:navigation"));
  };
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    window.dispatchEvent(new Event("bfo:navigation"));
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>("a,button") : null;
    if (!target) return;
    const anchor = target instanceof HTMLAnchorElement ? target : target.closest<HTMLAnchorElement>("a");
    const label = safeLabel(target);
    const params: EventParameters = {
      link_text: label,
      placement: elementContext(target),
      destination: anchor ? safeLinkPath(anchor) : undefined,
    };

    trackEvent("ui_click", { ...params, element_type: target.tagName.toLowerCase() });
    if (target.matches("[data-cta], .primary-btn, .whatsapp-link, .contact-title") || /discuss|contact|inquiry|get started|talk|project|campaign/i.test(label)) {
      trackEvent("cta_click", params);
    }
    if (!anchor) return;
    if (anchor.protocol === "mailto:") trackEvent("email_click", { placement: params.placement });
    else if (anchor.protocol === "tel:") trackEvent("phone_click", { placement: params.placement });
    else if (/wa\.me|whatsapp\.com/i.test(anchor.hostname)) trackEvent("whatsapp_click", params);
    else if (/linkedin|instagram|facebook|behance/i.test(anchor.hostname)) trackEvent("social_click", { ...params, social_network: anchor.hostname });
    else if (anchor.origin !== window.location.origin) trackEvent("outbound_click", params);
    if (/\.(pdf|docx?|xlsx?|zip|csv)(?:$|\?)/i.test(anchor.href)) trackEvent("file_download", params);
  };

  const onInput = (event: Event) => {
    const form = event.target instanceof Element ? event.target.closest("form") : null;
    if (!form || startedForms.has(form)) return;
    startedForms.add(form);
    trackEvent("form_start", { form_id: form.id || form.className || "form", page_path: window.location.pathname });
  };

  const onSubmit = (event: SubmitEvent) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    if (!form) return;
    trackEvent("generate_lead", { form_id: form.id || form.className || "form", method: "website_form" });
    trackEvent("form_submit", { form_id: form.id || form.className || "form", page_path: window.location.pathname });
  };

  let scrollFrame = 0;
  const onScroll = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      const total = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const percentage = Math.min(100, Math.round((window.scrollY / total) * 100));
      [25, 50, 75, 90, 100].forEach((milestone) => {
        if (percentage >= milestone && !scrollMilestones.has(milestone)) {
          scrollMilestones.add(milestone);
          trackEvent("scroll_depth", { percent_scrolled: milestone, page_path: window.location.pathname });
        }
      });
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
      const section = entry.target as HTMLElement;
      const id = section.id || section.dataset.analyticsSection;
      if (!id || viewedSections.has(`${currentPath}:${id}`)) return;
      viewedSections.add(`${currentPath}:${id}`);
      const heading = section.querySelector("h1,h2,h3")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 80);
      trackEvent("section_view", { section_id: id, section_title: heading, page_path: currentPath });
    });
  }, { threshold: [0.5] });
  const observeSections = (root: ParentNode = document) => {
    root.querySelectorAll<HTMLElement>("section[id], [data-analytics-section]").forEach((section) => sectionObserver.observe(section));
  };
  observeSections();
  const sectionMutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.matches("section[id], [data-analytics-section]")) sectionObserver.observe(node);
      observeSections(node);
    }));
  });
  sectionMutationObserver.observe(document.body, { childList: true, subtree: true });

  const onVideoPlay = (event: Event) => {
    const video = event.target instanceof HTMLVideoElement ? event.target : null;
    if (!video) return;
    const title = video.getAttribute("aria-label") || video.closest<HTMLElement>("section[id]")?.id || "site_video";
    trackEvent("video_start", { video_title: title.slice(0, 80), page_path: currentPath });
  };
  const onVideoTime = (event: Event) => {
    const video = event.target instanceof HTMLVideoElement ? event.target : null;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const seen = videoProgress.get(video) ?? new Set<number>();
    videoProgress.set(video, seen);
    const percentage = (video.currentTime / video.duration) * 100;
    [25, 50, 75].forEach((milestone) => {
      if (percentage >= milestone && !seen.has(milestone)) {
        seen.add(milestone);
        trackEvent("video_progress", { video_percent: milestone, page_path: currentPath });
      }
    });
  };
  const onVideoEnd = () => trackEvent("video_complete", { page_path: currentPath });

  document.addEventListener("click", onClick, true);
  document.addEventListener("input", onInput, true);
  document.addEventListener("submit", onSubmit, true);
  document.addEventListener("play", onVideoPlay, true);
  document.addEventListener("timeupdate", onVideoTime, true);
  document.addEventListener("ended", onVideoEnd, true);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("popstate", sendPageView);
  window.addEventListener("bfo:navigation", sendPageView);

  const engagementTimers = [10, 30, 60].map((seconds) => window.setTimeout(() => {
    trackEvent("engaged_view", { engagement_seconds: seconds, page_path: window.location.pathname });
  }, seconds * 1000));
  trackPageView();

  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("input", onInput, true);
    document.removeEventListener("submit", onSubmit, true);
    document.removeEventListener("play", onVideoPlay, true);
    document.removeEventListener("timeupdate", onVideoTime, true);
    document.removeEventListener("ended", onVideoEnd, true);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("popstate", sendPageView);
    window.removeEventListener("bfo:navigation", sendPageView);
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    engagementTimers.forEach(window.clearTimeout);
    sectionObserver.disconnect();
    sectionMutationObserver.disconnect();
  };
}

