import { ArrowUpRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { TransitionLink } from "@/components/site-chrome";

const projects = [
  { title: "Premium presentation. Clear purpose.", name: "CharterX", type: "Website / Digital Experience", video: "/assets/service-pages/websites/charterx.webm", mp4: "/assets/service-pages/websites/charterx.mp4", text: "A polished website experience that brings structure and character to specialist yacht services while presenting the offer clearly." },
  { title: "A specialist product, made easier to explore.", name: "Say Vanilla", type: "Website Strategy / Design / Development", video: "/assets/service-pages/websites/say-vanilla.webm", mp4: "/assets/service-pages/websites/say-vanilla.mp4", text: "A tactile website that gives an ingredient-led brand space to explain its product, build confidence, and make discovery feel effortless." },
  { title: "Stand out in a market full of sameness.", name: "Tech Sales Sourced", type: "Positioning / Website Development", video: "/assets/work/tech-sales-desktop-smooth.webm", mp4: "/assets/work/tech-sales-desktop-smooth.mp4", text: "Focused messaging and clear journeys help a specialist recruitment business communicate its value to hiring teams and candidates." },
];

function ProjectPreview({ name, video, mp4 }: { name: string; video: string; mp4: string }) {
  const preview = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = preview.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    element.playbackRate = 0.78;

    if (reducedMotion.matches) {
      element.pause();
      element.currentTime = 0;
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        void element.play().catch(() => undefined);
      } else {
        element.pause();
      }
    }, { rootMargin: "20% 400px", threshold: 0.12 });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <video ref={preview} autoPlay muted loop playsInline preload="metadata" aria-label={`${name} desktop website preview`}>
      <source src={video} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}

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
    const finePointer = window.matchMedia("(min-width: 801px) and (hover: hover) and (pointer: fine)");
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
              <div className="reel-image"><ProjectPreview name={project.name} video={project.video} mp4={project.mp4} /></div>
              <div className="reel-copy"><span>{project.type}</span><b>{project.name}</b><h3>{project.title}</h3><p>{project.text}</p></div>
            </article>
          ))}
        </div>
        <TransitionLink href="/work" className="reel-all">Explore Selected Work <ArrowUpRight size={16} weight="light" /></TransitionLink>
      </div>
    </section>
  );
}
