import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "@phosphor-icons/react";
import { HorizontalCases } from "@/components/horizontal-cases";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import { PageSchema } from "@/components/page-schema";

export const Route = createFileRoute("/work")({
  component: WorkPage,
  head: () => ({ meta: [
    { title: "Website & Digital Projects | Better Found Online" },
    { name: "description", content: "Explore selected website and digital projects across healthcare, recruitment, and specialized services. See the strategy and design behind each project." },
  ], links: [{ rel: "canonical", href: "https://betterfoundonline.com/work" }] }),
});

function WorkPage() {
  return (
    <div className="site interior-site">
      <PageTransition />
      <PageSchema name="Website & Digital Projects | Better Found Online" path="/work" description="The proposed portfolio features website projects involving clear service positioning, customer-focused navigation, responsive development, and distinctive visual design. Project attribution must be confirmed before publication." />
      <a className="skip-link" href="#main">Skip to Content</a>
      <SiteHeader />
      <main id="main">
        <section className="interior-hero work-hero">
          <div className="interior-hero-copy">
            <p className="eyebrow">Selected Work</p>
            <h1>Real challenges.<span>Work with a purpose.</span></h1>
            <p>From specialist service businesses to distinctive brands, explore digital projects built around clear positioning, considered design, and practical customer journeys.</p>
            <p className="work-taxonomy">Website Design / SEO / Performance Marketing</p>
            <div className="interior-hero-actions">
              <a className="primary-btn" href="#cases">View Selected Work</a>
              <TransitionLink href="/#contact">Discuss Your Project</TransitionLink>
            </div>
          </div>
          <div className="work-hero-collage" aria-hidden="true">
            <img src="/assets/portals.webp" alt="" />
            <img src="/assets/macro.webp" alt="" />
            <img src="/assets/connect.webp" alt="" />
          </div>
          <div className="orbit-svg" aria-hidden="true">
            <svg viewBox="0 0 700 700"><circle cx="350" cy="350" r="270" /><ellipse cx="350" cy="350" rx="330" ry="115" transform="rotate(-24 350 350)" /><ellipse cx="350" cy="350" rx="330" ry="115" transform="rotate(58 350 350)" /></svg>
          </div>
        </section>

        <div id="cases"><HorizontalCases /></div>

        <section className="work-paid-media section-pad" aria-labelledby="work-paid-media-title">
          <p className="eyebrow">Performance marketing</p>
          <div>
            <h2 id="work-paid-media-title">Planning paid media?<br />Start with the reason.</h2>
            <div>
              <p>See how we connect business goals, audience intent, tracking, creative, landing pages, and practical optimization before asking the budget to do more.</p>
              <TransitionLink href="/services/performance-marketing">See Our Paid Media Approach <ArrowUpRight size={18} weight="light" /></TransitionLink>
            </div>
          </div>
          <div className="work-paid-media-evidence">
            <figure>
              <img src="/assets/performance-evidence/industrial-search-report.png" alt="Anonymized Google Ads campaign reporting excerpt" width="2048" height="620" loading="lazy" decoding="async" />
              <figcaption>Google Ads reporting excerpt. Account identity and contact details permanently redacted.</figcaption>
            </figure>
            <dl>
              <div><dt>Industrial B2B report</dt><dd>266 <span>configured conversions</span></dd></div>
              <div><dt>Consumer marketplace report</dt><dd>9.80 <span>Amazon Ads ROAS</span></dd></div>
            </dl>
            <p>Platform-reported figures for specific periods. Configured conversions are not presented as qualified leads, and marketplace reporting is not an independent audit of revenue or profit.</p>
          </div>
        </section>

      </main>
      <SiteFooter projectCta={{ heading: "Have a similar project in mind?", label: "Discuss a Similar Project", anchorId: "work-contact" }} />
    </div>
  );
}
