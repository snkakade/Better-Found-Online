import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";
import { BrandTunnel } from "@/components/brand-tunnel";
import { KineticBand } from "@/components/kinetic-band";
import { ProjectReel } from "@/components/project-reel";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import { PageSchema } from "@/components/page-schema";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Better Found Online | Websites, SEO & Performance Marketing" },
      { name: "description", content: "Better Found Online helps businesses get found, understood, and chosen through strategy, websites, SEO, performance marketing, and creative production." },
      { name: "robots", content: "index, follow, max-image-preview:large" },
    ],
    links: [{ rel: "canonical", href: "https://betterfoundonline.com/" }],
  }),
});

const storyChapters = [
  {
    id: "discover",
    label: "01",
    name: "Find the signal",
    title: "Find what matters. Fix what doesn't.",
    body:
      "We look at your business from the customer's perspective. What are they searching for? What makes you different? What's stopping them from taking action?",
    detail: "Research / Positioning / Strategy",
    image: "/assets/portals.webp",
  },
  {
    id: "shape",
    label: "02",
    name: "Give it form",
    title: "Make your value impossible to miss.",
    body:
      "We turn your offer into clear messaging and a distinctive digital experience. Every headline, layout, and interaction should help people understand why your business matters.",
    detail: "Messaging / Design / Experience",
    image: "/assets/macro.webp",
  },
  {
    id: "launch",
    label: "03",
    name: "Make it move",
    title: "Turn attention into action.",
    body:
      "A website is only part of the journey. We bring search, marketing, and the right digital tools together to make the next step easier.",
    detail: "Development / Integration / Growth",
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

function Index() {
  const root = useRef<HTMLDivElement>(null);
  const [activeStory, setActiveStory] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [inquiryReady, setInquiryReady] = useState(false);

  const handleInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      "Hi Better Found Online, I'd like to discuss a project.",
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone")}`,
      data.get("company") ? `Company or Website: ${data.get("company")}` : "",
      `What I'm working on: ${data.get("projectType")}`,
      `Project details: ${data.get("details")}`,
      `Marketing follow-up: ${data.get("marketingConsent") === "yes" ? "Yes — email or text is okay" : "No"}`,
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

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    const tunnelElement = root.current?.querySelector<HTMLElement>(".brand-tunnel");
    let tunnelRevealCall: gsap.core.Tween | null = null;

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
        .to(".journey-veil", { opacity: 0.54, duration: 0.34 }, 0.24)
        .to(".story-intro-copy", { autoAlpha: 1, y: 0, duration: 0.3 }, 0.4)
        .to(".story-intro-note", { autoAlpha: 1, y: 0, duration: 0.26 }, 0.5)
        .to(".brand-tunnel", { opacity: 0.78, duration: 0.2 }, 0.8);

      const artworks = gsap.utils.toArray<HTMLElement>(".story-art");
      gsap.set(artworks, {
        autoAlpha: 0,
        filter: "blur(10px)",
        scale: 0.68,
        transformPerspective: 1200,
        z: -680,
      });

      const activateChapter = (index: number) => {
        const target = artworks[index];
        if (!target) return;

        const opacity = artworks.map((artwork) => Number.parseFloat(gsap.getProperty(artwork, "opacity") as string) || 0);
        const dominantIndex = opacity.reduce(
          (strongest, value, artworkIndex) => value > opacity[strongest] ? artworkIndex : strongest,
          0
        );
        const outgoing = dominantIndex === index ? null : artworks[dominantIndex];

        setActiveStory(index);
        tunnelRevealCall?.kill();
        if (tunnelElement) {
          tunnelElement.dataset.storyAssets = outgoing
            ? `${dominantIndex},${index}`
            : String(index);
          if (outgoing) {
            tunnelRevealCall = gsap.delayedCall(0.62, () => {
              tunnelElement.dataset.storyAssets = String(index);
            });
          }
        }
        gsap.killTweensOf(artworks);

        // A fast scroll can cross more than one chapter threshold before the
        // previous crossfade has finished. Remove any half-visible intermediary
        // immediately so only one outgoing and one incoming artwork can blend.
        artworks.forEach((artwork, artworkIndex) => {
          if (artworkIndex !== index && artwork !== outgoing) {
            gsap.set(artwork, {
              autoAlpha: 0,
              filter: "blur(10px)",
              scale: 0.68,
              rotateY: 0,
              z: -680,
            });
          }
        });

        if (opacity[index] < 0.05) {
          gsap.set(target, {
            autoAlpha: 0,
            filter: "blur(10px)",
            scale: 0.68,
            rotateY: index % 2 === 0 ? -5 : 5,
            z: -680,
          });
        }

        const chapterTransition = gsap.timeline();
        if (outgoing) {
          chapterTransition.to(outgoing, {
            autoAlpha: 0,
            filter: "blur(7px)",
            scale: 1.16,
            z: 360,
            duration: 0.54,
            ease: "power2.in",
            overwrite: true,
          }, 0);
        }
        chapterTransition.to(target, {
            autoAlpha: 1,
            filter: "blur(0px)",
            scale: 1,
            rotateY: 0,
            z: 0,
            duration: 0.86,
            ease: "power3.out",
            overwrite: true,
          }, outgoing ? 0.16 : 0);
        gsap.to(".story-orbit", { rotate: index * 28, duration: 1, ease: "power2.out" });
      };

      const returnFirstChapterToTunnel = () => {
        const firstArtwork = artworks[0];
        if (!firstArtwork) return;
        tunnelRevealCall?.kill();
        tunnelElement?.removeAttribute("data-story-assets");
        gsap.killTweensOf(firstArtwork);
        gsap.to(firstArtwork, {
          autoAlpha: 0,
          filter: "blur(10px)",
          scale: 0.68,
          z: -680,
          duration: 0.7,
          ease: "power2.inOut",
          overwrite: true,
        });
      };

      gsap.utils.toArray<HTMLElement>(".story-beat").forEach((beat, index) => {
        ScrollTrigger.create({
          trigger: beat,
          start: "top 72%",
          end: "bottom 38%",
          onEnter: () => activateChapter(index),
          onEnterBack: () => activateChapter(index),
          onLeaveBack: index === 0 ? returnFirstChapterToTunnel : undefined,
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
      tunnelRevealCall?.kill();
      tunnelElement?.removeAttribute("data-story-assets");
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reduced, motionPaused]);

  return (
    <div ref={root} className={`${motionPaused ? "site motion-paused" : "site"}${reduced ? " reduced-motion" : ""}`}>
      <PageTransition />
      <PageSchema name="Web Design, SEO & Marketing | Better Found Online" path="/" description="Better Found Online offers website design, SEO, digital marketing, creative production, and connected digital services for growing businesses." />
      <a className="skip-link" href="#main">
        Skip to Content
      </a>
      <SiteHeader frostFromSelector=".story-intro" />

      <main id="main">
        <div className="tunnel-journey">
          <BrandTunnel paused={motionPaused} reducedMotion={reduced} />
          <div className="journey-veil" aria-hidden="true" />

          <div className="hero-journey">
            <section className="hero" id="home" aria-labelledby="hero-title">
              <div className="hero-backdrop" aria-hidden="true"><div className="hero-grain" /></div>

              <div className="hero-copy">
                <h1 id="hero-title">
                  Get found.
                  <span>Get chosen.</span>
                </h1>
                <p className="hero-sub">
                  Websites, SEO, digital marketing, and creative content that help growing businesses stand out, communicate their value, and turn interest into action.
                  <small>For businesses in the U.S. and beyond.</small>
                </p>
                <div className="hero-actions">
                  <a href="#contact" className="primary-btn">
                    Discuss Your Project <ArrowUpRight size={16} weight="light" aria-hidden="true" />
                  </a>
                  <a href="/work" className="story-link">
                    Explore Our Work <ArrowUpRight size={15} weight="light" aria-hidden="true" />
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

          <section className="story-sequence" aria-label="How we create momentum">
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
              <nav className="story-stage-nav" aria-label="Choose a story chapter">
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
                    <p className="story-detail">{chapter.detail}</p>
                  </div>
                  <span className="story-beat-rule" aria-hidden="true" />
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

          <div className="service-list">
            {services.map((service, index) => (
              <details className="service" key={service.name} name="services" open={index === 0 ? true : undefined}>
                <summary>
                  <span className="service-number">0{index + 1}</span>
                  <h3>{service.name}</h3>
                  <span className="service-lead">{service.lead}</span>
                  <span className="service-preview" aria-hidden="true"><img src={service.preview} alt="" loading="lazy" /></span>
                  <span className="expand" aria-hidden="true">+</span>
                </summary>
                <div className="service-content">
                  <p>{service.body}</p>
                  <ul>
                    {service.items.map((item) => (
                      <li key={item}>{service.name === "Grow" && item === "Performance Marketing" ? <TransitionLink href="/services/performance-marketing">{item}</TransitionLink> : service.name === "Grow" && item === "SEO & Search Visibility" ? <TransitionLink href="/services/seo-ai-search">{item}</TransitionLink> : service.name === "Build" && item === "Website Design & Development" ? <TransitionLink href="/services/websites">{item}</TransitionLink> : item}</li>
                    ))}
                  </ul>
                  <TransitionLink href={service.href}>
                    {service.cta} <span aria-hidden="true">↗</span>
                  </TransitionLink>
                </div>
              </details>
            ))}
          </div>
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

          {!motionPaused ? <ScrollScrub scenes={scrollScrubScenes} theme={scrollScrubTheme} /> : <div className="static-chapter section-pad"><p className="eyebrow">Our approach</p><h2>Better together.</h2><p>Your brand, website, marketing, and digital tools shouldn't pull in different directions. We bring the right pieces together to create a more connected experience for your customers and your business.</p></div>}
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
          <div className="contact-top">
            <div>
              <p id="contact-title">Have something worth<br />making better?</p>
              <p className="contact-intro">Whether it's a website, campaign, video, or something more complex, tell us what you're working on.</p>
            </div>
            <a href="https://wa.me/15707077078" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
              Message on WhatsApp <span aria-hidden="true">↗</span>
            </a>
          </div>
          <form className="contact-form" onSubmit={handleInquiry}>
            <label>Your Name<input name="name" autoComplete="name" required /></label>
            <label>Your Email<input name="email" type="email" autoComplete="email" required /></label>
            <label>Your Phone<input name="phone" type="tel" autoComplete="tel" inputMode="tel" required /></label>
            <label>Company or Website (Optional)<input name="company" autoComplete="organization" /></label>
            <label>What Are You Working On?<select name="projectType" defaultValue="" required><option value="" disabled>Select a service</option><option>Website Design &amp; Development</option><option>Website Redesign</option><option>Landing Page</option><option>Ecommerce Website</option><option>SEO &amp; Search Visibility</option><option>Technical SEO</option><option>AI Search &amp; GEO</option><option>Content Strategy</option><option>Paid Advertising &amp; Performance Marketing</option><option>Social Media Management</option><option>Video Production &amp; Editing</option><option>3D CGI &amp; Rendering</option><option>Motion Graphics &amp; Animation</option><option>Graphic Design</option><option>CRM &amp; Integrations</option><option>Website &amp; Marketing Optimization</option><option>Not Sure Yet</option></select></label>
            <label className="contact-form-wide">Tell Us a Little About Your Project<textarea name="details" rows={5} required /></label>
            <label className="contact-form-wide contact-marketing-consent"><input name="marketingConsent" type="checkbox" value="yes" /><span>Yes, Better Found Online may email or text me about relevant services and updates. Consent is optional and not required to submit.</span></label>
            <button type="submit">Send Your Inquiry <span aria-hidden="true">↗</span></button>
            {inquiryReady && <p className="contact-form-status" role="status">Your message is ready to review in WhatsApp. Nothing has been sent yet.</p>}
          </form>
          <a className="contact-title" href="#contact">Discuss Your Project<span aria-hidden="true">↗</span></a>
          <div className="contact-bottom">
            <a className="phone" href="tel:+15707077078">
              +1 (570) 707-7078
            </a>
            <span>Found. Understood. Chosen.</span>
          </div>
        </section>
      </main>

      <SiteFooter motionPaused={motionPaused} onMotionToggle={() => setMotionPaused(!motionPaused)} />
    </div>
  );
}
