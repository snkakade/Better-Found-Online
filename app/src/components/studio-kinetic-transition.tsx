import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const kineticLines = [
  "think think think",
  "shape shape shape",
  "connect connect connect",
  "clarity clarity clarity",
  "character character character",
  "continuity continuity continuity",
  "think think think",
  "shape shape shape",
  "connect connect connect",
  "clarity clarity clarity",
  "character character character",
];

type StudioLeaveDetail = { href: string };

export function StudioKineticTransition() {
  const overlay = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const layer = overlay.current;
    if (!layer) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = layer.closest<HTMLElement>(".studio-page");
    const header = root?.querySelector<HTMLElement>(".header");
    const content = root?.querySelectorAll<HTMLElement>(
      ".studio-hero .interior-hero-copy > *, .studio-words span",
    );
    const signalWrap = root?.querySelector<HTMLElement>(".studio-signal");
    const signal = signalWrap?.querySelector<SVGElement>("svg");
    const lines = layer.querySelectorAll<HTMLElement>(".studio-kinetic__line");
    const previousOverflow = document.body.style.overflow;
    let isAnimating = false;
    let leaveTimeline: gsap.core.Timeline | null = null;

    if (!root || !header || !content?.length || !signalWrap || !signal) {
      gsap.set(layer, { display: "none" });
      return;
    }

    if (reduceMotion) {
      gsap.set(layer, { display: "none" });
      return;
    }

    document.body.style.overflow = "hidden";
    gsap.set(layer, {
      display: "grid",
      scale: 1,
      rotate: 0,
      autoAlpha: 1,
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    });
    gsap.set(lines, {
      x: "0%",
      opacity: 0.05,
      rotate: (index) => index % 2 ? 1.5 : -1.5,
      letterSpacing: "-0.045em",
    });
    gsap.set(content, { opacity: 0, y: "50%" });
    gsap.set(signalWrap, { y: "100%" });
    gsap.set(signal, { y: "-100%" });

    const enter = gsap.timeline({
      paused: true,
      onComplete: () => {
        document.body.style.overflow = previousOverflow;
        gsap.set(layer, { display: "none", pointerEvents: "none" });
        if (header) gsap.set(header, { clearProps: "opacity,pointerEvents" });
      },
    });

    enter
      .addLabel("start", 0)
      .addLabel("typeTransition", 0.05)
      .addLabel("articleOpening", 0.78)
      .addLabel("pageReveal", 1.02)
      .to(header, {
        duration: 0.45,
        ease: "power3",
        opacity: 0,
        onComplete: () => gsap.set(header, { pointerEvents: "none" }),
      }, "start")
      .to(layer, {
        duration: 1.15,
        ease: "power2.inOut",
        scale: 2.2,
        rotate: -72,
      }, "typeTransition")
      .to(lines, {
        keyframes: [
          { x: (index) => index % 2 ? "-13%" : "16%", rotate: 0, letterSpacing: "0.015em", duration: 0.55, ease: "power1.inOut" },
          { x: (index) => index % 2 ? "180%" : "-180%", letterSpacing: "0.08em", duration: 0.8, ease: "power2.in" },
        ],
        stagger: 0.025,
      }, "typeTransition")
      .to(lines, {
        keyframes: [
          { opacity: 1, duration: 0.55, ease: "power1.in" },
          { opacity: 0, duration: 0.8, ease: "power2.in" },
        ],
      }, "typeTransition")
      .to(content, {
        duration: 0.78,
        ease: "expo",
        opacity: 1,
        y: "0%",
        stagger: 0.035,
      }, "articleOpening")
      .to([signalWrap, signal], {
        duration: 0.85,
        ease: "expo",
        y: "0%",
      }, "articleOpening")
      .to(header, {
        duration: 0.5,
        opacity: 1,
        onStart: () => gsap.set(header, { pointerEvents: "auto" }),
      }, "articleOpening")
      .to(layer, {
        duration: 0.88,
        ease: "power4.inOut",
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      }, "pageReveal");

    enter.timeScale(1 / 1.2);
    void document.fonts.ready.then(() => enter.play());

    const handleLeave = (event: Event) => {
      if (isAnimating) return;
      const href = (event as CustomEvent<StudioLeaveDetail>).detail?.href;
      if (!href) return;
      isAnimating = true;
      document.body.style.overflow = "hidden";
      gsap.set(layer, {
        display: "grid",
        pointerEvents: "auto",
        autoAlpha: 1,
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      });

      leaveTimeline = gsap.timeline({
        onComplete: () => window.location.assign(href),
      });

      leaveTimeline
        .addLabel("start", 0)
        .addLabel("typeTransition", 0.5)
        .to(layer, {
          duration: 0.8,
          ease: "power4.inOut",
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }, "start")
        .to(header, { duration: 0.7, ease: "power1", opacity: 0 }, "start")
        .to(content, {
          duration: 1,
          ease: "power4.in",
          opacity: 0,
          y: "50%",
          stagger: -0.04,
        }, "start")
        .to(signalWrap, {
          duration: 1,
          ease: "power4.in",
          y: "100%",
        }, "start")
        .to(signal, {
          duration: 1,
          ease: "power4.in",
          y: "-100%",
        }, "start")
        .to(layer, {
          duration: 1.4,
          ease: "power2.inOut",
          scale: 1,
          rotate: 0,
        }, 1.7)
        .to(lines, {
          duration: 2.3,
          ease: "back",
          x: "0%",
          rotate: (index) => index % 2 ? 1.5 : -1.5,
          letterSpacing: "-0.045em",
          stagger: -0.04,
        }, "typeTransition")
        .to(lines, {
          keyframes: [
            { opacity: 1, duration: 1, ease: "power1.in" },
            { opacity: 0.05, duration: 1.5, ease: "power1.in" },
          ],
        }, "typeTransition");

      leaveTimeline.timeScale(1 / 1.2);
    };

    window.addEventListener("studio:leave", handleLeave);
    return () => {
      window.removeEventListener("studio:leave", handleLeave);
      enter.kill();
      leaveTimeline?.kill();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="studio-kinetic" data-studio-kinetic aria-hidden="true" ref={overlay}>
      {kineticLines.map((line, index) => (
        <div className="studio-kinetic__line" key={`${line}-${index}`}>{line}</div>
      ))}
    </div>
  );
}
