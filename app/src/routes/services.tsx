import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import { PageSchema } from "@/components/page-schema";
import { humanImages, editorialSrcSet } from "@/editorial-images";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({ meta: [
    { title: "Website, Creative & Marketing Services | Better Found Online" },
    { name: "description", content: "Explore web design, creative production, SEO, paid marketing, social media management, integrations, and digital optimization." },
    { property: "og:title", content: "Website, Creative & Marketing Services | Better Found Online" },
    { property: "og:description", content: "Explore web design, creative production, SEO, paid marketing, social media management, integrations, and digital optimization." },
  ], links: [{ rel: "canonical", href: "https://betterfoundonline.com/services" }] }),
});

const services = [
  {
    number: "01",
    name: "Build",
    cardTitle: "Website Design",
    category: "Websites / Digital Experiences",
    lead: "Websites that make enquiries easier.",
    body: "Plan, write, design and build a website that explains your services and makes contacting you easy.",
    items: ["Website Strategy & Positioning", "Website Design & Development", "User Experience & Conversion", "Interactive Digital Experiences"],
    result: "A distinctive digital presence that gives visitors a clear reason to stay, explore, and take action.",
    heroSummary: "Business websites and landing pages.",
    cta: "Explore Website Design",
    href: "/services/websites",
    image: humanImages.websiteWorkshop.src,
  },
  {
    number: "02",
    name: "Create",
    cardTitle: "Creative Production",
    category: "Video / CGI / Animation / Design",
    lead: "Video, CGI and design for campaigns.",
    body: "Create brand videos, product renders, animation and graphics for your website, social channels and advertising.",
    items: ["Video Production & Editing", "3D Design, CGI & Rendering", "2D Animation & Motion Graphics", "Trailers & Advertisement Videos", "Graphic Design & Campaign Assets"],
    result: "Distinctive creative content for websites, marketing campaigns, product presentations, and social channels.",
    heroSummary: "Video, animation, CGI and graphic design.",
    cta: "Explore Creative Production",
    href: "/creative-production",
    secondaryCta: "Discuss a Creative Project",
    secondaryHref: "/#contact",
    image: humanImages.creativeShoot.src,
  },
  {
    number: "03",
    name: "Grow",
    cardTitle: "SEO & Paid Media",
    category: "Search / Paid Media / Social",
    lead: "Search and ads for the right audience.",
    body: "Connect SEO, paid advertising and social content to relevant landing pages and tracked enquiries.",
    items: ["SEO & Search Visibility", "Performance Marketing", "Social Media Management", "Campaign Measurement"],
    result: "A clearer path from visibility to informed campaign decisions and meaningful customer action.",
    heroSummary: "Search visibility and paid campaigns.",
    cta: "Explore SEO & AI Search",
    href: "/services/seo-ai-search",
    secondaryCta: "Explore Performance Marketing",
    secondaryHref: "/services/performance-marketing",
    image: humanImages.campaignReview.src,
  },
  {
    number: "04",
    name: "Connect",
    cardTitle: "CRM & Automation",
    category: "CRM / Integrations / Automation",
    lead: "Enquiries delivered to the right team.",
    body: "Link forms, booking tools and your CRM so each enquiry reaches the people responsible for follow-up.",
    items: ["CRM & Form Integrations", "Booking & Inquiry Workflows", "Customer Information Handoffs", "Practical Workflow Automation"],
    result: "Fewer disconnected steps between an inquiry and the people responsible for responding.",
    heroSummary: "Forms, bookings and customer follow-up.",
    cta: "Discuss Integrations",
    href: "/#contact",
    image: humanImages.customerFollowup.src,
  },
  {
    number: "05",
    name: "Improve",
    cardTitle: "Analytics & Optimization",
    category: "Analytics / Reporting / Optimization",
    lead: "Know which changes to make next.",
    body: "Review website journeys and campaign data to find problems, prioritise improvements and track what changes.",
    items: ["Website & Conversion Reviews", "Analytics & Reporting", "Process & Workflow Reviews", "Ongoing Optimization"],
    result: "Clearer priorities, more useful information, and a practical direction for improvement.",
    heroSummary: "Website reviews and campaign reporting.",
    cta: "Discuss Improvements",
    href: "/#contact",
    image: humanImages.reportReview.src,
  },
];

const preloaderFrames = [
  services[0],
  services[1],
  services[2],
  services[3],
  services[4],
  services[1],
];

const engagementModels = [
  { number: "01", name: "Start with a review", label: "Strategy & Discovery", copy: "Review your website, offer and priorities before deciding what to build." },
  { number: "02", name: "Build a specific project", label: "Projects & Implementation", copy: "Commission a website, campaign, video or another clearly scoped deliverable." },
  { number: "03", name: "Get ongoing support", label: "Ongoing Support", copy: "Keep improving SEO, content, campaigns or creative with agreed ongoing work." },
];

function ServicesPage() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLParagraphElement>(null);
  const [featuredService, setFeaturedService] = useState(0);

  useLayoutEffect(() => {
    if (!root.current) return;

    gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);
    CustomEase.create("servicesHop", "0.8, 0, 0.2, 1");
    CustomEase.create("servicesHop2", "0.9, 0, 0.1, 1");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactMotion = reduceMotion || window.matchMedia("(max-width: 900px)").matches;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = compactMotion ? previousOverflow : "hidden";

    const context = gsap.context(() => {
      const splitText = (
        selector: string,
        type: "chars" | "words",
        className: string,
        mask = true,
      ) => SplitText.create(selector, {
        type,
        [`${type}Class`]: className,
        ...(mask ? { mask: type } : {}),
      });

      const preloaderHeaderSplit = splitText(
        ".services-preloader-title",
        "chars",
        "services-char",
      );
      gsap.set(".services-preloader-title", { visibility: "visible" });

      const supportingTargets = gsap.utils.toArray<HTMLElement>(
        ".services-page .brand, .services-page .menu-toggle, .services-hero-action",
      );

      if (compactMotion) {
        gsap.set(".services-preloader", { display: "none" });
        gsap.set(
          [".services-hero-title", ...supportingTargets],
          { y: "0%", autoAlpha: 1 },
        );
        gsap.set(".services-hero-card", { y: 0, scale: 1, rotate: 0, autoAlpha: 1 });
        gsap.set(".services-hero-art", { y: 0, autoAlpha: 1 });
      } else {
        const imageRotations = [7.5, -2.5, -10, 12.5, -5, 5];
        gsap.set(".services-preloader-img", { rotate: (index) => imageRotations[index] });
        gsap.set(supportingTargets, { y: 22, autoAlpha: 0 });
        gsap.set(preloaderHeaderSplit.chars, { y: "100%" });
        gsap.set(".services-hero-title", { y: 32, autoAlpha: 0 });
        gsap.set(".services-hero-card", { y: 56, scale: 0.96, rotate: 0, autoAlpha: 0 });
        gsap.set(".services-hero-art", { y: 32, autoAlpha: 0 });

        const timeline = gsap.timeline({ delay: 0.05 });
        const progress = { current: 0 };

        timeline.to(".services-preloader-img", {
          scale: 1,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1,
          ease: "servicesHop",
          stagger: 0.2,
        });
        timeline.to(preloaderHeaderSplit.chars, {
          y: "0%",
          duration: 1,
          ease: "servicesHop2",
          stagger: { each: 0.125, from: "random" },
        }, 0.35);
        timeline.to(".services-preloader-counter p", {
          y: "0%",
          duration: 1,
          ease: "servicesHop2",
        }, "<");
        timeline.to(progress, {
          current: 100,
          duration: 2.15,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counter.current) counter.current.textContent = String(Math.round(progress.current)).padStart(3, "0");
          },
        }, 0.85);
        timeline.to(".services-preloader-counter p", { y: "-100%", duration: 0.75, ease: "servicesHop2" }, 4.25);
        timeline.to(preloaderHeaderSplit.chars, {
          y: "-100%",
          duration: 0.75,
          ease: "servicesHop2",
          stagger: { each: 0.125, from: "random" },
        }, 4.25);
        timeline.to(".services-preloader-img", {
          scale: 0,
          clipPath: "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)",
          duration: 1,
          ease: "servicesHop2",
          stagger: -0.075,
        }, 4.5);
        timeline.to(".services-preloader", {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "servicesHop2",
          onComplete: () => {
            document.body.style.overflow = previousOverflow;
            gsap.set(".services-preloader", { autoAlpha: 0, pointerEvents: "none" });
          },
        }, 5.35);
        timeline.to(".services-hero-title", { y: 0, autoAlpha: 1, duration: 1, ease: "servicesHop" }, 5.65);
        timeline.to(".services-hero-art", { y: 0, autoAlpha: 1, duration: 1.2, ease: "servicesHop" }, 5.65);
        timeline.to(supportingTargets, {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "servicesHop",
          stagger: 0.075,
        }, 5.75);
        timeline.to(".services-hero-card", {
          y: 0,
          scale: 1,
          rotate: 0,
          autoAlpha: 1,
          duration: 1.05,
          ease: "servicesHop",
          stagger: 0.085,
        }, 5.82);

        // About 3.6 seconds overall, with a one-second hold on the settled title.
        timeline.timeScale(2);
      }

      if (!compactMotion) {
        gsap.utils.toArray<HTMLElement>(".service-chapter").forEach((chapter) => {
          const image = chapter.querySelector(".service-chapter-image");
          const copy = chapter.querySelectorAll(".service-chapter-copy > *");
          const number = chapter.querySelector(".service-chapter-number");

          gsap.fromTo(image, { clipPath: "inset(4% 4% 4% 4%)", scale: 1.03 }, {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: chapter, start: "top bottom", end: "top 72%", scrub: 0.25 },
          });
          gsap.fromTo(copy, { y: 16 }, {
            y: 0,
            duration: 0.35,
            ease: "power2.out",
            scrollTrigger: { trigger: chapter, start: "top 96%", once: true },
          });
          gsap.fromTo(number, { rotate: -10, autoAlpha: 0.2 }, {
            rotate: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: { trigger: chapter, start: "top bottom", end: "center center", scrub: 1 },
          });
        });

        gsap.utils.toArray<SVGPathElement>(".services-system-path").forEach((path) => {
          const length = path.getTotalLength();
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
          gsap.to(path, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: { trigger: ".services-system", start: "top 74%", end: "center 48%", scrub: 1 },
          });
        });
        gsap.to(".services-system-orbit", {
          rotate: 100,
          transformOrigin: "50% 50%",
          ease: "none",
          scrollTrigger: { trigger: ".services-system", start: "top bottom", end: "bottom top", scrub: 1.2 },
        });
        gsap.fromTo(".engagement-card", { y: 16 }, {
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          scrollTrigger: { trigger: ".engagement-grid", start: "top 96%", once: true },
        });
      }
    }, root);

    return () => {
      context.revert();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div ref={root} className="site interior-site services-page">
      <PageTransition />
      <PageSchema name="Website, Creative & Marketing Services | Better Found Online" path="/services" description="Better Found Online organizes its services into Build, Create, Grow, Connect, and Improve, covering websites, creative production, marketing, integrations, and optimization." />
      <a className="skip-link" href="#main">Skip to Content</a>
      <SiteHeader brandTone="dark" />

      <div className="services-preloader" aria-hidden="true">
        <div className="services-preloader-images">
          {preloaderFrames.map((service, index) => (
            <div className="services-preloader-img" key={`${service.name}-${index}`}>
              <img src={service.image} srcSet={editorialSrcSet(service.image)} sizes="20vw" alt="" />
            </div>
          ))}
        </div>
        <div className="services-preloader-header">
          <p className="services-preloader-title" aria-hidden="true">Services</p>
          <div className="services-preloader-counter"><p ref={counter}>000</p></div>
        </div>
      </div>

      <main id="main">
        <section className="services-hero" aria-labelledby="services-page-title">
          <div className="services-hero-intro">
            <p className="services-hero-kicker">Our services</p>
            <h1 className="services-hero-title" id="services-page-title"><span>Websites, creative </span><span>&amp; marketing.</span></h1>
            <p className="services-hero-description">Websites, creative and campaigns built to bring the right customers to your business.</p>
            <div className="services-hero-cta">
              <TransitionLink href="/#contact" className="services-hero-action services-hero-action-primary">
                Discuss Your Project <ArrowUpRight size={20} aria-hidden="true" />
              </TransitionLink>
              <TransitionLink href="/work" className="services-hero-action services-hero-action-secondary">
                See Our Work <ArrowUpRight size={20} aria-hidden="true" />
              </TransitionLink>
            </div>
          </div>
          <div className="services-hero-art" aria-hidden="true">
            <div className="services-hero-photo-stack">
              {services.map((service, index) => (
                <div className="services-hero-photo" key={service.name} data-depth={(index - featuredService + services.length) % services.length}>
                  <img src={service.image} srcSet={editorialSrcSet(service.image)} sizes="(max-width: 600px) 85vw, (max-width: 1100px) 65vw, 42vw" width="1440" height="960" alt="" />
                </div>
              ))}
            </div>
            <p className="services-hero-art-caption"><b>{services[featuredService].cardTitle}</b><span>{services[featuredService].heroSummary}</span></p>
          </div>
          <nav className="services-hero-cards" aria-label="Explore our services">
            {services.map((service, index) => (
              <a className="services-hero-card" href={`#${service.name.toLowerCase()}`} key={service.name} aria-label={`Explore ${service.cardTitle}`} data-featured={index === featuredService} onPointerEnter={() => setFeaturedService(index)} onFocus={() => setFeaturedService(index)}>
                <span className="services-hero-card-copy"><b>{service.cardTitle}</b></span>
                <span className="services-hero-card-arrow"><ArrowUpRight size={23} aria-hidden="true" /></span>
              </a>
            ))}
          </nav>
        </section>

        <section className="service-stack" id="service-stack" aria-label="Service areas">
          {services.map((service) => (
            <article className="service-chapter" id={service.name.toLowerCase()} key={service.name}>
              <div className="service-chapter-number" aria-hidden="true">{service.number}</div>
              <div className="service-chapter-visual">
                <img className="service-chapter-image" src={service.image} srcSet={editorialSrcSet(service.image)} sizes="(max-width: 900px) 100vw, 45vw" alt="" loading="lazy" decoding="async" />
              </div>
              <div className="service-chapter-copy">
                <p className="service-chapter-label">{service.name} / {service.category}</p>
                <h2>{service.lead}</h2>
                <p>{service.body}</p>
                <ul>
                  {service.items.map((item) => <li key={item}><span aria-hidden="true" />{item}</li>)}
                </ul>

                <div className="service-chapter-actions">
                  <TransitionLink href={service.href}>{service.cta} <ArrowUpRight size={18} weight="light" /></TransitionLink>
                  {"secondaryCta" in service && service.secondaryCta && <TransitionLink href={service.secondaryHref}>{service.secondaryCta} <ArrowUpRight size={18} weight="light" /></TransitionLink>}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="services-system section-pad" aria-labelledby="system-title">
          <div className="services-system-copy">
            <p className="services-system-label">The multiplier</p>
            <h2 id="system-title">Connect your website,<br />ads and follow-up.</h2>
            <p>Send campaigns to useful pages, route enquiries to the right people and track what happens after each click.</p>
            <p>Book one service or combine the work your project needs.</p>
          </div>
          <div className="services-system-visual" aria-hidden="true">
            <svg viewBox="0 0 760 760" role="presentation">
              <g className="services-system-orbit">
                <circle cx="380" cy="380" r="302" />
                <ellipse cx="380" cy="380" rx="336" ry="142" transform="rotate(38 380 380)" />
                <ellipse cx="380" cy="380" rx="336" ry="142" transform="rotate(-38 380 380)" />
              </g>
              <path className="services-system-path" d="M380 78 C380 188 380 266 380 380" />
              <path className="services-system-path" d="M667 286 C560 320 492 342 380 380" />
              <path className="services-system-path" d="M557 624 C492 534 450 475 380 380" />
              <path className="services-system-path" d="M203 624 C268 534 310 475 380 380" />
              <path className="services-system-path" d="M93 286 C200 320 268 342 380 380" />
              <circle className="services-system-core" cx="380" cy="380" r="78" />
            </svg>
            <span className="system-node system-node-build">Website</span>
            <span className="system-node system-node-create">Creative</span>
            <span className="system-node system-node-grow">Search &amp; Ads</span>
            <span className="system-node system-node-connect">Follow-up</span>
            <span className="system-node system-node-improve">Reporting</span>
            <strong>Customer</strong>
          </div>
        </section>

        <section className="engagements section-pad" aria-labelledby="engagement-title">
          <div className="engagements-heading">
            <p className="engagements-label">Ways to work together</p>
            <h2 id="engagement-title">Choose how we work together.</h2>
          </div>
          <div className="engagement-grid">
            {engagementModels.map((model) => (
              <article className="engagement-card" key={model.name}>
                <span>{model.number}</span>
                <h3>{model.name}</h3>
                <b>{model.label}</b>
                <p>{model.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="services-closing section-pad">
          <p>Have an idea?</p>
          <h2>Ready to discuss your project?</h2>
          <p className="services-closing-support">Tell us what you need, what you're trying to achieve, and where you're getting stuck.</p>
          <a href="https://wa.me/15707077078" target="_blank" rel="noopener noreferrer">
            Discuss Your Project <ArrowUpRight size={30} weight="light" />
          </a>
        </section>
      </main>
      <SiteFooter showProjectCta={false} />
    </div>
  );
}
