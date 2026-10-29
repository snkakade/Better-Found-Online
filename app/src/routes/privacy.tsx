import { createFileRoute } from "@tanstack/react-router";
import { CookieSettingsButton } from "@/components/analytics-consent";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy & Cookie Notice | Better Found Online" },
      { name: "description", content: "How Better Found Online collects, uses, shares, retains, and protects personal information and how to exercise privacy choices." },
    ],
    links: [{ rel: "canonical", href: "https://betterfoundonline.com/privacy" }],
  }),
});

function PrivacyPage() {
  return (
    <div className="site privacy-page legal-page">
      <PageTransition />
      <SiteHeader />
      <main id="main" className="privacy-content">
        <p className="eyebrow">Privacy &amp; cookies</p>
        <h1>Privacy,<br />explained.</h1>
        <p className="privacy-lead">This notice explains how we collect, use, share, retain, and protect personal information when you visit this website, enquire about services, or work with us.</p>

        <section id="business-identity"><h2>Who is responsible</h2><div><p><strong>Better Found Online</strong> is a trading brand operated by <strong>Qboid Businesses</strong>, a sole proprietorship of Shreyash Nitin Kakade. Qboid Businesses is the data fiduciary or controller for the information described in this notice where those concepts apply.</p><dl className="legal-facts"><div><dt>GSTIN</dt><dd>27HCOPK1131D1ZS</dd></div><div><dt>Udyam registration</dt><dd>UDYAM-MH-26-1231498</dd></div><div><dt>Enterprise classification</dt><dd>Micro enterprise — services</dd></div><div><dt>Registered address</dt><dd>20/4, Sandhayanagar, Someshwarwadi, Pashan, Pune, Maharashtra 411008, India</dd></div></dl><p>Privacy and grievance contact: <a href="mailto:hello@betterfoundonline.com">hello@betterfoundonline.com</a>.</p></div></section>

        <section id="scope"><h2>Scope</h2><div><p>This notice covers betterfoundonline.com, enquiries submitted through it, business communications, and personal information handled while preparing or delivering our services. A client agreement may contain additional project-specific privacy terms. Third-party websites and platforms have their own notices.</p></div></section>

        <section id="information-we-collect"><h2>Information we collect</h2><div><ul><li><strong>Enquiry information:</strong> name, work email, phone number, company or website, service interest, project brief, and marketing choice.</li><li><strong>Communications:</strong> emails, call and message records, meeting notes, contact preferences, and agreed next steps.</li><li><strong>Client and transaction information:</strong> proposals, contracts, project contacts, approvals, billing and tax details, payment status, and delivery records.</li><li><strong>Technical and usage information:</strong> IP address, browser and device details, referring source, approximate region, pages viewed, interactions, and consent choices.</li><li><strong>Campaign information:</strong> attribution and advertising identifiers when you allow the relevant cookies.</li></ul><p>We receive this information from you, your browser or device, our service providers, referrals, and—where appropriate for business outreach—lawfully available professional or public sources.</p></div></section>

        <section id="how-we-use-information"><h2>Why we use it</h2><div><ul><li>To answer enquiries, assess fit, prepare proposals, and take steps you request before a contract.</li><li>To deliver, administer, support, secure, and improve contracted services.</li><li>To operate the website, prevent misuse, diagnose faults, and measure performance.</li><li>To maintain accounting, tax, compliance, consent, and business records.</li><li>To send relevant marketing only where permitted and to record opt-outs.</li></ul><p>Depending on where you are, we rely on your consent, steps taken at your request, performance of a contract, legal obligations, permitted legitimate uses, or legitimate interests that do not override your rights. You may withdraw consent at any time; withdrawal does not affect prior lawful processing.</p></div></section>

        <section id="analytics-cookies"><h2>Analytics &amp; cookies</h2><div><p>Essential local storage remembers your privacy choice. Google Analytics helps us understand page views and site interactions. Google Ads may measure campaign attribution and, only with the relevant permission, use advertising identifiers. Analytics, advertising, and personalization storage remain denied until you allow them.</p><p>We do not send names, email addresses, phone numbers, company names, project descriptions, form text, or URL query strings to Google Analytics or Google Ads. Event labels are limited to interface labels and safe page paths.</p><CookieSettingsButton /></div></section>

        <section id="forms-communications"><h2>Forms &amp; communications</h2><div><p>Submitting the project form prepares a WhatsApp message in your browser. Nothing is sent to us until you review and send that message. WhatsApp then processes the communication under its own terms and privacy notice.</p><p>If you communicate through our business telephone or messaging services, providers such as Twilio may process routing, delivery, call, and message data. Calls may be logged and tagged for follow-up and service quality; we will provide notice before recording call audio where recording is used or legally required.</p></div></section>

        <section id="sharing"><h2>Who receives information</h2><div><p>We share only what is reasonably necessary with hosting, security, analytics, advertising, communications, collaboration, payment, accounting, and professional-service providers; authorised contractors working under confidentiality obligations; and public authorities where legally required. Current categories include Cloudflare for delivery and security, Google for consented analytics and advertising, Meta/WhatsApp for messages you choose to send, and communications providers such as Twilio.</p><p>We do not sell the contents of project enquiries for money. Advertising identifiers may be used or disclosed for consented advertising measurement, which some laws may define broadly as a “sale” or “sharing.” You can reject advertising storage through <CookieSettingsButton /> or contact us.</p></div></section>

        <section id="international-transfers"><h2>International transfers</h2><div><p>We serve clients internationally and use providers that may process information outside your country. Where required, transfers are supported by contractual protections, adequacy mechanisms, consent, or another lawful safeguard. Provider locations and safeguards may change as their infrastructure changes.</p></div></section>

        <section id="retention"><h2>How long we keep it</h2><div><p>We retain information only for as long as reasonably needed for the purposes above, including active follow-up, project delivery, security, dispute management, and tax or accounting obligations. Retention depends on the type of record, the relationship, legal requirements, and whether a claim could arise. We delete or anonymise information when it is no longer required, subject to backups and records we must retain. Service providers apply their own documented retention controls.</p></div></section>

        <section id="marketing"><h2>Marketing choices</h2><div><p>The marketing checkbox on our form is optional. You may withdraw permission or opt out at any time by using an unsubscribe method in the message, replying with a recognised opt-out request where available, or emailing us. Service communications about an enquiry or active project are not marketing.</p></div></section>

        <section id="your-rights"><h2>Your rights</h2><div><p>Depending on your location and the law in force, you may have rights to access or obtain information about processing, correct or complete information, request erasure, withdraw consent, object to or restrict certain uses, receive portable data, nominate another person, and raise a grievance or complaint with a competent authority.</p><p>To make a request, email <a href="mailto:hello@betterfoundonline.com">hello@betterfoundonline.com</a>. Describe the request and the information involved. We may verify your identity and may decline or limit a request where the law permits. You can complain to the Data Protection Board of India when the relevant provisions apply, the UK Information Commissioner if UK law applies, or your local privacy regulator.</p></div></section>

        <section id="security-children"><h2>Security &amp; children</h2><div><p>We use proportionate technical and organisational safeguards intended to protect information, including access controls and reputable service providers. No online system is completely secure, so we cannot promise absolute security. This business website is not directed to children under 18, and we do not knowingly solicit their personal information.</p></div></section>

        <section id="automated-decisions"><h2>Automated decisions</h2><div><p>We do not use information collected through this website to make solely automated decisions that produce legal or similarly significant effects about you.</p></div></section>

        <section id="updates-contact"><h2>Updates &amp; contact</h2><div><p>We may update this notice when our services, providers, or legal duties change. Material changes will be identified here. Questions and privacy requests can be sent to <a href="mailto:hello@betterfoundonline.com">hello@betterfoundonline.com</a> or to our registered address above.</p><p>Our <TransitionLink href="/terms">Website Terms</TransitionLink> govern use of this website.</p><p className="privacy-updated">Effective and last updated: 21 October 2026</p></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
