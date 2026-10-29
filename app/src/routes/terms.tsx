import { createFileRoute } from "@tanstack/react-router";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Website Terms | Better Found Online" },
      { name: "description", content: "Terms governing the Better Found Online website, enquiries, proposals, and service engagements." },
    ],
    links: [{ rel: "canonical", href: "https://betterfoundonline.com/terms" }],
  }),
});

function TermsPage() {
  return (
    <div className="site privacy-page legal-page">
      <PageTransition />
      <SiteHeader />
      <main id="main" className="privacy-content">
        <p className="eyebrow">Website terms</p>
        <h1>Clear terms.<br />Better work.</h1>
        <p className="privacy-lead">These terms govern use of this website and enquiries made through it. A signed proposal or service agreement governs the work we undertake for a client.</p>

        <section id="business-identity"><h2>Business identity</h2><div><p><strong>Better Found Online</strong> is a trading brand operated by <strong>Qboid Businesses</strong>, a sole proprietorship of Shreyash Nitin Kakade.</p><dl className="legal-facts"><div><dt>GSTIN</dt><dd>27HCOPK1131D1ZS</dd></div><div><dt>Udyam registration</dt><dd>UDYAM-MH-26-1231498</dd></div><div><dt>Enterprise classification</dt><dd>Micro enterprise — services</dd></div><div><dt>Registered address</dt><dd>20/4, Sandhayanagar, Someshwarwadi, Pashan, Pune, Maharashtra 411008, India</dd></div></dl><p>Contact: <a href="mailto:hello@betterfoundonline.com">hello@betterfoundonline.com</a>.</p></div></section>

        <section id="acceptance"><h2>Using this website</h2><div><p>By accessing this website, you agree to these terms. If you do not agree, do not use the website. You must use it lawfully and must not interfere with its operation, attempt unauthorised access, introduce harmful code, scrape it in a way that degrades service, impersonate another person, or use its content to mislead others.</p></div></section>

        <section id="information-not-offer"><h2>Information, not an offer</h2><div><p>Website content describes our general capabilities and approach. It is not professional, legal, financial, or technical advice and is not a binding offer. An enquiry, call, message, or proposal discussion does not create a client relationship. We are engaged only when the parties accept a written proposal or agreement that defines scope, fees, and responsibilities.</p></div></section>

        <section id="project-agreements"><h2>Project agreements</h2><div><p>A signed proposal, statement of work, order form, or service agreement may add to or replace parts of these terms for a specific engagement. If documents conflict, the project-specific signed terms control for that project. Changes to scope, assumptions, deliverables, or timing must be agreed in writing.</p></div></section>

        <section id="fees-taxes"><h2>Fees, taxes &amp; payment</h2><div><p>Prices, currencies, deposits, milestones, reimbursable costs, and payment dates are stated in the applicable proposal or invoice. Applicable taxes, including GST where required, are additional unless expressly included. Invoices are issued by Qboid Businesses trading as Better Found Online. Any late fee, suspension right, or collection cost applies only as agreed or permitted by law.</p></div></section>

        <section id="client-responsibilities"><h2>Client responsibilities</h2><div><p>Clients are responsible for timely access, accurate information, consolidated feedback, approvals, account permissions, and materials needed for the work. The client confirms it has the right to provide names, logos, copy, images, data, credentials, and other supplied materials. Delayed decisions, missing access, or changed requirements may affect delivery dates and fees.</p></div></section>

        <section id="intellectual-property"><h2>Intellectual property</h2><div><p>We retain ownership of our pre-existing methods, know-how, tools, systems, templates, code libraries, and reusable components. Third-party materials remain subject to their own licences. Ownership or licence rights in custom deliverables are set out in the project agreement and, unless that agreement says otherwise, transfer or become effective only after full payment. Website copy, visual design, marks, and original content may not be reproduced or adapted without permission except as allowed by law.</p></div></section>

        <section id="confidentiality-portfolio"><h2>Confidentiality &amp; portfolio</h2><div><p>Each party must protect confidential information received for a project and use it only for the agreed purpose, subject to lawful disclosure obligations. We may identify completed public work in our portfolio only where consistent with the project agreement, the public nature of the work, and confidentiality commitments. Clients may request a written portfolio restriction before publication.</p></div></section>

        <section id="third-party-services"><h2>Third-party services</h2><div><p>Projects and this website may depend on platforms such as hosting providers, domain registrars, Google, Meta, Twilio, payment services, content-management systems, plug-ins, fonts, stock assets, and software APIs. Those providers have separate terms, pricing, availability, and privacy practices. Unless expressly agreed, their fees and accounts are the client&apos;s responsibility. We are not responsible for provider outages, policy changes, account suspensions, or platform decisions outside our reasonable control.</p></div></section>

        <section id="results"><h2>No guaranteed results</h2><div><p>We aim to deliver work with reasonable skill and care, but outcomes depend on market conditions, competition, budgets, platforms, content, implementation, client decisions, and other factors outside our control. We do not guarantee search rankings, AI citations, advertising returns, leads, sales, revenue, social growth, uninterrupted availability, or approval by a third-party platform. Case studies and reported metrics describe specific circumstances and are not promises of future performance.</p></div></section>

        <section id="cancellation"><h2>Cancellation &amp; refunds</h2><div><p>The applicable project agreement controls cancellation, rescheduling, termination, and refunds. Unless that agreement says otherwise, fees for completed work, committed capacity, approved milestones, and non-cancellable third-party costs are payable. Custom work already accepted or delivered is not automatically refundable. Nothing in these terms limits non-waivable consumer or statutory rights.</p></div></section>

        <section id="availability"><h2>Website availability</h2><div><p>We may update, suspend, remove, or correct website content without notice. We try to keep information accurate and the website available, but do not warrant that every page will always be current, complete, uninterrupted, or error-free. Links to external sites are provided for convenience and do not imply control or endorsement.</p></div></section>

        <section id="liability"><h2>Responsibility &amp; liability</h2><div><p>To the fullest extent permitted by law, we are not liable for indirect, incidental, special, or consequential loss arising solely from use of this public website or reliance on its general content. Liability connected with paid services is governed by the signed project agreement. Nothing excludes liability that cannot lawfully be excluded, including liability for fraud, wilful misconduct, or other non-excludable obligations.</p></div></section>

        <section id="privacy"><h2>Privacy</h2><div><p>Our <TransitionLink href="/privacy">Privacy &amp; Cookie Notice</TransitionLink> explains how we handle personal information and how to change cookie choices. Do not send confidential information through the enquiry form unless it is reasonably necessary for us to assess the request.</p></div></section>

        <section id="governing-law"><h2>Governing law</h2><div><p>These website terms are governed by the laws of India. Courts with jurisdiction in Pune, Maharashtra will have jurisdiction over disputes concerning the website, unless a signed project agreement specifies otherwise or mandatory law gives you another right.</p></div></section>

        <section id="changes-contact"><h2>Changes &amp; contact</h2><div><p>We may revise these terms to reflect changes in the website, services, or law. The date below identifies the current version. Questions may be sent to <a href="mailto:hello@betterfoundonline.com">hello@betterfoundonline.com</a> or to our registered address above.</p><p className="privacy-updated">Effective and last updated: 21 October 2026</p></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
