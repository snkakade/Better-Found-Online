import { useEffect, useState } from "react";
import { installInteractionTracking, OPEN_CONSENT_EVENT, readConsent, saveConsent } from "@/lib/analytics";

export function AnalyticsController() {
  useEffect(() => installInteractionTracking(), []);
  return null;
}

export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [advertising, setAdvertising] = useState(true);
  const [personalization, setPersonalization] = useState(true);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      setAnalytics(existing.analytics);
      setAdvertising(existing.advertising);
      setPersonalization(existing.personalization);
    } else {
      setOpen(true);
    }
    const reopen = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setAdvertising(current?.advertising ?? false);
      setPersonalization(current?.personalization ?? false);
      setManage(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  const choose = (nextAnalytics: boolean, nextAdvertising: boolean, nextPersonalization: boolean) => {
    saveConsent({ analytics: nextAnalytics, advertising: nextAdvertising, personalization: nextPersonalization });
    setAnalytics(nextAnalytics);
    setAdvertising(nextAdvertising);
    setPersonalization(nextPersonalization);
    setOpen(false);
    setManage(false);
  };

  if (!open) return null;
  return (
    <section className="consent-panel" role="dialog" aria-modal="true" aria-labelledby="consent-title" aria-describedby="consent-description">
      <div className="consent-copy">
        <p className="consent-eyebrow">Cookie choices</p>
        <h2 id="consent-title">Cookies, on your terms.</h2>
        <p id="consent-description">Optional cookies help us measure the site and improve relevant advertising.</p>
        <a href="/privacy">See details</a>
      </div>
      {manage && (
        <div className="consent-options">
          <label><span><strong>Essential</strong><small>Security and your saved privacy choice.</small></span><input type="checkbox" checked disabled /></label>
          <label><span><strong>Analytics</strong><small>Page views, clicks, scroll depth, engagement and site performance.</small></span><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /></label>
          <label><span><strong>Advertising measurement</strong><small>Campaign attribution and ad performance.</small></span><input type="checkbox" checked={advertising} onChange={(event) => setAdvertising(event.target.checked)} /></label>
          <label><span><strong>Personalized marketing</strong><small>Build consented audiences for more relevant ads.</small></span><input type="checkbox" checked={personalization} onChange={(event) => setPersonalization(event.target.checked)} /></label>
        </div>
      )}
      <div className="consent-actions">
        {manage ? (
          <button className="consent-primary" onClick={() => choose(analytics, advertising, personalization)}>Save choices</button>
        ) : (
          <button className="consent-primary" onClick={() => choose(true, true, true)}>Accept cookies</button>
        )}
        {manage ? <button onClick={() => choose(false, false, false)}>Reject all</button> : <button onClick={() => setManage(true)}>Manage cookies</button>}
      </div>
    </section>
  );
}

export function CookieSettingsButton() {
  return <button className="cookie-settings" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>Cookie settings</button>;
}

