import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import "@/service-growth-pages.css";
import "@/website-page.css";

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
    "Messaging and content",
    "A clear service-page structure, copy requirements, and space for real project or business evidence.",
  ],
  [
    "Mobile layouts and accessibility",
    "Layouts for desktop and phone, readable type, keyboard navigation, and appropriately sized media.",
  ],
  [
    "Forms and integrations",
    "Agreed forms, booking tools, store, or CRM connections, with the inquiry path checked before launch.",
  ],
  [
    "Search foundations and launch checks",
    "Page titles, descriptions, semantic headings, and checks of key links and forms before handover.",
  ],
];
const relatedServices = [
  {
    name: "SEO & AI Search",
    body: "Help customers discover your services through technical SEO and useful search-focused content.",
    href: "/services/seo-ai-search",
    action: "Explore SEO & AI Search",
  },
  {
    name: "Performance Marketing",
    body: "Connect paid ads to relevant landing pages and track the inquiries they generate.",
    href: "/services/performance-marketing",
    action: "Explore Paid Advertising",
  },
  {
    name: "Creative Production",
    body: "Add video, motion graphics, CGI, and design that explain your products and services.",
    href: "/creative-production",
    action: "Explore Creative Production",
  },
  {
    name: "CRM & Integrations",
    body: "Connect selected forms, booking tools, and CRM systems so inquiries reach the right people.",
    href: "/services#connect",
    action: "Explore CRM & Integrations",
  },
];
const formats = [
  [
    "Landing Pages",
    "One offer or campaign, with a focused message and one inquiry, booking, or purchase action.",
  ],
  [
    "Business Websites",
    "Service pages, project examples, and contact journeys. Content management and integrations can be included in the agreed scope.",
  ],
  [
    "Ecommerce Websites",
    "Product pages, browsing, and checkout. Payments, shipping, taxes, and platform fees are confirmed during scoping.",
  ],
  [
    "Website Redesign",
    "Improve an existing site's copy, navigation, mobile layouts, or inquiry journey. Review current content and search foundations before changes.",
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
      <SiteHeader />
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
              Custom website design, development, and redesign for service businesses and growing
              brands that need to explain their value clearly, earn trust, and turn visits into
              enquiries.
            </p>
            <div className="growth-actions">
              <TransitionLink className="primary-btn" href="/#contact">
                Discuss Your Website
              </TransitionLink>
              <a href="#website-projects">Explore Website Projects</a>
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
        <section className="project-section section-pad" id="website-projects">
          <header>
            <h2>See the websites we’ve built.</h2>
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
                    <ViewportVideo src={project.video} label={`${project.name} website preview`} />
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
                      <TransitionLink href="/work">See More Website Work</TransitionLink>
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
          <div className="website-project-next">
            <p>Have a similar website in mind?</p>
            <TransitionLink className="primary-btn" href="/#contact">
              Discuss Your Website
            </TransitionLink>
          </div>
        </section>
        <section className="website-formats section-pad" aria-labelledby="website-formats-title">
          <header>
            <h2 id="website-formats-title">Choose the website your business needs.</h2>
            <p>
              A campaign page, full business site, online store, or redesign. We scope the pages and
              features around your goal.
            </p>
          </header>
          <div className="website-format-list">
            {formats.map(([heading, copy]) => (
              <article key={heading}>
                <h3>{heading}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="website-benefits section-pad" aria-labelledby="website-benefits-title">
          <header>
            <h2 id="website-benefits-title">What goes into your website.</h2>
            <p>
              Page structure, responsive design, agreed integrations, and launch checks are scoped
              together.
            </p>
          </header>
          <div className="website-benefit-grid">
            {value.map(([heading, copy]) => (
              <article key={heading}>
                <h3>{heading}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="website-scope section-pad" aria-labelledby="website-scope-title">
          <div>
            <h2 id="website-scope-title">A clear scope makes a better start.</h2>
            <p>
              Before work begins, we agree on what is included, what you need to supply, and what
              the project will cost.
            </p>
            <TransitionLink className="primary-btn" href="/#contact">
              Discuss Your Website
            </TransitionLink>
          </div>
          <dl>
            <div>
              <dt>Pages &amp; content</dt>
              <dd>Key pages, copywriting, and the images or video needed.</dd>
            </div>
            <div>
              <dt>Tools &amp; connections</dt>
              <dd>Forms, booking, ecommerce, and selected CRM integrations.</dd>
            </div>
            <div>
              <dt>Budget &amp; timeline</dt>
              <dd>Project fees, content deadlines, reviews, and launch dependencies.</dd>
            </div>
            <div>
              <dt>Ownership &amp; ongoing costs</dt>
              <dd>Handover, maintenance, hosting, and any software or licensing fees.</dd>
            </div>
          </dl>
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
        <section className="website-related section-pad" aria-labelledby="website-related-title">
          <header>
            <h2 id="website-related-title">Need help beyond the website?</h2>
            <p>Search, paid ads, creative, and CRM support can be scoped separately.</p>
          </header>
          <div className="website-related-grid">
            {relatedServices.map((service) => (
              <article key={service.name}>
                <h3>{service.name}</h3>
                <p>{service.body}</p>
                <TransitionLink className="website-service-link" href={service.href}>
                  {service.action}
                </TransitionLink>
              </article>
            ))}
          </div>
        </section>
        <section className="growth-closing section-pad">
          <h2>Planning a website or redesign?</h2>
          <p>
            Share your current website, target customers, and what needs to change. We’ll review the
            requirements before suggesting a scope.
          </p>
          <div className="growth-actions">
            <TransitionLink className="primary-btn" href="/#contact">
              Discuss Your Website
            </TransitionLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
