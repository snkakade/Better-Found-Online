import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import { PageSchema } from "@/components/page-schema";

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
    category: "Websites / Digital Experiences",
    lead: "Make your website worth visiting.",
    body: "Your website should make your business easy to understand, credible, and simple to contact. We bring strategy, messaging, design, and development together to create a digital experience with a clear purpose.",
    items: ["Website Strategy & Positioning", "Website Design & Development", "User Experience & Conversion", "Interactive Digital Experiences"],
    result: "A distinctive digital presence that gives visitors a clear reason to stay, explore, and take action.",
    cardLine: "Websites / Digital Experience",
    cta: "Explore Website Design",
    href: "/services/websites",
    image: "/assets/service-cards/build.jpg",
  },
  {
    number: "02",
    name: "Create",
    category: "Video / CGI / Animation / Design",
    lead: "Make your message worth seeing.",
    body: "From polished campaign videos to detailed 3D visuals, we create content that helps brands show what words alone cannot. Every format starts with the message, the audience, and what the content needs to accomplish.",
    items: ["Video Production & Editing", "3D Design, CGI & Rendering", "2D Animation & Motion Graphics", "Trailers & Advertisement Videos", "Graphic Design & Campaign Assets"],
    result: "Distinctive creative content for websites, marketing campaigns, product presentations, and social channels.",
    cardLine: "Video / CGI / Animation / Design",
    cta: "Explore Creative Production",
    href: "/creative-production",
    secondaryCta: "Discuss a Creative Project",
    secondaryHref: "/#contact",
    image: "/assets/service-cards/create.jpg",
  },
  {
    number: "03",
    name: "Grow",
    category: "Search / Paid Media / Social",
    lead: "Reach the right people. Make the spend count.",
    body: "SEO, paid media, content, and social management connected to the customers you want to reach and the actions that matter to your business.",
    items: ["SEO & Search Visibility", "Performance Marketing", "Social Media Management", "Campaign Measurement"],
    result: "A clearer path from visibility to informed campaign decisions and meaningful customer action.",
    cardLine: "Search / Paid Media / Social",
    cta: "Explore SEO & AI Search",
    href: "/services/seo-ai-search",
    secondaryCta: "Explore Performance Marketing",
    secondaryHref: "/services/performance-marketing",
    image: "/assets/service-cards/grow.jpg",
  },
  {
    number: "04",
    name: "Connect",
    category: "CRM / Integrations / Automation",
    lead: "Make the next step easier for everyone.",
    body: "A customer journey doesn't end with a form submission. We help connect selected tools, information, and simple workflows so inquiries reach the right place and follow-up becomes easier.",
    items: ["CRM & Form Integrations", "Booking & Inquiry Workflows", "Customer Information Handoffs", "Practical Workflow Automation"],
    result: "Fewer disconnected steps between an inquiry and the people responsible for responding.",
    cardLine: "CRM / Integrations / Automation",
    cta: "Discuss Integrations",
    href: "/#contact",
    image: "/assets/service-cards/connect.jpg",
  },
  {
    number: "05",
    name: "Improve",
    category: "Analytics / Reporting / Optimization",
    lead: "Find the friction. Make the next move.",
    body: "Better decisions start with understanding what's happening. We review websites, customer journeys, and available performance information to identify practical improvements worth making.",
    items: ["Website & Conversion Reviews", "Analytics & Reporting", "Process & Workflow Reviews", "Ongoing Optimization"],
    result: "Clearer priorities, more useful information, and a practical direction for improvement.",
    cardLine: "Performance / Reporting / Process",
    cta: "Discuss Improvements",
    href: "/#contact",
    image: "/assets/service-cards/improve.jpg",
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
  { number: "01", name: "Find the direction", label: "Strategy & Discovery", copy: "When the challenge isn't clear, start by understanding the audience, the problem, and the priorities." },
  { number: "02", name: "Build the experience", label: "Projects & Implementation", copy: "For businesses ready to create a website, campaign, video, visual asset, or another clearly defined digital project." },
  { number: "03", name: "Keep moving", label: "Ongoing Support", copy: "For businesses that need continued work across SEO, content, social media, campaigns, creative production, or measurable improvements." },
];

function ServicesPage() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;

    gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);
    CustomEase.create("servicesHop", "0.8, 0, 0.2, 1");
    CustomEase.create("servicesHop2", "0.9, 0, 0.1, 1");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactMotion = reduceMotion || window.matchMedia("(max-width: 800px)").matches;
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
      const heroHeaderSplit = splitText(
        ".services-hero-title",
        "chars",
        "services-char",
        false,
      );
      const footerSplit = splitText(
        ".services-hero-footer p",
        "words",
        "services-word",
      );

      gsap.set(".services-preloader-title", { visibility: "visible" });

      const supportingTargets = gsap.utils.toArray<HTMLElement>(
        ".services-page .brand, .services-page .menu-toggle, .services-hero-action",
      );

      if (compactMotion) {
        gsap.set(".services-preloader", { display: "none" });
        gsap.set(
          [...heroHeaderSplit.chars, ...footerSplit.words, ...supportingTargets],
          { y: "0%", autoAlpha: 1 },
        );
        gsap.set(".services-hero-card", { y: 0, scale: 1, rotate: 0, autoAlpha: 1 });
      } else {
        const imageRotations = [7.5, -2.5, -10, 12.5, -5, 5];
        gsap.set(".services-preloader-img", { rotate: (index) => imageRotations[index] });
        gsap.set(supportingTargets, { y: 22, autoAlpha: 0 });
        gsap.set(preloaderHeaderSplit.chars, { y: "100%" });
        gsap.set(heroHeaderSplit.chars, { y: "100%" });
        gsap.set(footerSplit.words, { y: "100%" });
        gsap.set(".services-hero-card", { y: 56, scale: 0.96, rotate: 0, autoAlpha: 0 });

        const timeline = gsap.timeline({ delay: 0.05 });

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
          onStart: () => {
            const value = { current: 0 };
            gsap.to(value, {
              current: 100,
              duration: 2,
              delay: 0.5,
              ease: "power2.inOut",
              onUpdate: () => {
                if (counter.current) counter.current.textContent = String(Math.round(value.current)).padStart(3, "0");
              },
            });
          },
        }, "<");
        timeline.to(".services-preloader-counter p", { y: "-100%", duration: 0.75, ease: "servicesHop2" }, 3.25);
        timeline.to(preloaderHeaderSplit.chars, {
          y: "-100%",
          duration: 0.75,
          ease: "servicesHop2",
          stagger: { each: 0.125, from: "random" },
        }, 3.25);
        timeline.to(".services-preloader-img", {
          scale: 0,
          clipPath: "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)",
          duration: 1,
          ease: "servicesHop2",
          stagger: -0.075,
        }, 3.5);
        timeline.to(".services-preloader", {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "servicesHop2",
          onComplete: () => {
            document.body.style.overflow = previousOverflow;
            gsap.set(".services-preloader", { autoAlpha: 0, pointerEvents: "none" });
          },
        }, 4.35);
        timeline.to(heroHeaderSplit.chars, {
          y: "0%",
          duration: 1,
          ease: "servicesHop",
          stagger: { each: 0.075, from: "random" },
        }, 4.65);
        timeline.to(supportingTargets, {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "servicesHop",
          stagger: 0.075,
        }, 4.75);
        timeline.to(footerSplit.words, { y: "0%", duration: 1, ease: "servicesHop", stagger: 0.075 }, 4.75);
        timeline.to(".services-hero-card", {
          y: 0,
          scale: 1,
          rotate: 0,
          autoAlpha: 1,
          duration: 1.05,
          ease: "servicesHop",
          stagger: 0.085,
        }, 4.82);
      }

      if (!compactMotion) {
        gsap.utils.toArray<HTMLElement>(".service-chapter").forEach((chapter) => {
          const image = chapter.querySelector(".service-chapter-image");
          const copy = chapter.querySelectorAll(".service-chapter-copy > *");
          const number = chapter.querySelector(".service-chapter-number");

          gsap.fromTo(image, { clipPath: "inset(14% 14% 14% 14%)", scale: 1.16 }, {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: chapter, start: "top 85%", end: "center 45%", scrub: 1 },
          });
          gsap.fromTo(copy, { y: 56, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.07,
            scrollTrigger: { trigger: chapter, start: "top 70%", end: "bottom 18%", toggleActions: "play reverse play reverse" },
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
        gsap.fromTo(".engagement-card", { y: 70, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".engagement-grid", start: "top 82%", end: "bottom 18%", toggleActions: "play reverse play reverse" },
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
              <img src={service.image} alt="" />
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
          <div className="services-hero-heading">
            <h1 className="services-hero-title" id="services-page-title">What we do.</h1>
          </div>
          <div className="services-hero-meta">
            <div className="services-hero-footer" aria-label="Our five service areas">
              <p>Build with clarity.</p>
              <p>Create with character.</p>
              <p>Grow with purpose.</p>
              <p>Connect the journey.</p>
              <p>Improve what matters.</p>
            </div>
            <TransitionLink href="/#contact" className="services-hero-action">
              Discuss Your Project <ArrowUpRight size={19} weight="light" />
            </TransitionLink>
          </div>
          <div className="services-hero-cards">
            {services.map((service) => (
              <a className="services-hero-card" href={`#${service.name.toLowerCase()}`} key={service.name} aria-label={`Explore ${service.name}`}>
                <img src={service.image} alt="" />
                <span><b>{service.name}</b><small>{service.cardLine}</small></span>
              </a>
            ))}
          </div>
        </section>

        <section className="services-opening section-pad">
          <div>
            <p className="eyebrow">One connected approach</p>
            <h2>Different disciplines. One clear direction.</h2>
          </div>
          <div className="services-opening-note">
            <span>From First Impression to First Inquiry</span>
            <p>Your customers don't separate design, content, websites, and marketing. They experience one business. We bring the right pieces together to make that experience work.</p>
          </div>
        </section>

        <section className="service-stack" id="service-stack" aria-label="Service areas">
          {services.map((service) => (
            <article className="service-chapter" id={service.name.toLowerCase()} key={service.name}>
              <div className="service-chapter-number" aria-hidden="true">{service.number}</div>
              <div className="service-chapter-visual">
                <img className="service-chapter-image" src={service.image} alt="" loading="lazy" />
              </div>
              <div className="service-chapter-copy">
                <p className="service-chapter-label">{service.name} / {service.category}</p>
                <h2>{service.lead}</h2>
                <p>{service.body}</p>
                <ul>
                  {service.items.map((item) => <li key={item}><span aria-hidden="true" />{item}</li>)}
                </ul>
                <div className="service-result"><span>What This Makes Possible</span><p>{service.result}</p></div>
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
            <h2 id="system-title">Better work happens<br />when the pieces connect.</h2>
            <p>A strong website gives your message a home. Better creative gives people a reason to pay attention. Search and marketing help the right people find it. Connected tools and measurement help you decide what comes next.</p>
            <p>Each service can stand alone. Together, they can make more sense.</p>
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
            <span className="system-node system-node-build">Build</span>
            <span className="system-node system-node-create">Create</span>
            <span className="system-node system-node-grow">Grow</span>
            <span className="system-node system-node-connect">Connect</span>
            <span className="system-node system-node-improve">Improve</span>
            <strong>Progress</strong>
          </div>
        </section>

        <section className="engagements section-pad" aria-labelledby="engagement-title">
          <div className="engagements-heading">
            <p className="engagements-label">Ways to work together</p>
            <h2 id="engagement-title">Start where it matters.</h2>
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
          <h2>Let's make it happen.</h2>
          <p className="services-closing-support">Tell us what you need, what you're trying to achieve, and where you're getting stuck.</p>
          <a href="https://wa.me/15707077078" target="_blank" rel="noopener noreferrer">
            Discuss Your Project <ArrowUpRight size={30} weight="light" />
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
