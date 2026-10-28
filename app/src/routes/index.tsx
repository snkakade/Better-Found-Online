import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Check, PaperPlaneTilt } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BrandTunnel } from "@/components/brand-tunnel";
import { KineticBand } from "@/components/kinetic-band";
import { ProjectReel } from "@/components/project-reel";
import { ServicesAccordion } from "@/components/services-accordion";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import { PageSchema } from "@/components/page-schema";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Better Found Online | Websites, SEO & Performance Marketing" },
      { name: "description", content: "Websites, SEO, paid advertising, and creative digital experiences for service businesses and growing brands in the U.S. and beyond." },
      { name: "robots", content: "index, follow, max-image-preview:large" },
    ],
    links: [{ rel: "canonical", href: "https://betterfoundonline.com/" }],
  }),
});

const storyChapters = [
  {
    id: "discover",
    label: "01",
    name: "Website copy",
    title: "Explain your services clearly.",
    body:
      "We clarify your offer and write your website copy so visitors can quickly see what you do and why to choose you.",
    image: "/assets/portals.webp",
  },
  {
    id: "shape",
    label: "02",
    name: "Web design",
    title: "Make contacting your business easy.",
    body:
      "We build mobile-friendly websites with clear service pages, visible contact options, and simple forms, so customers can reach you from any screen.",
    image: "/assets/macro.webp",
  },
  {
    id: "launch",
    label: "03",
    name: "Search & ads",
    title: "Get found when customers search.",
    body:
      "SEO and paid ads connect relevant searches to focused landing pages. Inquiry tracking helps you see which channels bring in potential customers.",
    image: "/assets/connect.webp",
  },
];

const services = [
  {
    name: "Build",
    preview: "/assets/portals.webp",
    lead: "Make your first impression count.",
    body:
      "Distinctive, easy-to-use websites that present your business clearly, build confidence, and make the next step feel natural.",
    items: ["Website Design & Development", "UX & Digital Experiences", "Landing Pages & Conversion"],
    cta: "Explore Web Services",
    href: "/services/websites",
  },
  {
    name: "Create",
    preview: "/assets/connect.webp",
    lead: "Make something worth watching.",
    body:
      "Video, CGI, animation, and graphic design that give your ideas more character and your message more impact.",
    items: ["Video Production & Editing", "3D CGI & Rendering", "2D Animation & Motion Graphics", "Graphic Design & Ad Creative"],
    cta: "Explore Creative Services",
    href: "/creative-production",
  },
  {
    name: "Grow",
    preview: "/assets/macro.webp",
    lead: "Reach the right people. Make the spend count.",
    body:
      "SEO, paid media, content, and social management connected to the customers you want to reach and the actions that matter to your business.",
    items: ["SEO & Search Visibility", "Performance Marketing", "Social Media Management", "Campaign Measurement"],
    cta: "Explore Growth Services",
    href: "/services/seo-ai-search",
  },
  {
    name: "Connect",
    preview: "/assets/connect.webp",
    lead: "Don't lose momentum after the click.",
    body:
      "Bring forms, customer information, and everyday tools together to make inquiries and follow-ups easier to manage.",
    items: ["CRM & Tool Integrations", "Workflow Automation", "Lead Capture & Follow-Up"],
    cta: "Explore Integrations",
    href: "/services#connect",
  },
  {
    name: "Improve",
    preview: "/assets/world/poster.webp",
    lead: "Make better decisions with better information.",
    body:
      "Understand what's working, identify where people get stuck, and focus your time on improvements that serve the business.",
    items: ["Website & Conversion Reviews", "Analytics & Reporting", "Process & Performance Improvements"],
    cta: "Explore Optimization",
    href: "/services#improve",
  },
];

const insights = [
  {
    category: "Web Design",
    title: "Your website should do more than look good.",
    text: [
      "A strong website makes your business easier to understand and your next step easier to take.",
      "Start with a clear offer, useful information, credible proof, and a reason to get in touch.",
    ],
  },
  {
    category: "Search & Content",
    title: "Better visibility starts with better answers.",
    text: [
      "People search because they're looking for something specific. Your content should meet that need.",
      "Answer real questions, explain your services clearly, and make useful information easy to find.",
    ],
  },
  {
    category: "Design & Motion",
    title: "Not every movement moves things forward.",
    text: [
      "Animation should make a website easier to follow, not harder to use.",
      "When motion has a purpose, it can guide attention, explain ideas, and give a digital experience its own character.",
    ],
  },
];

const projectTypes = [
  ["Website", "Website Design & Development"],
  ["Search", "SEO & Search Visibility"],
  ["Paid marketing", "Paid Advertising & Performance Marketing"],
  ["Creative", "Creative Production"],
  ["Social media", "Social Media Management"],
  ["CRM & integrations", "CRM & Integrations"],
  ["Not sure yet", "Not Sure Yet"],
] as const;

function Index() {
  const root = useRef<HTMLDivElement>(null);
  const [activeStory, setActiveStory] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [inquiryReady, setInquiryReady] = useState(false);
  const [projectTypeError, setProjectTypeError] = useState("");

  const handleInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selectedProjectTypes = data.getAll("projectType").map(String);
    if (selectedProjectTypes.length === 0) {
      setProjectTypeError("Choose at least one starting point.");
      event.currentTarget.querySelector<HTMLInputElement>('input[name="projectType"]')?.focus();
      return;
    }
    setProjectTypeError("");
    const message = [
      "Hi Better Found Online, I'd like to discuss a project.",
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone")}`,
      data.get("company") ? `Company or Website: ${data.get("company")}` : "",
      `What I'm working on: ${selectedProjectTypes.join(", ")}`,
      `Project details: ${data.get("details")}`,
      `Marketing follow-up: ${data.get("marketingConsent") === "yes" ? "Yes - email or text is okay" : "No"}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/15707077078?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setInquiryReady(true);
  };

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(query.matches);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!reduced && !motionPaused) return;
    const beats = root.current?.querySelectorAll<HTMLElement>(".story-beat");
    if (!beats?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const index = Array.from(beats).findIndex((beat) => beat === visible.target);
          if (index !== -1) setActiveStory(index);
        }
      },
      { threshold: [0.2, 0.5, 0.8] }
    );

    beats.forEach((beat) => observer.observe(beat));
    return () => observer.disconnect();
  }, [reduced, motionPaused]);

  useEffect(() => {
    if (reduced || motionPaused) return;
    gsap.registerPlugin(ScrollTrigger);

    const smoothScroll = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches;
    const lenis = smoothScroll ? new Lenis({ duration: 1.1, smoothWheel: true }) : null;
    lenis?.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis?.raf(time * 1000);
    if (lenis) gsap.ticker.add(tick);

    const ctx = gsap.context(() => {
      gsap.set(".story-intro-copy, .story-intro-note", { autoAlpha: 0 });
      gsap.set(".story-intro-copy", { y: 72 });
      gsap.set(".story-intro-note", { y: 44 });

      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".hero-journey",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
        .to(".hero-copy", { autoAlpha: 0, yPercent: -20, scale: 0.96, duration: 0.28 }, 0.08)
        .to(".story-intro-copy", { autoAlpha: 1, y: 0, duration: 0.3 }, 0.4)
        .to(".story-intro-note", { autoAlpha: 1, y: 0, duration: 0.26 }, 0.5);

      gsap.utils.toArray<HTMLElement>(".story-beat").forEach((beat, index) => {
        ScrollTrigger.create({
          trigger: beat,
          start: "top 72%",
          end: "bottom 38%",
          onEnter: () => setActiveStory(index),
          onEnterBack: () => setActiveStory(index),
        });
      });

      gsap.utils.toArray<HTMLElement>(".section-heading, .service, .about-grid, .insight, .contact-top").forEach((element) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 38 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 86%", end: "bottom 14%", toggleActions: "play reverse play reverse" } });
      });

      gsap.utils.toArray<HTMLElement>(".reel-image img, .macro-window img").forEach((image) => {
        gsap.fromTo(image, { scale: 1.12, yPercent: -3 }, { scale: 1, yPercent: 3, ease: "none", scrollTrigger: { trigger: image, start: "top bottom", end: "bottom top", scrub: 1 } });
      });
    }, root);

    return () => {
      ctx.revert();
      if (lenis) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, [reduced, motionPaused]);

  return (
    <div ref={root} className={`${motionPaused ? "site motion-paused" : "site"}${reduced ? " reduced-motion" : ""}`}>
      <PageTransition />
      <PageSchema name="Web Design, SEO & Marketing | Better Found Online" path="/" description="Better Found Online builds websites and creates search, advertising, and digital experiences for service businesses and growing brands in the U.S. and beyond." />
      <a className="skip-link" href="#main">
        Skip to Content
      </a>
      <SiteHeader />

      <main id="main">
        <div className="tunnel-journey">
          <BrandTunnel paused={motionPaused} reducedMotion={reduced} />

          <div className="hero-journey">
            <section className="hero" id="home" aria-labelledby="hero-title">
              <div className="hero-copy">
                <p className="eyebrow">Web Design / SEO / Paid Ads / Creative</p>
                <h1 id="hero-title">
                  Get found.
                  <span>Get chosen.</span>
                </h1>
                <p className="hero-sub">
                  We build websites and create search, advertising, and digital experiences for service businesses and growing brands in the U.S. and beyond.
                </p>
                <div className="hero-actions">
                  <a href="#contact" className="primary-btn" data-cta>
                    Discuss Your Project <ArrowUpRight size={16} weight="light" aria-hidden="true" />
                  </a>
                  <a href="/work" className="story-link">
                    See Our Work <ArrowUpRight size={15} weight="light" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </section>

            <section className="story-intro section-pad" id="story">
              <div className="story-intro-copy">
                <p className="eyebrow">The way forward</p>
                <h2>
                  Getting noticed is one thing.<br />Being chosen is another.
                </h2>
              </div>
              <p className="story-intro-note">Make your message clear. Make your presence memorable. Make the next step easy.</p>
            </section>
          </div>

          <section className="story-sequence" aria-label="Website copy, design, and marketing">
            <div className="story-stage">
              <div className="story-stage-inner" aria-hidden="true">
                <div className="story-orbit orbit-a" />
                <div className="story-orbit orbit-b" />
                <div className="story-orbit orbit-c" />
                <span className="story-axis axis-one" />
                <span className="story-axis axis-two" />
                {storyChapters.map((chapter, index) => (
                  <img
                    key={chapter.id}
                    className={`story-art story-art-${index + 1}${activeStory === index ? " is-active" : ""}`}
                    src={chapter.image}
                    alt=""
                    loading="eager"
                    decoding="async"
                  />
                ))}
                <span className="story-stage-index">{storyChapters[activeStory]?.label} / 03</span>
                <span className="story-stage-caption">{storyChapters[activeStory]?.name}</span>
              </div>
              <nav className="story-stage-nav" aria-label="Explore how we help">
                {storyChapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    className={activeStory === index ? "story-stage-step active" : "story-stage-step"}
                    aria-current={activeStory === index ? "step" : undefined}
                    onClick={() => {
                      const beat = root.current?.querySelectorAll<HTMLElement>(".story-beat")[index];
                      beat?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
                    }}
                  >
                    <span>{chapter.label}</span>
                    <span className="story-stage-step-name">{chapter.name}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="story-beats">
              {storyChapters.map((chapter, index) => (
                <article key={chapter.id} className="story-beat">
                  <p className="eyebrow">{chapter.label} <span>/ {chapter.name}</span></p>
                  <div className="story-beat-copy">
                    <h3>{chapter.title}</h3>
                    <p>{chapter.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <ProjectReel />

        <section className="services section-pad" id="services" aria-labelledby="services-title">
          <div className="section-heading">
            <p className="eyebrow">What we do</p>
            <h2 id="services-title">Five ways to make<br />digital work harder.</h2>
            <p>From the first impression to the next opportunity, we bring together the right skills for the problem in front of you.</p>
          </div>

          <ServicesAccordion services={services} motionDisabled={reduced || motionPaused} />
        </section>

        <KineticBand />

        <section className="about" id="about" aria-label="About Better Found Online">
          <div className="about-statement section-pad">
            <p className="eyebrow">How we think</p>
            <h2>
              Good design gets attention.<br />
              <span>Good thinking gives it direction.</span>
            </h2>
            <div className="about-grid">
              <div className="macro-window">
                <img src="/assets/macro.webp" alt="Close-up of a precisely finished brushed-silver ribbon" width="1200" height="670" loading="lazy" />
              </div>
              <div className="about-copy">
                <p>A beautiful website means little if people can't understand your offer. More traffic means little if visitors don't know what to do next.</p>
                <p>We connect business goals, creative thinking, and practical execution so each part supports the next.</p>
                <ol>
                  <li>
                    <span>Understand</span>Find the real problem before choosing the solution.
                  </li>
                  <li>
                    <span>Connect</span>Make the message, experience, and tools work together.
                  </li>
                  <li>
                    <span>Improve</span>Learn from what happens and make the next decision count.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="insights section-pad" id="insights" aria-labelledby="insights-title">
          <div className="section-heading">
            <h2 id="insights-title">
              Good questions.<br />
              <span>Better digital decisions.</span>
            </h2>
            <p>Clear thinking on websites, search, design, and what makes digital work useful.</p>
          </div>

          <div className="insight-list">
            {insights.map((item, index) => (
              <details className="insight" key={item.category}>
                <summary>
                  <span className="insight-category">
                    <span className="tiny">0{index + 1}</span>
                    {item.category}
                  </span>
                  <h3>{item.title}</h3>
                  <span className="insight-arrow" aria-hidden="true">↗</span>
                </summary>
                <div className="article-body">
                  {item.text.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  <a href="#contact">
                    Discuss an Idea <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="contact section-pad" id="contact" aria-labelledby="contact-title">
          <div className="contact-aside">
            <h2 id="contact-title">Tell us what needs to work better.</h2>
            <p className="contact-intro">Select the services you need and describe the outcome.</p>
            <a href="https://wa.me/15707077078" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
              Prefer a quick message? WhatsApp us <span aria-hidden="true">↗</span>
            </a>
          </div>
          <form className="contact-form" onSubmit={handleInquiry}>
            <header className="contact-form-head">
              <h3>Project details</h3>
              <small>Required fields are marked *</small>
            </header>
            <div className="contact-field"><label htmlFor="contact-name">Your name *</label><input id="contact-name" name="name" autoComplete="name" placeholder="Enter your full name" required /></div>
            <div className="contact-field"><label htmlFor="contact-email">Your email *</label><input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></div>
            <div className="contact-field"><label htmlFor="contact-phone">Your phone *</label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Country code + number" required /></div>
            <div className="contact-field"><label htmlFor="contact-company">Company or website</label><input id="contact-company" name="company" autoComplete="organization" placeholder="Optional" /></div>
            <fieldset className="contact-project-types" aria-invalid={projectTypeError ? "true" : undefined} aria-describedby={projectTypeError ? "contact-project-error" : undefined}>
              <legend>Services * <span>Select all that apply</span></legend>
              <div className="contact-choice-grid">
                {projectTypes.map(([label, value]) => (
                  <label key={value} className="contact-choice">
                    <input name="projectType" type="checkbox" value={value} onChange={() => projectTypeError && setProjectTypeError("")} />
                    <span>{label}<Check size={14} weight="bold" aria-hidden="true" /></span>
                  </label>
                ))}
              </div>
              {projectTypeError && <p id="contact-project-error" className="contact-project-error" role="alert">{projectTypeError}</p>}
            </fieldset>
            <div className="contact-field contact-form-wide contact-goal"><label htmlFor="contact-details">Desired outcome *</label><textarea id="contact-details" name="details" rows={3} placeholder="What should change, and when?" required /></div>
            <div className="contact-form-actions">
              <label className="contact-marketing-consent"><input name="marketingConsent" type="checkbox" value="yes" /><span>Optional: email or text me about relevant services and updates.</span></label>
              <p className="contact-privacy-note">By continuing, you ask us to use these details to respond. WhatsApp receives the message only after you review and send it. See our <a href="/privacy">Privacy Notice</a>.</p>
              <button type="submit" data-cta>Review in WhatsApp <PaperPlaneTilt size={18} weight="light" aria-hidden="true" /></button>
            </div>
            {inquiryReady && <p className="contact-form-status" role="status">Your message is ready to review in WhatsApp. Nothing has been sent yet.</p>}
          </form>
        </section>
      </main>

      <SiteFooter motionPaused={motionPaused} onMotionToggle={() => setMotionPaused(!motionPaused)} />
    </div>
  );
}
