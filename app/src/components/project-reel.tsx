import { ArrowUpRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
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
    const finePointer = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const cards = Array.from(root.querySelectorAll<HTMLElement>(".reel-card"));
    let frame = 0;
    let sectionTop = 0;
    let travel = 1;
    let maxScroll = 0;

    const measure = () => {
      if (!finePointer.matches || reduceMotion.matches) {
        region.style.removeProperty("height");
        delete region.dataset.scrollDriven;
        return;
      }
      region.dataset.scrollDriven = "true";
      maxScroll = Math.max(0, root.scrollWidth - root.clientWidth);
      travel = Math.max(maxScroll * 0.92, window.innerHeight * 1.35);
      region.style.height = `${window.innerHeight + travel}px`;
      sectionTop = region.getBoundingClientRect().top + window.scrollY;
      update();
    };

    const update = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, (window.scrollY - sectionTop) / travel));
      root.scrollLeft = progress * maxScroll;
      const viewportCenter = root.scrollLeft + root.clientWidth / 2;
      const nearest = cards.reduce((best, card, index) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        return Math.abs(center - viewportCenter) < best.distance
          ? { distance: Math.abs(center - viewportCenter), index }
          : best;
      }, { distance: Number.POSITIVE_INFINITY, index: 0 });
      setActive(nearest.index);
    };

    const requestUpdate = () => {
      if (finePointer.matches && !reduceMotion.matches && !frame) frame = window.requestAnimationFrame(update);
    };

    measure();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", measure);
    finePointer.addEventListener("change", measure);
    reduceMotion.addEventListener("change", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", measure);
      finePointer.removeEventListener("change", measure);
      reduceMotion.removeEventListener("change", measure);
      region.style.removeProperty("height");
      delete region.dataset.scrollDriven;
    };
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
