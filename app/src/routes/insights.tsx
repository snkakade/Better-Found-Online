import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { PageSchema } from "@/components/page-schema";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
  head: () => ({
    meta: [
      { title: "Website, SEO & Marketing Insights | Better Found Online" },
      { name: "description", content: "Clear thinking on websites, search, design, and what makes digital work useful for growing businesses." },
    ],
    links: [{ rel: "canonical", href: "https://betterfoundonline.com/insights" }],
  }),
});

const insights = [
  {
    number: "01",
    category: "Web Design",
    filter: "web-design",
    title: "Your website should do more than look good.",
    image: "/assets/portals.webp",
    imageAlt: "Connected sculptural frames illustrating a clear website structure",
    paragraphs: [
      "A strong website makes your business easier to understand and your next step easier to take.",
      "Start with a clear offer, useful information, credible proof, and a reason to get in touch.",
    ],
  },
  {
    number: "02",
    category: "Search & Content",
    filter: "search-content",
    title: "Better visibility starts with better answers.",
    image: "/assets/macro.webp",
    imageAlt: "Detailed metal surface representing focused search and useful content",
    paragraphs: [
      "People search because they're looking for something specific. Your content should meet that need.",
      "Answer real questions, explain your services clearly, and make useful information easy to find.",
    ],
  },
  {
    number: "03",
    category: "Design & Motion",
    filter: "design-motion",
    title: "Not every movement moves things forward.",
    image: "/assets/connect.webp",
    imageAlt: "Flowing metal form representing purposeful digital motion",
    paragraphs: [
      "Animation should make a website easier to follow, not harder to use.",
      "When motion has a purpose, it can guide attention, explain ideas, and give a digital experience its own character.",
    ],
  },
];

const filters = [
  ["all", "All insights"],
  ["web-design", "Web Design"],
  ["search-content", "Search & Content"],
  ["design-motion", "Design & Motion"],
] as const;

const orbitBaseDurations = [56, 48, 68, 52] as const;

function OrbitType({ orbitRef }: { orbitRef: RefObject<SVGSVGElement | null> }) {
  return (
    <svg ref={orbitRef} className="insights-orbit" viewBox="0 0 1400 1400" aria-hidden="true">
      <defs>
        <path id="insight-orbit-outer" d="M135 700a565 565 0 1 0 1130 0a565 565 0 1 0-1130 0" />
        <path id="insight-orbit-title" d="M255 700a445 445 0 1 0 890 0a445 445 0 1 0-890 0" />
        <path id="insight-orbit-middle" d="M375 700a325 325 0 1 0 650 0a325 325 0 1 0-650 0" />
        <path id="insight-orbit-inner" d="M495 700a205 205 0 1 0 410 0a205 205 0 1 0-410 0" />
      </defs>
      <g className="insights-orbit-spin insights-orbit-outer"><text><textPath href="#insight-orbit-outer" textLength="3550" lengthAdjust="spacingAndGlyphs">WEBSITES · SEARCH · CONTENT · DIGITAL MARKETING · SYSTEMS · </textPath></text></g>
      <g className="insights-orbit-spin insights-orbit-title"><text><textPath href="#insight-orbit-title" textLength="2796" lengthAdjust="spacingAndGlyphs">GOOD QUESTIONS · BETTER DIGITAL DECISIONS · </textPath></text></g>
      <g className="insights-orbit-spin insights-orbit-middle"><text><textPath href="#insight-orbit-middle" textLength="2042" lengthAdjust="spacingAndGlyphs">CLEAR THINKING · USEFUL ANSWERS · </textPath></text></g>
      <g className="insights-orbit-spin insights-orbit-inner"><text><textPath href="#insight-orbit-inner" textLength="1288" lengthAdjust="spacingAndGlyphs">THINK · TEST · IMPROVE · </textPath></text></g>
    </svg>
  );
}

function InsightsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [tunneling, setTunneling] = useState(false);
  const [entered, setEntered] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const orbitRef = useRef<SVGSVGElement>(null);
  const tunnelTimers = useRef<number[]>([]);
  const visibleInsights = useMemo(
    () => insights.filter((item) => activeFilter === "all" || item.filter === activeFilter),
    [activeFilter],
  );

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(".insights-page [data-insight-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [activeFilter]);

  useEffect(() => () => tunnelTimers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const setOrbitRates = (rates: number[]) => {
    const hero = heroRef.current;
    if (!hero) return;
    ["outer", "title", "middle", "inner"].forEach((name, index) => {
      hero.style.setProperty(`--orbit-${name}-duration`, `${orbitBaseDurations[index] / (rates[index] ?? 1)}s`);
    });
  };

  const enterInsights = () => {
    if (tunneling || entered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      return;
    }

    setTunneling(true);
    setOrbitRates([3.2, 4.6, 2.5, 5.4]);
    tunnelTimers.current.push(window.setTimeout(() => setEntered(true), 760));
    tunnelTimers.current.push(window.setTimeout(() => setTunneling(false), 1650));
  };

  return (
    <div className="site interior-site insights-page">
      <PageTransition />
      <PageSchema name="Website, SEO & Marketing Insights | Better Found Online" path="/insights" description="Better Found Online shares clear thinking about website design, search engine optimization, content, and purposeful digital experiences." />
      <a className="skip-link" href="#main">Skip to Content</a>
      <SiteHeader frostFromSelector=".insights-story" />
      <main id="main">
        <section
          ref={heroRef}
          className={`insights-hero ${tunneling ? "is-tunneling" : ""} ${entered ? "is-entered" : ""}`}
          aria-labelledby="insights-title"
        >
          <OrbitType orbitRef={orbitRef} />
          <div className="insights-hero-copy">
            <p className="eyebrow">Insights</p>
            <h1 id="insights-title">Good questions.<span>Better digital decisions.</span></h1>
            <p>Clear thinking on websites, search, design, and what makes digital work useful.</p>
          </div>
          <button className="insights-enter" type="button" onClick={enterInsights} disabled={tunneling}>
            <span>Enter insights</span><ArrowDownRight size={24} weight="light" />
          </button>
          <p className="insights-hero-note">Websites · search · content · purposeful motion</p>
        </section>

        <section className="insights-story insights-shell" data-insight-reveal aria-labelledby="insights-story-title">
          <div className="insights-story-intro">
            <h2 id="insights-story-title">Better digital work begins<br /><em>with clearer thinking.</em></h2>
            <p>Different questions need different answers. The aim stays the same: make every digital decision more useful.</p>
          </div>
          <div className="insights-story-rows" aria-label="Our editorial principles">
            <div className="insights-story-row"><span>Clarity</span><span>Action</span><small>01 / Websites</small></div>
            <div className="insights-story-row"><span>Questions</span><span>Answers</span><small>02 / Search</small></div>
            <div className="insights-story-row"><span>Motion</span><span>Purpose</span><small>03 / Design</small></div>
          </div>
        </section>

        <section className="insights-library insights-shell" id="insight-library" aria-label="Website, SEO, and marketing insights">
          <div className="insights-filters" role="group" aria-label="Filter insights">
            {filters.map(([value, label]) => (
              <button type="button" key={value} aria-pressed={activeFilter === value} onClick={() => setActiveFilter(value)}>{label}</button>
            ))}
            <span className="insights-count" aria-live="polite">{visibleInsights.length} {visibleInsights.length === 1 ? "insight" : "insights"}</span>
          </div>

          <div className="insights-grid">
            {visibleInsights.map((item) => (
              <article className="insights-card" id={`insight-${item.number}`} data-insight-reveal key={item.number}>
                <div className="insights-card-media">
                  <span className="insights-browser-bar"><i aria-hidden="true">● ● ●</i><span>Better Found Online / Insights</span><span aria-hidden="true">↘</span></span>
                  <img src={item.image} alt={item.imageAlt} />
                </div>
                <div className="insights-card-meta">
                  <div>
                    <span className="insight-category"><span className="tiny">{item.number}</span>{item.category}</span>
                    <h2>{item.title}</h2>
                  </div>
                  <span className="insights-reading-time">2 min read</span>
                </div>
                <div className="insights-card-body">
                  {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <TransitionLink href="/#contact">Discuss an Idea <ArrowUpRight size={16} weight="light" /></TransitionLink>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="insights-closing insights-shell" data-insight-reveal>
          <div>
            <p className="eyebrow">Ready to apply the thinking?</p>
            <h2>Let&apos;s make your<br /><em>business better found.</em></h2>
            <p>Bring us the question, the opportunity, or the part of your digital presence that is not working hard enough.</p>
          </div>
          <TransitionLink href="/#contact">Discuss Your Project <ArrowUpRight size={22} weight="light" /></TransitionLink>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
