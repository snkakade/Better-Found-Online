import { ArrowUpRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { TransitionLink } from "@/components/site-chrome";

const projects = [
  { title: "Specialist care. Clearly presented.", name: "Dr Shweta Valunj", type: "Website Design / Search", image: "/assets/portals.webp", text: "A considered dental practice website built around clear treatment information, patient confidence, and an easier path to consultation." },
  { title: "A premium presence with purpose.", name: "CharterX", type: "Positioning / Digital Experience", image: "/assets/macro.webp", text: "A polished digital experience that brings clarity and character to specialist yacht services." },
  { title: "A sharper way to stand apart.", name: "Tech Sales Sourced", type: "Messaging / Website", image: "/assets/connect.webp", text: "Clear positioning and focused customer journeys for a specialist tech-sales recruitment business." },
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
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reduceMotion.matches) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>(".reel-card"));
    let frame = 0;
    let sectionTop = 0;
    let travel = 1;
    let maxScroll = 0;

    const measure = () => {
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
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    measure();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", measure);
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
              <div className="reel-image"><img src={project.image} alt="" loading="lazy" /></div>
              <div className="reel-copy"><span>{project.type}</span><b>{project.name}</b><h3>{project.title}</h3><p>{project.text}</p></div>
            </article>
          ))}
        </div>
        <TransitionLink href="/work" className="reel-all">Explore Selected Work <ArrowUpRight size={16} weight="light" /></TransitionLink>
      </div>
    </section>
  );
}
