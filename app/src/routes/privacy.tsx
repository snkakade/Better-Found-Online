import { createFileRoute } from "@tanstack/react-router";
import { PageTransition, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { CookieSettingsButton } from "@/components/analytics-consent";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy & Cookie Notice | Better Found Online" },
      { name: "description", content: "How Better Found Online uses contact information, analytics, advertising cookies, and privacy choices." },
    ],
    links: [{ rel: "canonical", href: "https://betterfoundonline.com/privacy" }],
  }),
});

function PrivacyPage() {
  return (
    <div className="privacy-page">
      <PageTransition />
      <SiteHeader frostFromSelector=".privacy-content" />
      <main id="main" className="privacy-content">
        <p className="eyebrow">Privacy &amp; cookies</p>
        <h1>Clear choices.<br />Useful measurement.</h1>
        <p className="privacy-lead">This notice explains what information Better Found Online and its measurement partners process when you use this website.</p>

        <section id="information-we-process"><h2>Information we process</h2><p>With your permission, Google Analytics measures visits, pages viewed, approximate location, browser and device information, referring sources, clicks, scroll milestones, viewed sections, engagement time, downloads, form starts and submissions, and video progress. Google Ads may use advertising cookies and similar identifiers for campaign attribution and personalized remarketing.</p></section>
        <section id="what-we-do-not-send"><h2>What we do not send to Analytics</h2><p>We do not send the name, email address, phone number, company, project description, or other text you type into our forms to Google Analytics or Google Ads. Event labels are limited to interface labels and safe page paths; URL query strings are excluded.</p></section>
        <section id="contact-forms"><h2>Contact details and marketing</h2><p>Names, email addresses, and phone numbers are collected only when you choose to provide them in the project form or contact us directly. The optional marketing checkbox records whether you agree to receive relevant follow-up by email or text. These details are not placed in Analytics cookies or sent to Google Analytics. When you submit the project form, your browser prepares a WhatsApp message for you to review before sending.</p></section>
        <section id="cookies"><h2>Cookies and consent</h2><p>Essential storage remembers your privacy choice. Analytics, advertising measurement, and personalized marketing storage remain denied until you allow them. You can change those choices at any time.</p><CookieSettingsButton /></section>
        <section id="retention-controls"><h2>Retention and controls</h2><p>Google controls the operation of its analytics and advertising services, including data retention and deletion tools available to account administrators. You can also use browser controls to remove stored site data or restrict cookies.</p></section>
        <section id="contact-privacy"><h2>Questions</h2><p>For questions about this notice or a privacy request, email <a href="mailto:hello@betterfoundonline.com">hello@betterfoundonline.com</a>.</p><p className="privacy-updated">Last updated: 15 October 2026</p></section>
      </main>
      <SiteFooter />
    </div>
  );
}

