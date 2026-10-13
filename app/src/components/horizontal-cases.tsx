import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const cases = [
  { name: "Dr Shweta Valunj", service: "Website Strategy / Design / SEO", image: "/assets/portals.webp", headline: "Make specialist expertise easier to trust.", text: "A carefully structured dental practice website that brings clarity to treatment information, communicates professional expertise, and makes the consultation path easier to follow." },
  { name: "CharterX", service: "Website / Digital Experience", image: "/assets/macro.webp", headline: "Premium presentation. Clear purpose.", text: "A polished website experience that brings structure and character to yacht services, with a focus on presenting a specialized offer clearly." },
  { name: "Tech Sales Sourced", service: "Positioning / Website Development", image: "/assets/connect.webp", headline: "Stand out in a market full of sameness.", text: "Focused messaging and clear journeys help a specialist recruitment business communicate its value to hiring teams and candidates." },
];

export function HorizontalCases() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current || !track.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      ScrollTrigger.matchMedia({
        "(min-width: 801px)": () => {
          const panels = gsap.utils.toArray<HTMLElement>(".case-panel");
          gsap.to(track.current, {
            xPercent: -100 * (panels.length - 1) / panels.length,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${window.innerWidth * 2}`, pin: true, scrub: 1, invalidateOnRefresh: true },
          });
        },
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <section className="horizontal-cases" ref={root} aria-label="Selected case studies">
      <div className="case-track" ref={track}>
        {cases.map((item, index) => (
          <article className="case-panel" key={item.name}>
            <div className="case-visual"><img src={item.image} alt="" /></div>
            <div className="case-copy">
              <strong className="case-name">{item.name}</strong>
              <span>{item.service}</span>
              <h2>{item.headline}</h2>
              <p>{item.text}</p>
              <a href="#work-contact">View Project</a>
              <b>{String(index + 1).padStart(2, "0")} / {String(cases.length).padStart(2, "0")}</b>
            </div>
            <div className="case-word" aria-hidden="true">{item.name}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
