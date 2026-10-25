import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import { InformationScrollStory } from "@/components/information-scroll-story";
import { CreativeProofReel, InlineProjectVideo } from "@/components/creative-story-components";
import type { CreativeProofVideo } from "@/components/creative-story-components";

export type ServiceLink = { label: string; href: string };

export type ServiceLandingData = {
  path: string;
  eyebrow: string;
  h1: string;
  intro: string;
  definition: string;
  sectionHeading: string;
  services: string[];
  supporting: string;
  audience: string;
  problem: string;
  deliverables: string[];
  approach: string;
  faq: Array<{ question: string; answer: string }>;
  related: ServiceLink[];
  cta: string;
  image: string;
  heroVideo?: { src: string; poster: string };
  proofVideos?: CreativeProofVideo[];
};

export function ServiceStructuredData({ data }: { data: ServiceLandingData }) {
  const siteUrl = "https://betterfoundonline.com";
  const pageUrl = `${siteUrl}${data.path}`;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              "@id": `${pageUrl}#service`,
              name: data.eyebrow,
              description: data.definition,
              url: pageUrl,
              provider: { "@id": `${siteUrl}/#organization` },
              areaServed: ["US", "GB", "CA", "AU"],
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
                { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services` },
                { "@type": "ListItem", position: 3, name: data.eyebrow, item: pageUrl },
              ],
            },
          ],
        }),
      }}
    />
  );
}

export function ServiceLanding({ data }: { data: ServiceLandingData }) {
  const whatsapp = `https://wa.me/15707077078?text=${encodeURIComponent(`Hi Better Found Online, I'd like to discuss ${data.eyebrow.toLowerCase()}.`)}`;
  return (
    <div className="site interior-site service-detail-page">
      <PageTransition />
      <ServiceStructuredData data={data} />
      <a className="skip-link" href="#main">Skip to Content</a>
      <SiteHeader />
      <main id="main">
        <section className="service-detail-hero" aria-labelledby="service-detail-title">
          <div className="service-detail-hero-copy">
            <p className="eyebrow">{data.eyebrow}</p>
            <h1 id="service-detail-title">{data.h1}</h1>
            <p>{data.intro}</p>
            <div className="service-detail-actions">
              <a className="primary-btn" href={whatsapp} target="_blank" rel="noopener noreferrer">{data.cta} <ArrowUpRight size={17} weight="light" /></a>
              <a className="story-link" href="#scope">Explore the Scope <ArrowDown size={16} weight="light" /></a>
            </div>
          </div>
          <figure className={`service-detail-hero-media${data.heroVideo ? " service-detail-hero-video" : ""}`}>
            {data.heroVideo ? <InlineProjectVideo src={data.heroVideo.src} poster={data.heroVideo.poster} /> : <img src={data.image} alt="Abstract sculptural artwork representing the service" width="1200" height="1200" />}
          </figure>
        </section>

        <InformationScrollStory
          id="scope"
          foregroundImage={data.image}
          foregroundAlt={`Abstract sculptural artwork representing ${data.eyebrow}`}
          foregroundHeading={data.sectionHeading}
          leftTitle="What it includes"
          leftBody={`${data.definition} Scope includes ${data.services.join(", ")}.`}
          rightTitle="What it solves"
          rightBody={`${data.supporting} ${data.audience} ${data.problem}`}
          outroImages={[
            { src: data.image, alt: `${data.eyebrow} visual study` },
            { src: data.image === "/assets/macro.webp" ? "/assets/connect.webp" : "/assets/macro.webp", alt: "Connected metallic forms in the Better Found Online visual system" },
          ]}
          outroHeading="Turn attention into action."
          outroCtaLabel={data.cta}
          outroCtaHref={whatsapp}
          afterHeading="Useful outputs. Ready for the right channel."
          afterBody={`${data.approach} Example deliverables include ${data.deliverables.join(", ")}.`}
        />

        {data.proofVideos ? <CreativeProofReel videos={data.proofVideos} /> : null}

        <section className="faq-section section-pad" aria-labelledby="faq-title">
          <header><p className="eyebrow">Frequently asked questions</p><h2 id="faq-title">What buyers usually need to know.</h2></header>
          <div>{data.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
        </section>

        <section className="service-detail-related section-pad" aria-labelledby="related-title">
          <p className="eyebrow">Related services</p><h2 id="related-title">Connect the right pieces.</h2>
          <nav aria-label="Related services">{data.related.map((link) => <TransitionLink href={link.href} key={link.href}>{link.label}<ArrowUpRight size={18} weight="light" /></TransitionLink>)}</nav>
        </section>

        <section className="service-detail-closing section-pad">
          <p className="eyebrow">Start a conversation</p><h2>{data.cta}.</h2><a href={whatsapp} target="_blank" rel="noopener noreferrer">Tell Us What You&apos;re Making <ArrowUpRight size={28} weight="light" /></a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
