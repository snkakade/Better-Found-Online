import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react";
import { InformationScrollStory } from "@/components/information-scroll-story";
import { PerformanceProofCards, type PerformanceProofCard } from "@/components/performance-proof-cards";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";

const pageTitle = "Performance Marketing & Paid Ads | Better Found Online";
const pageDescription = "Performance marketing built around clear goals, paid search, campaign tracking, practical reporting, and informed optimization. Discuss your advertising needs.";
const canonical = "https://betterfoundonline.com/services/performance-marketing";

export const Route = createFileRoute("/services_/performance-marketing")({
  component: PerformanceMarketingPage,
  head: () => ({
    meta: [
      { title: pageTitle },
      { name: "description", content: pageDescription },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: pageDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical },
      { property: "og:image", content: "https://betterfoundonline.com/assets/brand/og.jpg" },
    ],
    links: [{ rel: "canonical", href: canonical }],
  }),
});

const campaignCapabilities = [
  { number: "01", title: "Paid Search", copy: "Meet existing demand with search campaigns built around relevant queries, clear offers, and useful landing pages." },
  { number: "02", title: "Paid Social", copy: "Support discovery and consideration with messaging and creative built for the audience and placement." },
  { number: "03", title: "Tracking & Measurement", copy: "Check that your tracking captures meaningful actions before relying on the numbers." },
  { number: "04", title: "Media Planning & Optimization", copy: "Review channel mix, spend, audience response, and the next adjustment with a defined goal in mind." },
  { number: "05", title: "Creative & Landing Pages", copy: "Connect ads to the pages, visuals, and messages people actually see after the click." },
];

const process = [
  { number: "01", title: "Define", copy: "Agree on the audience, offer, business goal, and meaningful tracked action." },
  { number: "02", title: "Measure", copy: "Review tracking, landing pages, and reporting requirements." },
  { number: "03", title: "Launch", copy: "Build and activate the agreed campaigns and creative." },
  { number: "04", title: "Refine", copy: "Review the evidence and prioritize the next adjustment." },
];

const campaignEvidence: PerformanceProofCard[] = [
  {
    category: "Industrial manufacturing / B2B",
    headline: "Make more of the product line discoverable.",
    challenge: "An established manufacturer was well known for only part of its offer. The campaign needed to create demand for overlooked business units without losing high-intent search traffic.",
    approach: "Search-led planning for the underrepresented business units, followed by paid social to broaden the channel mix.",
    evidenceLabel: "Google Ads campaign report",
    evidenceNote: "The 90-day source report labels 266 configured conversions. It does not identify those actions as qualified leads, so we do not describe them as leads.",
    metrics: [
      { label: "Impressions", value: "25,311" },
      { label: "Clicks", value: "4,301" },
      { label: "Reported conversions", value: "266" },
      { label: "Reported spend", value: "₹203,060.06" },
      { label: "Average CPC", value: "₹47.21" },
    ],
    evidence: [{
      src: "/assets/performance-evidence/industrial-search-report.png",
      alt: "Anonymized Google Ads dashboard showing a 90-day industrial search campaign summary",
      platform: "Google Ads",
      period: "15 Jul–12 Oct 2026",
      width: 2048,
      height: 620,
      caption: "Account identity and contact details are permanently redacted. The dashboard retains the original platform labels and reporting period.",
    }],
  },
  {
    category: "Consumer technology / ecommerce",
    headline: "Make measurement reliable before scaling.",
    challenge: "A growing consumer technology program needed clearer website tracking and a coordinated channel mix in a competitive category.",
    approach: "Tracking improvements came first, followed by search across Google and Microsoft Advertising, marketplace advertising, and awareness activity.",
    evidenceLabel: "Google Ads + Amazon Ads reporting",
    evidenceNote: "The source dashboards use platform-defined conversions, conversion value, purchases, sales, ACOS, and ROAS. These are platform-reported figures, not independently audited revenue or profit.",
    metrics: [
      { label: "Google Ads impressions", value: "839,418" },
      { label: "Google Ads conversions", value: "5,836.63" },
      { label: "Google Ads cost", value: "₹2,750,711.36" },
      { label: "Amazon Ads purchases", value: "43,623" },
      { label: "Amazon Ads ROAS", value: "9.80" },
    ],
    evidence: [
      {
        src: "/assets/performance-evidence/consumer-search-report.png",
        alt: "Anonymized Google Ads dashboard showing a consumer technology campaign summary",
        platform: "Google Ads",
        period: "15 Jul–12 Oct 2026",
        width: 2048,
        height: 560,
        caption: "Platform-reported cost, conversions, conversion value, impressions, and average CPC for the stated 90-day period.",
      },
      {
        src: "/assets/performance-evidence/consumer-marketplace-report.png",
        alt: "Anonymized Amazon Ads dashboard showing marketplace campaign reporting",
        platform: "Amazon Ads",
        period: "13 Oct 2025–13 Oct 2026",
        width: 2048,
        height: 973,
        caption: "Client, campaign, and account identifiers are permanently redacted; platform totals and column labels remain visible.",
      },
    ],
  },
  {
    category: "Residential real estate",
    headline: "Focus on the inquiries that matter.",
    challenge: "A high-consideration residential campaign prioritized marketing-qualified inquiries at a controlled acquisition cost.",
    approach: "High-intent Google Search supported by paid social advertising to balance active demand with broader discovery.",
    evidenceLabel: "Campaign approach",
    evidenceNote: "No result screenshot or verified outcome was supplied for this example, so this is presented as an approach rather than a performance claim.",
  },
];

const related = [
  { label: "Website & Landing Pages", href: "/services#build" },
  { label: "SEO & Content", href: "/services#grow" },
  { label: "Creative Production", href: "/creative-production" },
  { label: "Video & Ad Creative", href: "/services/video-production-editing" },
  { label: "Social Media Management", href: "/services/social-media-management" },
  { label: "Analytics & Conversion Optimization", href: "/services#improve" },
];

const faqs = [
  { question: "What is performance marketing?", answer: "Performance marketing uses paid campaigns and measurable actions to evaluate advertising activity against business goals. It can include search advertising, paid social, conversion tracking, reporting, and ongoing optimization." },
  { question: "How do you decide which advertising channels to use?", answer: "Channel decisions start with the audience, the offer, the type of demand, the available budget, and the actions the business needs to measure." },
  { question: "Do you guarantee a return on ad spend?", answer: "No. Advertising results depend on the offer, competition, audience, budget, tracking quality, and market conditions. We focus on clear goals, reporting, and informed decisions." },
  { question: "Can you work with an existing ad account?", answer: "Existing accounts can be considered after reviewing access, campaign setup, measurement, and the project scope." },
  { question: "Can paid campaigns be connected to a website or landing page?", answer: "Yes. Campaign planning can be coordinated with website design, landing-page improvements, creative assets, and conversion tracking where relevant." },
];

function PerformanceMarketingSchema() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${canonical}#webpage`, name: pageTitle, description: pageDescription, url: canonical, isPartOf: { "@type": "WebSite", name: "Better Found Online", url: "https://betterfoundonline.com" } },
    { "@type": "Service", "@id": `${canonical}#service`, name: "Performance Marketing and Paid Advertising", serviceType: ["Performance marketing services", "Paid advertising management", "Paid search", "Campaign tracking and optimization"], description: pageDescription, url: canonical, provider: { "@id": "https://betterfoundonline.com/#organization" }, areaServed: ["US", "GB", "CA", "AU"] },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://betterfoundonline.com" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://betterfoundonline.com/services" },
      { "@type": "ListItem", position: 3, name: "Performance Marketing", item: canonical },
    ] },
  ] }) }} />;
}

function PerformanceMarketingPage() {
  return (
    <div className="site interior-site service-detail-page performance-marketing-page">
      <PageTransition />
      <PerformanceMarketingSchema />
      <a className="skip-link" href="#main">Skip to Content</a>
      <SiteHeader frostFromSelector=".scroll63-story" />
      <main id="main">
        <section className="service-detail-hero" aria-labelledby="performance-title">
          <div className="service-detail-hero-copy">
            <p className="eyebrow">Performance Marketing</p>
            <h1 id="performance-title">Performance marketing with a clearer purpose.</h1>
            <p>Put your budget behind a defined goal. Connect the right audience, useful creative, reliable tracking, and practical optimization so every campaign has a reason to run.</p>
            <div className="service-detail-actions">
              <TransitionLink className="primary-btn" href="/#contact">Discuss Paid Marketing <ArrowUpRight size={17} weight="light" /></TransitionLink>
              <a className="story-link" href="#approach">See Our Approach <ArrowDown size={16} weight="light" /></a>
            </div>
          </div>
          <figure className="service-detail-hero-media"><img src="/assets/world/poster.webp" alt="Abstract metallic composition representing connected campaign planning" width="1200" height="1200" /></figure>
        </section>

        <InformationScrollStory
          id="approach"
          foregroundImage="/assets/world/poster.webp"
          foregroundAlt="Abstract metallic form representing performance marketing strategy"
          foregroundHeading="Better decisions before bigger budgets."
          leftTitle="Before the first click"
          leftBody="What's the goal? Who needs to see the offer? What counts as a meaningful result? We answer those questions before building a media plan."
          rightTitle="Campaigns with a job to do"
          rightBody="Start with the audience, offer, business goal, and meaningful action. Then connect media, creative, landing pages, tracking, and reporting around that purpose."
          outroImages={[
            { src: "/assets/macro.webp", alt: "Abstract metallic detail representing careful campaign measurement" },
            { src: "/assets/connect.webp", alt: "Connected metallic forms representing coordinated media and creative" },
          ]}
          outroHeading="Spend with a plan."
          outroCtaLabel="Discuss Paid Marketing"
          outroCtaHref="/#contact"
          afterHeading="Campaigns with a job to do."
          afterBody="Paid media works best when the audience, offer, channel, destination, and measurement plan support the same business goal."
        />

        <section className="performance-capabilities section-pad" aria-labelledby="campaign-work-title">
          <div className="performance-section-heading"><p className="eyebrow">What we work on</p><h2 id="campaign-work-title">Campaigns with a job to do.</h2></div>
          <div className="performance-capability-grid">
            {campaignCapabilities.map((capability) => <article key={capability.title}><span>{capability.number}</span><h3>{capability.title}</h3><p>{capability.copy}</p></article>)}
          </div>
        </section>

        <section className="performance-evidence-standard section-pad" aria-labelledby="evidence-title">
          <div><p className="eyebrow">Evidence before claims</p><h2 id="evidence-title">Measure what the business can use.</h2></div>
          <div><p>A dashboard can show reported activity. It does not automatically prove qualified leads, verified revenue, profit, or incremental growth.</p><p>We define the meaningful action, check the tracking context, and explain what the available reporting does and does not show before making optimization decisions.</p></div>
        </section>

        <PerformanceProofCards
          items={campaignEvidence}
          disclosure="Anonymous campaign examples from prior specialist experience, shown at the website owner’s direction. Platform-reported metrics reflect the stated reporting periods, depend on each account’s tracking configuration, and are not guarantees of future performance."
        />

        <section className="performance-process section-pad" aria-labelledby="performance-process-title">
          <div className="performance-section-heading"><p className="eyebrow">Our process</p><h2 id="performance-process-title">Clarity in. Better decisions out.</h2></div>
          <ol>{process.map((step) => <li key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></li>)}</ol>
        </section>

        <section className="service-detail-related section-pad" aria-labelledby="related-title">
          <p className="eyebrow">Related services</p><h2 id="related-title">Better paid media needs more than ads.</h2>
          <nav aria-label="Related performance marketing services">{related.map((item) => <TransitionLink href={item.href} key={item.label}>{item.label}<ArrowUpRight size={18} weight="light" /></TransitionLink>)}</nav>
        </section>

        <section className="service-detail-faq section-pad" aria-labelledby="faq-title">
          <div><p className="eyebrow">Frequently asked questions</p><h2 id="faq-title">Before you spend.</h2></div>
          <div>{faqs.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
        </section>

        <section className="performance-closing section-pad">
          <p className="eyebrow">Start with the goal</p><h2>Spend with a plan.<br />Start with a conversation.</h2>
          <p>Tell us what you sell, who you want to reach, and what isn&apos;t working yet.</p>
          <TransitionLink href="/#contact">Discuss Paid Marketing <ArrowUpRight size={28} weight="light" /></TransitionLink>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
