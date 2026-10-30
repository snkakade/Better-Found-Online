import { ArrowUpRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink } from "@/components/site-chrome";
import { WebsitePreview } from "@/components/website-preview";

const projects = [
  { title: "Premium presentation. Clear purpose.", name: "CharterX", type: "Website / Digital Experience", video: "/assets/service-pages/websites/charterx.webm", mp4: "/assets/service-pages/websites/charterx.mp4", text: "A polished website experience that brings structure and character to specialist yacht services while presenting the offer clearly." },
  { title: "A specialist product, made easier to explore.", name: "Say Vanilla", type: "Website Strategy / Design / Development", video: "/assets/service-pages/websites/say-vanilla.webm", mp4: "/assets/service-pages/websites/say-vanilla.mp4", text: "A tactile website that gives an ingredient-led brand space to explain its product, build confidence, and make discovery feel effortless." },
  { title: "Stand out in a market full of sameness.", name: "Tech Sales Sourced", type: "Positioning / Website Development", video: "/assets/service-pages/websites/tech-sales.webm", mp4: "/assets/service-pages/websites/tech-sales.mp4", text: "Focused messaging and clear journeys help a specialist recruitment business communicate its value to hiring teams and candidates." },
];

export function ProjectReel() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(".reel-card"));
    const observer = new IntersectionObserver((entries) => {
      if (section.current?.dataset.scrollDriven === "true") return;
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(items.indexOf(visible.target as HTMLElement));
    }, { root, threshold: [0.55, 0.8] });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const region = section.current;
    const root = track.current;
    if (!region || !root) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(min-width: 901px) and (min-height: 680px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      region.dataset.scrollDriven = "true";
      const cards = Array.from(root.querySelectorAll<HTMLElement>(".reel-card"));
      const pin = region.querySelector<HTMLElement>(".reel-pin")!;
      let maxScroll = 0;
      let travel = 1;
      let currentIndex = -1;
      const measure = () => {
        const headerHeight = document.querySelector(".header")?.getBoundingClientRect().height ?? 80;
        region.style.setProperty("--reel-header", `${headerHeight}px`);
        maxScroll = Math.max(0, root.scrollWidth - root.clientWidth);
        travel = Math.max(maxScroll * 0.8, window.innerHeight);
        region.style.height = `${pin.offsetHeight + travel}px`;
      };
      measure();
      const tween = gsap.fromTo(root, { scrollLeft: 0 }, {
        scrollLeft: () => maxScroll,
        ease: "none",
        scrollTrigger: {
          trigger: region,
          start: () => `top ${region.style.getPropertyValue("--reel-header")}`,
          end: () => `+=${travel}`,
          scrub: 0.3,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
        },
        onUpdate: () => {
          const center = root.scrollLeft + root.clientWidth / 2;
          const nearest = cards.reduce((best, card, index) => {
            const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
            return distance < best.distance ? { distance, index } : best;
          }, { distance: Infinity, index: 0 }).index;
          if (nearest !== currentIndex) { currentIndex = nearest; setActive(nearest); }
        },
      });
      const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(refreshFrame);
        tween.scrollTrigger?.kill();
        tween.revert();
        region.style.removeProperty("height");
        region.style.removeProperty("--reel-header");
        delete region.dataset.scrollDriven;
      };
    });
    return () => media.revert();
  }, []);

  return (
    <section className="work-reel" aria-labelledby="work-reel-title" ref={section}>
      <div className="reel-pin section-pad">
        <div className="reel-heading">
          <div><p className="eyebrow">Selected Work</p><h2 id="work-reel-title">Different challenges.<br />Thoughtful solutions.</h2><p className="reel-intro">Selected digital projects where strategy, design, and technology come together with a clear purpose.</p></div>
          <div className="reel-controls">
            <span>{String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
          </div>
        </div>
        <div className="reel-track" ref={track}>
          {projects.map((project) => (
            <article className="reel-card" key={project.title}>
              <div className="reel-image"><WebsitePreview src={project.video} label={`${project.name} desktop website preview`} /></div>
              <div className="reel-copy"><span>{project.type}</span><b>{project.name}</b><h3>{project.title}</h3><p>{project.text}</p></div>
            </article>
          ))}
        </div>
        <TransitionLink href="/work" className="reel-all">Explore Selected Work <ArrowUpRight size={16} weight="light" /></TransitionLink>
      </div>
    </section>
  );
}
