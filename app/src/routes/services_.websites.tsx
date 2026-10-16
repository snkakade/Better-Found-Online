import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import "@/service-growth-pages.css";

const title = "Website Design & Development | Better Found Online";
const description =
  "Custom websites, landing pages, business sites, and digital experiences designed to make your business easier to understand, trust, and choose.";
const canonical = "https://betterfoundonline.com/services/websites";

export const Route = createFileRoute("/services_/websites")({
  component: WebsitesPage,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical }],
  }),
});

const projects = [
  {
    industry: "Healthcare",
    name: "Dr Shweta Valunj",
    headline: "Specialist expertise. A clearer patient journey.",
    description:
      "A calm digital presence that makes dental treatments easier to explore and consultation easier to begin.",
    challenge:
      "Communicate clinical expertise without making the experience feel cold or overly technical.",
    approach:
      "Restrained visual design, a clear treatment hierarchy, responsive development, and direct consultation journeys.",
    capabilities: "Positioning / UX Direction / Responsive Development",
    video: "/assets/service-pages/websites/dr-shweta.webm",
  },
  {
    industry: "Leisure",
    name: "CharterX",
    headline: "Premium presentation. Commercial clarity.",
    description:
      "A distinctive website for specialist yacht services, balancing cinematic presentation with practical information.",
    challenge: "Communicate a premium service offering to audiences with different priorities.",
    approach:
      "Cinematic media, purposeful motion, editorial pacing, and a focused services structure.",
    capabilities: "Positioning / UX Direction / Motion Design",
    video: "/assets/service-pages/websites/charterx.webm",
  },
  {
    industry: "Agriculture",
    name: "Say Vanilla",
    headline: "A product story worth slowing down for.",
    description:
      "An editorial experience built around vanilla cultivation, curing, and the value of a carefully developed product.",
    challenge: "Explain a specialized product and process without creating a technical brochure.",
    approach: "Tactile imagery, visual storytelling, deliberate pacing, and purposeful motion.",
    capabilities: "Creative Direction / Storytelling / Interactive Design",
    video: "/assets/service-pages/websites/say-vanilla.webm",
  },
  {
    industry: "Recruitment",
    name: "Tech Sales Sourced",
    headline: "Less agency noise. More clarity.",
    description:
      "A recruitment website that makes specialist tech-sales expertise clear for candidates and hiring teams.",
    challenge:
      "Differentiate a specialist recruitment offer in a market filled with similar language.",
    approach:
      "Clear positioning, audience-specific journeys, direct messaging, and structured content.",
    capabilities: "Positioning / Content Structure / Front-End Development",
    video: "/assets/service-pages/websites/tech-sales.webm",
  },
  {
    industry: "Agriculture",
    name: "Hello Honey Bunny",
    headline: "A brand story with room to grow.",
    description:
      "A warm, recognizable digital identity and website experience for a small-batch agricultural venture.",
    challenge: "Create a credible and memorable experience for a developing business.",
    approach: "A distinctive brand world, venture storytelling, and responsive development.",
    capabilities: "Brand Experience / Storytelling / Responsive Development",
    video: "/assets/service-pages/websites/hello-honey-bunny.webm",
  },
] as const;

const value = [
  [
    "01",
    "Positioning",
    "Make your offer obvious.",
    "Help visitors recognize who you serve, what you offer, and why they should consider you.",
  ],
  [
    "02",
    "Trust",
    "Give people reasons to believe.",
    "Bring credible information, real work, clear messaging, and considered design into one experience.",
  ],
  [
    "03",
    "Conversion",
    "Make the next step easy.",
    "Help visitors enquire, book, purchase, or explore without unnecessary friction.",
  ],
  [
    "04",
    "Foundation",
    "Build it properly.",
    "Responsive layouts, accessible interactions, search-friendly structure, performance, and measurement belong in the build.",
  ],
];
const formats = [
  [
    "01",
    "Landing Pages",
    "One offer. One audience. One clear action.",
    "Messaging / Design / Responsive Development / Conversion Path",
  ],
  [
    "02",
    "Business Websites",
    "Make the whole business easier to understand.",
    "Website Strategy / UX / Design / Development / Search Foundations",
  ],
  [
    "03",
    "Growth Platforms",
    "A stronger foundation for a growing business.",
    "Content Systems / Integrations / Customer Journeys / Analytics",
  ],
  [
    "04",
    "Ecommerce Websites",
    "Make shopping easier from browsing to checkout.",
    "Product Presentation / Store UX / Commerce Integrations / Testing",
  ],
  [
    "05",
    "Website Redesign",
    "Keep what's working. Improve what isn't.",
    "Website Review / Content Structure / UX / Visual Redesign / Development",
  ],
];
const process = [
  [
    "01",
    "Find the signal",
    "Understand the audience, offer, available proof, and action the website must support.",
  ],
  [
    "02",
    "Shape the story",
    "Plan the hierarchy, messaging, visual direction, and customer journey.",
  ],
  [
    "03",
    "Build the experience",
    "Develop responsive pages, purposeful interactions, integrations, and technical foundations.",
  ],
  [
    "04",
    "Test the details",
    "Review layouts, forms, accessibility, performance, metadata, and the inquiry journey.",
  ],
  [
    "05",
    "Launch & improve",
    "Launch the approved experience and identify opportunities through real use and available data.",
  ],
];
const faqs = [
  [
    "How is a custom website different from a template?",
    "A template starts with a predetermined structure. A custom website begins with the business, audience, content, and intended customer journey.",
  ],
  [
    "Can you help with website messaging and copy?",
    "Yes. Website strategy and content structure can be included. The copywriting and production scope is agreed before the project begins.",
  ],
  [
    "Will my website be SEO-ready?",
    "The build can include crawlable content, headings, metadata, semantic structure, responsive layouts, and agreed technical foundations. Ongoing SEO is separate.",
  ],
  [
    "Can you integrate forms, booking tools, or CRM systems?",
    "Selected forms, booking tools, CRM connections, and email integrations can be included where supported by the scope.",
  ],
  [
    "How long does a website take?",
    "It depends on pages, content, design complexity, integrations, review cycles, and testing. The schedule is confirmed after scoping.",
  ],
  [
    "Do you build ecommerce websites?",
    "Yes. Platform choice, payments, shipping, taxes, administration, and third-party fees are confirmed during scoping.",
  ],
  [
    "Can you redesign an existing website?",
    "Yes. A redesign can address structure, messaging, navigation, responsiveness, visual design, and the customer journey.",
  ],
  [
    "What happens after launch?",
    "Handover, maintenance, content updates, and ongoing improvement depend on the agreed engagement and are documented before work begins.",
  ],
];

function Schema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              name: "Website Design and Development",
              serviceType: [
                "Website design",
                "Web development",
                "Website redesign",
                "Landing pages",
                "Ecommerce websites",
              ],
              url: canonical,
              description,
              provider: { "@id": "https://betterfoundonline.com/#organization" },
              areaServed: ["US", "GB", "CA", "AU"],
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://betterfoundonline.com",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Services",
                  item: "https://betterfoundonline.com/services",
                },
                { "@type": "ListItem", position: 3, name: "Websites", item: canonical },
              ],
            },
          ],
        }),
      }}
    />
  );
}

function ViewportVideo({
  src,
  label,
  preload = "metadata",
}: {
  src: string;
  label: string;
  preload?: "auto" | "metadata";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.28 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video ref={videoRef} muted loop playsInline preload={preload} aria-label={label}>
      <source src={src} type="video/webm" />
    </video>
  );
}

function WebsitesPage() {
  const [filter, setFilter] = useState("All Projects");
  const visible =
    filter === "All Projects"
      ? projects
      : projects.filter((project) => project.industry === filter);
  return (
    <div className="site interior-site growth-service-page websites-service-page">
      <PageTransition />
      <Schema />
      <a className="skip-link" href="#main">
        Skip to Content
      </a>
      <SiteHeader frostFromSelector=".growth-intro" />
      <main id="main">
        <section className="growth-hero websites-growth-hero">
          <div>
            <p className="eyebrow">Website Design &amp; Development</p>
            <h1>
              Your website should
              <br />
              <em>do more than look good.</em>
            </h1>
            <p>
              We design and develop websites that make your business easier to understand, trust,
              and choose. Clear messaging, distinctive design, thoughtful interactions, and solid
              technical foundations, all working toward a purpose.
            </p>
            <div className="growth-actions">
              <TransitionLink className="primary-btn" href="/#contact">
                Discuss Your Website <ArrowUpRight />
              </TransitionLink>
              <a href="#website-projects">
                Explore Website Projects <ArrowDown />
              </a>
            </div>
            <small>
              From focused landing pages to complete business websites and connected platforms.
            </small>
          </div>
          <figure className="website-phone-hero">
            <div className="case-device case-device-phone">
              <div className="case-device-phone-screen">
                <ViewportVideo
                  src="/assets/work/say-vanilla-mobile.webm"
                  preload="auto"
                  label="Say Vanilla mobile website preview on an iPhone"
                />
                <span className="case-device-phone-island" aria-hidden="true" />
              </div>
            </div>
            <figcaption>
              <span>Mobile website preview</span>
              <b>Say Vanilla</b>
            </figcaption>
          </figure>
        </section>
        <section className="growth-intro section-pad">
          <p className="eyebrow">The first impression matters</p>
          <div>
            <h2>A better website starts with a clearer business.</h2>
            <p>
              A visitor shouldn't have to work out what you do, why it matters, or where to go next.
              We connect business strategy, messaging, visual design, and development to make that
              journey feel natural.
            </p>
          </div>
          <ol className="statement-track">
            <li>Make the offer clear.</li>
            <li>Give the business character.</li>
            <li>Build confidence.</li>
            <li>Make action easy.</li>
          </ol>
        </section>
        <section className="project-section section-pad" id="website-projects">
          <header>
            <p className="eyebrow">The work behind the thinking</p>
            <h2>
              Different businesses.
              <br />
              Websites with a purpose.
            </h2>
            <p>
              Selected founder-portfolio projects across healthcare, leisure, agriculture, and
              specialist recruitment.
            </p>
          </header>
          <div className="project-filters" role="group" aria-label="Filter website projects">
            {["All Projects", "Healthcare", "Agriculture", "Recruitment", "Leisure"].map((item) => (
              <button
                type="button"
                className={filter === item ? "active" : ""}
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="project-grid" aria-live="polite">
            {visible.map((project) => {
              const projectNumber = projects.indexOf(project) + 1;
              return (
                <article className="project-card" key={project.name}>
                  <div className="project-media">
                    <ViewportVideo
                      src={project.video}
                      label={`${project.name} website preview`}
                    />
                  </div>
                  <div className="project-copy">
                    <span>
                      {String(projectNumber).padStart(2, "0")} / {project.industry}
                    </span>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <div className="project-tags" aria-label="Project capabilities">
                      {project.capabilities.split(" / ").map((capability) => (
                        <small key={capability}>{capability}</small>
                      ))}
                    </div>
                    <details className="project-notes">
                      <summary>
                        Read project notes <span aria-hidden="true">＋</span>
                      </summary>
                      <h4>{project.headline}</h4>
                      <dl>
                        <dt>Challenge</dt>
                        <dd>{project.challenge}</dd>
                        <dt>Approach</dt>
                        <dd>{project.approach}</dd>
                      </dl>
                      <TransitionLink href="/work">
                        View Website Project <ArrowUpRight />
                      </TransitionLink>
                    </details>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="portfolio-note">
            These are selected projects from our founder's portfolio. Publication and project
            attribution remain subject to applicable client permissions.
          </p>
        </section>
        <section className="growth-cards section-pad">
          <header>
            <p className="eyebrow">What makes a website work</p>
            <h2>
              Good design gets attention.
              <br />
              Clear thinking earns the next click.
            </h2>
          </header>
          <div>
            {value.map(([n, l, h, c]) => (
              <article key={n}>
                <span>
                  {n} / {l}
                </span>
                <h3>{h}</h3>
                <p>{c}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="format-section section-pad">
          <header>
            <p className="eyebrow">What we build</p>
            <h2>
              The right website.
              <br />
              Not more website than you need.
            </h2>
            <p>
              Different businesses need different levels of complexity. We start with the problem,
              then determine the right structure and scope.
            </p>
          </header>
          <div>
            {formats.map(([n, l, h, s]) => (
              <article key={n}>
                <span>{n}</span>
                <div>
                  <h3>{l}</h3>
                  <p>{h}</p>
                  <small>Typical scope: {s}</small>
                </div>
              </article>
            ))}
          </div>
          <TransitionLink className="text-cta" href="/#contact">
            Find the Right Website Scope <ArrowUpRight />
          </TransitionLink>
        </section>
        <section className="split-editorial section-pad">
          <figure>
            <img
              src="/assets/service-pages/editorial/responsive-web-system.jpg"
              alt="Responsive website system shown across screen sizes"
              width="1400"
              height="900"
              loading="lazy"
            />
          </figure>
          <div>
            <p className="eyebrow">The details make the difference</p>
            <h2>
              Built to feel different.
              <br />
              Designed to make sense.
            </h2>
            <p>
              Typography, layout, movement, and responsive interactions create distinctive
              experiences without making visitors work harder.
            </p>
            <ul>
              <li>
                <b>Purposeful motion</b> guides attention.
              </li>
              <li>
                <b>Responsive by design</b> keeps every screen useful.
              </li>
              <li>
                <b>Fast where it matters</b> through optimized assets and code.
              </li>
              <li>
                <b>Accessible interactions</b> remain understandable and usable.
              </li>
            </ul>
          </div>
        </section>
        <section className="process-section section-pad">
          <header>
            <p className="eyebrow">From idea to experience</p>
            <h2>Clear decisions. Better execution.</h2>
          </header>
          <ol>
            {process.map(([n, h, c]) => (
              <li key={n}>
                <span>{n}</span>
                <h3>{h}</h3>
                <p>{c}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="guidance-grid section-pad">
          <article>
            <p className="eyebrow">Before the build</p>
            <h2>A clear scope makes a better start.</h2>
            <p>
              Delivery depends on content readiness, page complexity, interaction requirements,
              integrations, review cycles, and testing. We define scope and dependencies before
              confirming the timeline.
            </p>
            <TransitionLink href="/#contact">
              Discuss Your Requirements <ArrowUpRight />
            </TransitionLink>
          </article>
          <article>
            <p className="eyebrow">Understanding the investment</p>
            <h2>Compare the scope. Not just the price.</h2>
            <p>
              Ask what is included, who creates the content, and what maintenance covers. Confirm
              that you own the approved website, content, and transferable project assets, and
              understand any continuing software, hosting, or licensing costs.
            </p>
            <TransitionLink href="/#contact">
              Discuss Your Project Scope <ArrowUpRight />
            </TransitionLink>
          </article>
          <article>
            <p className="eyebrow">Prepare for a better project</p>
            <h2>A great brief starts with the right questions.</h2>
            <p>
              Bring your offer, audience, objective, important pages, available proof, integrations,
              budget considerations, preferred timing, and decision makers.
            </p>
            <TransitionLink href="/#contact">
              Start a Website Conversation <ArrowUpRight />
            </TransitionLink>
          </article>
        </section>
        <section className="related-section section-pad">
          <p className="eyebrow">Make the website work harder</p>
          <h2>A great website is a beginning.</h2>
          <div>
            <TransitionLink href="/services/seo-ai-search">
              SEO &amp; AI Search <ArrowUpRight />
            </TransitionLink>
            <TransitionLink href="/services/performance-marketing">
              Performance Marketing <ArrowUpRight />
            </TransitionLink>
            <TransitionLink href="/creative-production">
              Creative Production <ArrowUpRight />
            </TransitionLink>
            <TransitionLink href="/services#connect">
              CRM &amp; Integrations <ArrowUpRight />
            </TransitionLink>
          </div>
        </section>
        <section className="faq-section section-pad">
          <header>
            <p className="eyebrow">Frequently asked questions</p>
            <h2>What buyers usually need to know.</h2>
          </header>
          <div>
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="growth-closing section-pad">
          <p className="eyebrow">Ready to build something better?</p>
          <h2>
            Make your business
            <br />
            <em>worth a closer look.</em>
          </h2>
          <p>
            Whether you're launching something new or replacing a website that no longer fits, tell
            us what needs to change.
          </p>
          <div className="growth-actions">
            <TransitionLink className="primary-btn" href="/#contact">
              Discuss Your Website <ArrowUpRight />
            </TransitionLink>
            <TransitionLink href="/work">
              Explore Our Work <ArrowUpRight />
            </TransitionLink>
          </div>
          <small>Get found. Get chosen.</small>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
