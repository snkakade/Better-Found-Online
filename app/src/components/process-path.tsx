import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const stages = [
  ["Understand", "Get clear on the business, the audience, and the problem worth solving."],
  ["Position", "Find the strongest way to explain what makes the offer valuable."],
  ["Build", "Turn the thinking into a useful, distinctive digital experience."],
  ["Improve", "Review what happens, learn from it, and refine what matters."],
];

export function ProcessPath() {
  const root = useRef<HTMLElement>(null);
  const line = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!root.current || !line.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const length = line.current.getTotalLength();
    gsap.set(line.current, { strokeDasharray: length, strokeDashoffset: length });
    const context = gsap.context(() => {
      gsap.to(line.current, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top 72%", end: "bottom 62%", scrub: 1 } });
      gsap.utils.toArray<HTMLElement>(".process-stage").forEach((stage) => {
        gsap.fromTo(stage, { autoAlpha: 0.25, y: 30 }, { autoAlpha: 1, y: 0, scrollTrigger: { trigger: stage, start: "top 78%", end: "top 48%", scrub: true } });
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <section className="process-path section-pad" ref={root} aria-labelledby="process-title">
      <div className="process-heading"><p className="eyebrow">A connected practice</p><h2 id="process-title">From the big picture<br />to the small details.</h2></div>
      <div className="process-map">
        <svg className="process-svg" viewBox="0 0 120 740" preserveAspectRatio="none" aria-hidden="true">
          <path className="process-guide" d="M60 0 C15 110, 105 160, 58 270 C15 370, 104 420, 58 530 C18 625, 82 690, 60 740" />
          <path ref={line} d="M60 0 C15 110, 105 160, 58 270 C15 370, 104 420, 58 530 C18 625, 82 690, 60 740" />
        </svg>
        <div className="process-stages">
          {stages.map(([title, text], index) => <article className="process-stage" key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </div>
    </section>
  );
}
