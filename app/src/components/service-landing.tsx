import { ArrowDown, ArrowUpRight, Browser, CalendarCheck, Cube, FilmStrip, ImageSquare, Megaphone, PlayCircle } from "@phosphor-icons/react";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import { InformationScrollStory } from "@/components/information-scroll-story";
import { serviceRelatedOptions } from "@/service-related-options";
import type { RelatedServicePath } from "@/service-related-options";
import "@/service-related-options.css";

export type ServiceLink = { label: string; href: RelatedServicePath };

const relatedServiceIcons = {
  graphics: ImageSquare,
  video: FilmStrip,
  advertising: Megaphone,
  social: CalendarCheck,
  motion: PlayCircle,
  creative: Cube,
  website: Browser,
};

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
  relatedHeading: string;
  related: ServiceLink[];
  cta: string;
  image: string;
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
          <figure className="service-detail-hero-media"><img src={data.image} alt="Abstract sculptural artwork representing the service" width="1200" height="1200" /></figure>
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

        <section className="faq-section section-pad" aria-labelledby="faq-title">
          <header><p className="eyebrow">Frequently asked questions</p><h2 id="faq-title">What buyers usually need to know.</h2></header>
          <div>{data.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
        </section>

        <section className="service-related-options section-pad" aria-labelledby="related-title">
          <header><h2 id="related-title">{data.relatedHeading}</h2></header>
          <nav aria-label="Related services">
            <ul>
              {data.related.map((link) => {
                const option = serviceRelatedOptions[link.href];
                const Icon = relatedServiceIcons[option.icon];
                return (
                  <li key={link.href}>
                    <Icon className="service-related-option-icon" size={28} weight="light" aria-hidden="true" />
                    <div><h3>{option.heading}</h3><p>{option.description}</p></div>
                    <TransitionLink className="story-link" href={link.href}>{option.action}</TransitionLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </section>

        <section className="service-detail-closing section-pad">
          <p className="eyebrow">Start a conversation</p><h2>{data.cta}.</h2><a href={whatsapp} target="_blank" rel="noopener noreferrer">{data.cta} <ArrowUpRight size={28} weight="light" /></a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
