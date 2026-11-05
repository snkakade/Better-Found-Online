import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Broadcast, ChartLineUp, CursorClick, MagnifyingGlass, Strategy } from "@phosphor-icons/react";
import { InformationScrollStory } from "@/components/information-scroll-story";
import { AmbientVideo } from "@/components/ambient-video";
import { searchAdsMedia } from "@/search-ads-media";
import { PerformanceProofCards } from "@/components/performance-proof-cards";
import { AdPlatformMark, type AdPlatform } from "@/components/ad-platform-mark";
import { campaignEvidence } from "@/performance-evidence";
import { humanImages } from "@/editorial-images";
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


const campaignSystem: { label: string; outcome: string; icon: typeof MagnifyingGlass; platforms?: AdPlatform[] }[] = [
  { label: "Paid search", outcome: "Reach people searching for your offer.", icon: MagnifyingGlass, platforms: ["google", "microsoft"] },
  { label: "Paid social", outcome: "Show your offer to relevant audiences.", icon: Broadcast, platforms: ["meta", "linkedin"] },
  { label: "Creative and landing pages", outcome: "Match ads to a useful landing page.", icon: CursorClick },
  { label: "Tracking and attribution", outcome: "Track calls, forms and purchases.", icon: ChartLineUp },
  { label: "Media planning", outcome: "Agree channels, budget and priorities.", icon: Strategy },
];

const process = [
  { number: "01", label: "Define", title: "Agree the campaign goal.", body: "Understand the audience, offer, available budget, and commercial action worth pursuing." },
  { number: "02", label: "Measure", title: "Check calls, forms and sales tracking.", body: "Review existing data, conversion actions, campaign structure, and the website experience." },
  { number: "03", label: "Launch", title: "Launch the agreed campaigns.", body: "Activate agreed campaigns, audience targeting, creative, and supporting landing pages." },
  { number: "04", label: "Refine", title: "Review results and adjust.", body: "Review performance, identify friction, and adjust campaigns based on the available evidence." },
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
            <p>Google Ads, paid social and marketplace campaigns, with tracking for the calls, forms and sales that matter to your business.</p>
            <div className="service-detail-actions">
              <TransitionLink className="primary-btn" href="/#contact">Discuss Your Growth Goals <ArrowUpRight size={17} weight="light" /></TransitionLink>
              <a className="story-link" href="#results">See Campaign Results <ArrowDown size={16} weight="light" /></a>
            </div>
          </div>
          <figure className="service-detail-hero-media service-video-frame"><AmbientVideo {...searchAdsMedia.advertising} /></figure>
        </section>


        <PerformanceProofCards
          items={campaignEvidence}
          disclosure="Selected campaign examples from specialists supporting Better Found Online. Figures are shown in Indian rupees (INR), the original reporting currency. Platform-reported metrics reflect the stated reporting periods and are not guarantees of future performance."
        />

        <InformationScrollStory
          id="approach"
          foregroundImage={humanImages.campaignReview.src}
          foregroundAlt={humanImages.campaignReview.alt}
          foregroundHeading="Better decisions before bigger budgets."
          leftTitle="Set the goal and tracking"
          leftBody="Understand the offer, the audience, and the action worth measuring. Those questions come before channel selection, media planning, and creative."
          rightTitle="Match the ad to the page"
          rightBody="Match the message, channel, and destination to the customer's intent. Use the evidence to decide what to adjust, maintain, or expand."
          outroImages={[
            humanImages.customerFollowup,
            humanImages.reportReview,
          ]}
          outroHeading="Spend with a plan."
          outroBody="Because a bigger budget is only useful when the campaign has a clear job to do."
          outroCtaLabel="Discuss Your Campaign Strategy"
          outroCtaHref="/#contact"
        />

        <section className="performance-capabilities section-pad" aria-labelledby="capabilities-title">
          <header className="performance-system-heading">
            <h2 id="capabilities-title">What your paid campaign needs.</h2>
            <p>Choose channels, create relevant ads and track the actions you want customers to take.</p>
          </header>
          <div className="performance-system-grid">
            {campaignSystem.map((item) => {
              const Icon = item.icon;
              return <article key={item.label}>
                {item.platforms ? <div className="ad-platform-group">{item.platforms.map(platform => <AdPlatformMark key={platform} platform={platform} />)}</div>
                  : <Icon aria-hidden="true" size={34} weight="light" />}
                <div><h3>{item.label}</h3><p>{item.outcome}</p></div>
              </article>;
            })}
          </div>
          <div className="performance-system-footer">
            <p>Agree the goal and tracking before increasing spend.</p>
            <TransitionLink className="performance-inline-cta" href="/#contact">Discuss Your Paid Marketing <ArrowUpRight size={17} weight="light" /></TransitionLink>
          </div>
        </section>

        <section className="performance-process section-pad" aria-labelledby="process-title">
          <div className="performance-section-heading">
            <p className="eyebrow">The process</p>
            <div>
              <h2 id="process-title">How we plan and improve campaigns.</h2>
              <p className="performance-section-intro">Agree the goal, check tracking, launch and review.</p>
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
            <div className="ad-platform-group performance-approach-platforms"><AdPlatformMark platform="google" /><AdPlatformMark platform="meta" /></div>
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
            <h2 id="related-title">Improve what happens after the click.</h2>
            <p>Connect your ads to relevant pages, useful creative and reliable follow-up.</p>
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
          <header><p className="eyebrow">Frequently asked questions</p><h2 id="faq-title">Your paid advertising questions, answered.</h2></header>
          <div>{faqs.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
        </section>

        <section className="performance-closing performance-closing--connected section-pad" aria-labelledby="closing-title">
          <p className="eyebrow">Make the next budget decision count</p>
          <div className="performance-closing-message">
            <h2 id="closing-title">Know what you&apos;re spending.<br />Know what you&apos;re working toward.</h2>
            <p>Share what you sell, who you want to reach and which campaigns need improving.</p>
            <div className="performance-closing-actions">
              <TransitionLink href="/#contact">Discuss Your Paid Marketing <ArrowUpRight size={24} weight="light" /></TransitionLink>
            </div>
            <small className="performance-brand-signoff">Get found. Get chosen.</small>
          </div>
        </section>
      </main>
      <SiteFooter showProjectCta={false} />
    </div>
  );
}
