import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Broadcast, ChartLineUp, CursorClick, MagnifyingGlass, Strategy } from "@phosphor-icons/react";
import { InformationScrollStory } from "@/components/information-scroll-story";
import { PerformanceProofCards, type PerformanceProofCard } from "@/components/performance-proof-cards";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";

const pageTitle = "Performance Marketing & Paid Ads | Better Found Online";
const pageDescription = "Performance marketing services covering Google Ads, paid social, marketplace advertising, tracking, and campaign optimization. Explore selected results.";
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

const campaignEvidence: PerformanceProofCard[] = [
  {
    category: "Industrial manufacturing / Google Ads",
    headline: "Bringing overlooked product lines into the search conversation.",
    challenge: "An established industrial manufacturer was recognized for a limited part of its product range. Other business units needed a stronger presence where potential buyers were actively searching.",
    approach: "Google Search campaigns were organized around the less-visible product categories and relevant buyer intent. The initial media plan was expanded as the campaign developed, with Meta advertising subsequently introduced as an additional channel.",
    evidenceLabel: "Google Ads campaign report",
    evidenceNote: "90-day platform report. Conversion actions are tracked, not verified sales or qualified leads.",
    resultGroups: [{
      title: "The reported results",
      headline: "₹203K spent. 266 tracked conversions. 90 days.",
      period: "90-day reporting period",
      metrics: [
        { label: "Google Ads spend", value: "₹203K" },
        { label: "Impressions", value: "25.3K" },
        { label: "Clicks", value: "4.30K" },
        { label: "Average CPC", value: "₹47.21" },
        { label: "Tracked conversions", value: "266" },
        { label: "Cost / tracked conversion", value: "₹763.38" },
        { label: "Reporting period", value: "90 days" },
      ],
      explanation: "The campaign recorded meaningful search activity and tracked conversion actions around previously underrepresented product categories.",
      evidence: {
        src: "/assets/performance-evidence/industrial-search-report.png",
        alt: "Anonymized Google Ads dashboard showing a 90-day industrial search campaign summary",
        platform: "Google Ads",
        period: "15 Jul-12 Oct 2026",
        width: 2048,
        height: 620,
        caption: "Industrial B2B Google Ads report, 90 days. ₹203K spend, 4.30K clicks, and 266 platform-tracked conversions.",
      },
    }],
    whyItMatters: "When a business offers more than its customers know about, targeted search campaigns can give underrepresented services or product categories a clearer route to relevant demand.",
    cta: "Discuss a B2B Search Campaign",
  },
  {
    category: "Consumer technology / Search + Ecommerce",
    headline: "Connect the channels. Understand the returns.",
    challenge: "A consumer technology brand wanted to improve advertising performance while gradually expanding its investment across search and ecommerce channels. Measurement issues needed attention before the team could rely on the reported results.",
    approach: "The work began with reviewing and correcting website tracking. Paid search activity across Google and Microsoft Advertising was complemented by marketplace campaigns and broader awareness activity.",
    evidenceLabel: "Google Ads + Amazon Ads reporting",
    evidenceNote: "Google and Amazon use separate reporting periods. Their figures are never combined into one return calculation.",
    resultGroups: [
      {
        title: "Google Ads performance",
        headline: "₹11.86 million in platform-recorded conversion value.",
        period: "90-day reporting period",
        metrics: [
          { label: "Advertising spend", value: "₹2.75 million" },
          { label: "Impressions", value: "839K" },
          { label: "Tracked conversions", value: "5.84K" },
          { label: "Conversion value", value: "₹11.86 million" },
          { label: "Average CPC", value: "₹7.92" },
          { label: "Cost / tracked conversion", value: "≈ ₹471.28" },
          { label: "Value / cost ratio", value: "4.31x" },
        ],
        explanation: "The report recorded conversion activity and associated value alongside campaign spending, giving the team a clearer basis for evaluating paid search.",
        evidence: {
          src: "/assets/performance-evidence/consumer-search-report.png",
          alt: "Google Ads campaign dashboard with the account identity permanently redacted",
          platform: "Google Ads",
          period: "15 Jul-12 Oct 2026",
          width: 2048,
          height: 1150,
          caption: "Google Ads report, 90 days. ₹2.75 million spend and ₹11.86 million in platform-recorded conversion value.",
        },
      },
      {
        title: "Amazon Ads performance",
        headline: "9.80x reported ROAS across 43.6K attributed purchases.",
        period: "13 October 2025 to 13 October 2026",
        metrics: [
          { label: "Advertising spend", value: "₹5.55 million" },
          { label: "Clicks", value: "366K" },
          { label: "Average CPC", value: "₹15.14" },
          { label: "Attributed purchases", value: "43.6K" },
          { label: "Reported sales", value: "₹54.34 million" },
          { label: "ACOS", value: "10.21%" },
          { label: "ROAS", value: "9.80x" },
        ],
        explanation: "The marketplace report shows substantial attributed purchase activity relative to advertising spend. ROAS compares attributed sales with media spend; it is not the same as profit or ROI.",
        evidence: {
          src: "/assets/performance-evidence/consumer-marketplace-report.png",
          alt: "Anonymized Amazon Ads dashboard showing marketplace campaign reporting",
          platform: "Amazon Ads",
          period: "13 Oct 2025-13 Oct 2026",
          width: 2048,
          height: 973,
          caption: "Amazon Ads report, October 2025 to October 2026. 43.6K attributed purchases and 9.80x ROAS.",
        },
      },
    ],
    whyItMatters: "More channels mean more decisions. Addressing tracking first makes it easier to understand each channel's contribution and keep campaign decisions connected to the commercial objective.",
    cta: "Build a More Accountable Media Plan",
  },
];

const campaignSystem = [
  { label: "Paid search", outcome: "Capture demand", icon: MagnifyingGlass },
  { label: "Paid social", outcome: "Build interest", icon: Broadcast },
  { label: "Creative and landing pages", outcome: "Turn attention into action", icon: CursorClick },
  { label: "Tracking and attribution", outcome: "See what happened", icon: ChartLineUp },
  { label: "Media planning", outcome: "Choose the next move", icon: Strategy },
];

const process = [
  { number: "01", label: "Define", title: "Know what success should mean.", body: "Understand the audience, offer, available budget, and commercial action worth pursuing." },
  { number: "02", label: "Measure", title: "Get the tracking foundations right.", body: "Review existing data, conversion actions, campaign structure, and the website experience." },
  { number: "03", label: "Launch", title: "Put the plan into motion.", body: "Activate agreed campaigns, audience targeting, creative, and supporting landing pages." },
  { number: "04", label: "Refine", title: "Make the next decision count.", body: "Review performance, identify friction, and adjust campaigns based on the available evidence." },
];

const related = [
  { number: "01", label: "Website Design & Landing Pages", note: "Give visitors a clearer destination after they click.", cta: "Explore Website Services", href: "/services/websites" },
  { number: "02", label: "Creative Production", note: "Support campaigns with videos, motion graphics, and digital creative assets.", cta: "Explore Creative Services", href: "/creative-production" },
  { number: "03", label: "SEO & Content Strategy", note: "Build a more useful search presence alongside paid acquisition.", cta: "Explore SEO Services", href: "/services/seo-ai-search" },
  { number: "04", label: "CRM & Integrations", note: "Help captured inquiries reach the tools and people responsible for the next step.", cta: "Explore Integrations", href: "/services#connect" },
];

const faqs = [
  { question: "What is performance marketing?", answer: "Performance marketing uses paid channels, tracking, and ongoing campaign improvements to pursue measurable actions such as inquiries, purchases, or other defined conversions. The exact metrics depend on the business and its goals." },
  { question: "Which advertising platforms can you help with?", answer: "Our available experience includes Google Ads, Microsoft Advertising, Meta, and marketplace advertising. The right platform and service scope are confirmed around each project." },
  { question: "How much should I spend on paid advertising?", answer: "There is no single budget that fits every business. The starting point depends on the market, audience, competition, goals, and the information available from existing campaigns." },
  { question: "What is the difference between ROAS and ROI?", answer: "ROAS compares attributed advertising sales with media spend. ROI requires a broader view of costs and returns, which may include product costs, fees, margins, and other expenses." },
  { question: "Can you help improve an existing campaign?", answer: "Existing campaign data, tracking, account structure, and landing pages can be reviewed to identify potential improvements. The scope of the review is agreed before work begins." },
  { question: "Do you guarantee a certain number of leads or a specific ROAS?", answer: "Campaign results depend on many factors, including the offer, market, competition, budget, and customer journey. We focus on setting useful objectives, establishing appropriate measurement, and making evidence-informed improvements." },
  { question: "How will I know what the campaigns are achieving?", answer: "The reporting approach should be agreed around the business goal. That may include campaign spend, tracked conversions, conversion cost, attributed value, and the limitations of the available data." },
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
      <SiteHeader />
      <main id="main">
        <section className="service-detail-hero" aria-labelledby="performance-title">
          <div className="service-detail-hero-copy">
            <p className="eyebrow">Performance Marketing</p>
            <h1 id="performance-title">Turn ad spend into measurable growth.</h1>
            <p>Paid search, social advertising, marketplace campaigns, tracking, and optimization for businesses that need to reach relevant audiences and connect ad spend to meaningful actions.</p>
            <div className="service-detail-actions">
              <TransitionLink className="primary-btn" href="/#contact">Discuss Your Growth Goals <ArrowUpRight size={17} weight="light" /></TransitionLink>
              <a className="story-link" href="#results">See Campaign Results <ArrowDown size={16} weight="light" /></a>
            </div>
          </div>
          <figure className="service-detail-hero-media"><img src="/assets/world/poster.webp" alt="Abstract metallic composition representing connected campaign planning" width="1200" height="1200" /></figure>
        </section>

        <section className="performance-results-strip section-pad" aria-labelledby="headline-results-title">
          <header>
            <p className="eyebrow">Selected campaign results</p>
            <h2 id="headline-results-title">Real campaigns. Measurable actions.</h2>
            <p>A look at what paid advertising can accomplish when campaign planning, measurement, and execution work together.</p>
          </header>
          <div className="performance-results-stage">
            <article className="performance-results-feature">
              <div className="performance-results-feature-orbit" aria-hidden="true"><i /><i /><i /><b /></div>
              <div className="performance-results-feature-brand"><img src="/assets/platforms/amazon-ads-logo.webp" alt="Amazon Ads" width="4730" height="1220" /><span>Marketplace campaign / 12 months</span></div>
              <strong>9.80x</strong>
              <h3>Reported return on ad spend</h3>
              <p>₹54.34 million in platform-reported sales from an anonymized consumer software marketplace campaign.</p>
            </article>
            <div className="performance-results-support">
              <article><span>01 / Marketplace</span><strong>43.6K</strong><h3>Attributed purchases</h3><p>13 Oct 2025-13 Oct 2026</p></article>
              <article className="performance-results-google"><span>02 / B2B search</span><img src="/assets/platforms/google-ads-logo.webp" alt="Google Ads" width="512" height="256" /><strong>266</strong><h3>Tracked conversions</h3><p>Industrial equipment campaign / 90 days</p></article>
              <article><span>03 / B2B search</span><strong>₹47.21</strong><h3>Average cost per click</h3><p>4.30K clicks / 25.3K impressions</p></article>
            </div>
          </div>
          <div className="performance-results-footer">
            <a href="#results">Explore the Results <ArrowDown size={16} weight="light" /></a>
            <small>Figures reflect anonymized platform reports from selected specialist-led campaigns. Google Ads and Amazon Ads results cover different reporting periods. Platform attribution does not establish incremental sales or net profit.</small>
          </div>
        </section>

        <PerformanceProofCards
          items={campaignEvidence}
          disclosure="Selected campaign examples from specialists supporting Better Found Online. Figures are shown in Indian rupees (INR), the original reporting currency. Platform-reported metrics reflect the stated reporting periods and are not guarantees of future performance."
        />

        <InformationScrollStory
          id="approach"
          foregroundImage="/assets/world/poster.webp"
          foregroundAlt="Abstract metallic form representing performance marketing strategy"
          foregroundHeading="Better decisions before bigger budgets."
          leftTitle="Before the first click"
          leftBody="Understand the offer, the audience, and the action worth measuring. Those questions come before channel selection, media planning, and creative."
          rightTitle="Campaigns with a job to do"
          rightBody="Match the message, channel, and destination to the customer's intent. Use the evidence to decide what to adjust, maintain, or expand."
          outroImages={[
            { src: "/assets/macro.webp", alt: "Abstract metallic detail representing careful campaign measurement" },
            { src: "/assets/connect.webp", alt: "Connected metallic forms representing coordinated media and creative" },
          ]}
          outroHeading="Spend with a plan."
          outroBody="Because a bigger budget is only useful when the campaign has a clear job to do."
          outroCtaLabel="Discuss Your Campaign Strategy"
          outroCtaHref="/#contact"
        />

        <section className="performance-capabilities section-pad" aria-labelledby="capabilities-title">
          <header className="performance-system-heading">
            <h2 id="capabilities-title">Reach. Convert. Learn.</h2>
            <p>Five connected decisions. One campaign system.</p>
          </header>
          <div className="performance-system-grid">
            {campaignSystem.map((item) => {
              const Icon = item.icon;
              return <article key={item.label}>
                <Icon aria-hidden="true" size={34} weight="light" />
                <div><h3>{item.label}</h3><p>{item.outcome}</p></div>
              </article>;
            })}
          </div>
          <div className="performance-system-footer">
            <p>From the first impression to the next decision.</p>
            <TransitionLink className="performance-inline-cta" href="/#contact">Discuss Your Paid Marketing <ArrowUpRight size={17} weight="light" /></TransitionLink>
          </div>
        </section>

        <section className="performance-process section-pad" aria-labelledby="process-title">
          <div className="performance-section-heading">
            <p className="eyebrow">The process</p>
            <div>
              <h2 id="process-title">From business goals to better campaign decisions.</h2>
              <p className="performance-section-intro">A practical process keeps the work focused on what matters.</p>
            </div>
          </div>
          <ol>
            {process.map((item) => (
              <li key={item.number}><span>{item.number} / {item.label}</span><h3>{item.title}</h3><p>{item.body}</p></li>
            ))}
          </ol>
          <TransitionLink className="performance-inline-cta" href="/#contact">Talk Through Your Goals <ArrowUpRight size={17} weight="light" /></TransitionLink>
        </section>

        <section className="performance-approach-feature section-pad" aria-labelledby="real-estate-title">
          <div>
            <p className="eyebrow">Another campaign approach</p>
            <span>Residential real estate / Google + Meta</span>
            <div className="performance-approach-signal" aria-hidden="true">
              <i><b>Intent</b></i><i><b>Discovery</b></i><i><b>Inquiry</b></i>
            </div>
          </div>
          <article>
            <h2 id="real-estate-title">Reaching buyers who are ready to explore.</h2>
            <div><h3>The challenge</h3><p>A premium residential development needed to generate marketing-qualified inquiries while maintaining control over acquisition costs.</p></div>
            <div><h3>The approach</h3><p>Google Search was used to reach people expressing relevant purchase intent, with Meta advertising supporting broader audience discovery and consideration.</p></div>
            <div><h3>Why this approach matters</h3><p>High-consideration purchases often involve multiple interactions. Search and social advertising can play different roles in the decision journey.</p></div>
            <small>Campaign approach only. No verified results or acquisition-cost figures have been supplied for this example.</small>
          </article>
        </section>

        <section className="service-detail-related performance-related section-pad" aria-labelledby="related-title">
          <div className="performance-related-heading">
            <p className="eyebrow">Beyond the campaign</p>
            <h2 id="related-title">Better campaigns need better supporting experiences.</h2>
            <p>Paid advertising works alongside the pages, creative, content, and systems that support the customer journey.</p>
          </div>
          <nav aria-label="Related performance marketing services">
            {related.map((item) => (
              <TransitionLink href={item.href} key={item.label}>
                <span>{item.number}</span>
                <span><strong>{item.label}</strong><small>{item.note}</small></span>
                <span className="performance-related-cta">{item.cta} <ArrowUpRight size={15} weight="light" /></span>
              </TransitionLink>
            ))}
          </nav>
        </section>

        <section className="faq-section section-pad" aria-labelledby="faq-title">
          <header><p className="eyebrow">Frequently asked questions</p><h2 id="faq-title">What buyers usually need to know.</h2></header>
          <div>{faqs.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
        </section>

        <section className="performance-closing performance-closing--connected section-pad" aria-labelledby="closing-title">
          <p className="eyebrow">Make the next budget decision count</p>
          <div className="performance-closing-message">
            <h2 id="closing-title">Know what you&apos;re spending.<br />Know what you&apos;re working toward.</h2>
            <p>Have a campaign to improve or a new growth goal in mind? Tell us what you sell, who you want to reach, and what&apos;s happening with your advertising today. We&apos;ll start with the problem worth solving.</p>
            <div className="performance-closing-actions">
              <TransitionLink href="/#contact">Discuss Your Paid Marketing <ArrowUpRight size={24} weight="light" /></TransitionLink>
            </div>
            <small className="performance-brand-signoff">Get found. Get chosen.</small>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
