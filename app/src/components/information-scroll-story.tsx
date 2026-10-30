import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "@/information-scroll-story.css";

export type InformationScrollStoryProps = {
  id?: string;
  foregroundImage: string;
  foregroundAlt: string;
  foregroundHeading: string;
  leftTitle: string;
  leftBody: string;
  rightTitle: string;
  rightBody: string;
  outroImages: [
    { src: string; alt: string },
    { src: string; alt: string },
  ];
  outroHeading: string;
  outroBody?: string;
  outroCtaLabel: string;
  outroCtaHref: string;
  afterHeading?: string;
  afterBody?: string;
  scrollScreens?: number;
};

export function InformationScrollStory({
  id,
  foregroundImage,
  foregroundAlt,
  foregroundHeading,
  leftTitle,
  leftBody,
  rightTitle,
  rightBody,
  outroImages,
  outroHeading,
  outroBody,
  outroCtaLabel,
  outroCtaHref,
  afterHeading,
  afterBody,
  scrollScreens = 2.4,
}: InformationScrollStoryProps) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);
    const element = root.current;
    const media = gsap.matchMedia();
    // Touch layouts read in document order. Only larger, motion-enabled screens pin.
    media.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    const smoothScroll = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches;
    const lenis = smoothScroll ? new Lenis() : null;
    const ticker = (time: number) => lenis?.raf(time * 1000);
    const onLenisScroll = () => ScrollTrigger.update();
    let outroSplit: SplitText | undefined;

    lenis?.on("scroll", onLenisScroll);
    if (lenis) gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const context = gsap.context(() => {
      const hero = element.querySelector<HTMLElement>(".scroll63-hero");
      const foreground = element.querySelector<HTMLElement>(".scroll63-hero-fg-content");
      const darkOverlay = element.querySelector<HTMLElement>(".scroll63-hero-fg-overlay-dark");
      const accentOverlay = element.querySelector<HTMLElement>(".scroll63-hero-fg-overlay");
      const backgroundColumns = element.querySelectorAll<HTMLElement>(".scroll63-hero-bg-content-col");
      const outroImagesElements = element.querySelectorAll<HTMLElement>(".scroll63-hero-outro-img");
      const outroHeadingElement = element.querySelector<HTMLElement>(".scroll63-hero-outro-header h3");
      const outroBodyElement = element.querySelector<HTMLElement>(".scroll63-hero-outro-header p");
      const outroCtaElement = element.querySelector<HTMLElement>(".scroll63-hero-outro-cta");

      if (!hero || !foreground || !darkOverlay || !accentOverlay || backgroundColumns.length < 2 || outroImagesElements.length < 2 || !outroHeadingElement || !outroCtaElement) return;

      outroSplit = SplitText.create(outroHeadingElement, {
        type: "lines",
        mask: "lines",
        linesClass: "scroll63-line",
      });
      gsap.set(outroSplit.lines, { yPercent: 100 });
      if (outroBodyElement) gsap.set(outroBodyElement, { autoAlpha: 0, y: 18 });
      gsap.set(outroCtaElement, { autoAlpha: 0, y: 24 });

      // Keep the two readable columns apart throughout the transition.
      const inwardTravel = 12;

      ScrollTrigger.create({
        trigger: hero,
        start: () => `top ${document.querySelector(".header")?.getBoundingClientRect().height ?? 80}px`,
        end: () => `+=${window.innerHeight * scrollScreens}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const openingProgress = gsap.utils.clamp(0, 1, progress / 0.18);
          const rotateProgress = gsap.utils.clamp(0, 1, (progress - 0.18) / 0.16);
          const exitProgress = gsap.utils.clamp(0, 1, (progress - 0.34) / 0.18);
          const accentProgress = gsap.utils.clamp(0, 1, (progress - 0.34) / 0.05);
          const imageProgress = gsap.utils.clamp(0, 1, (progress - 0.54) / 0.16);
          const finalRevealProgress = gsap.utils.clamp(0, 1, (progress - 0.62) / 0.16);
          const copyFadeProgress = gsap.utils.clamp(0, 1, (progress - 0.52) / 0.1);

          gsap.set(foreground, {
            clipPath: `polygon(${48 * openingProgress}% 0%, ${100 - 48 * openingProgress}% 0%, ${100 - 48 * openingProgress}% 100%, ${48 * openingProgress}% 100%)`,
            rotate: 65 * rotateProgress,
            scale: 1 - exitProgress,
          });
          gsap.set(darkOverlay, { opacity: openingProgress });
          gsap.set(backgroundColumns[0], {
            xPercent: inwardTravel * exitProgress,
            opacity: 1 - copyFadeProgress,
            zIndex: progress >= 0.52 ? 3 : 1,
          });
          gsap.set(backgroundColumns[1], {
            xPercent: -inwardTravel * exitProgress,
            opacity: 1 - copyFadeProgress,
            zIndex: progress >= 0.52 ? 3 : 1,
          });
          gsap.set(accentOverlay, { opacity: accentProgress });
          gsap.set(outroImagesElements[0], {
            clipPath: `polygon(0% 0%, 100% 0%, 100% ${imageProgress * 100}%, 0% ${imageProgress * 100}%)`,
          });
          gsap.set(outroImagesElements[1], {
            clipPath: `polygon(0% ${100 - imageProgress * 100}%, 100% ${100 - imageProgress * 100}%, 100% 100%, 0% 100%)`,
          });

          gsap.set(outroSplit!.lines, { yPercent: 100 * (1 - finalRevealProgress) });
          if (outroBodyElement) {
            gsap.set(outroBodyElement, {
              autoAlpha: finalRevealProgress,
              y: 18 * (1 - finalRevealProgress),
            });
          }
          gsap.set(outroCtaElement, {
            autoAlpha: finalRevealProgress,
            y: 24 * (1 - finalRevealProgress),
          });
        },
      });
    }, element);

    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshFrame);
      context.revert();
      outroSplit?.revert();
      if (lenis) gsap.ticker.remove(ticker);
      lenis?.off("scroll", onLenisScroll);
      lenis?.destroy();
    };
    });
    return () => media.revert();
  }, [scrollScreens]);

  return (
    <div className="scroll63-story" ref={root} id={id}>
      <section className="scroll63-hero" aria-label={foregroundHeading}>
        <div className="scroll63-hero-fg-content">
          <div className="scroll63-hero-fg-img"><img src={foregroundImage} alt={foregroundAlt} /></div>
          <div className="scroll63-hero-fg-header"><h2>{foregroundHeading}</h2></div>
          <div className="scroll63-hero-fg-overlay-dark" aria-hidden="true" />
          <div className="scroll63-hero-fg-overlay" aria-hidden="true" />
        </div>

        <div className="scroll63-hero-bg-content">
          <div className="scroll63-hero-bg-content-col"><div className="scroll63-hero-bg-content-copy"><h3>{leftTitle}</h3><p>{leftBody}</p></div></div>
          <div className="scroll63-hero-bg-content-col"><div className="scroll63-hero-bg-content-copy"><h3>{rightTitle}</h3><p>{rightBody}</p></div></div>
        </div>

        <div className="scroll63-hero-outro-content">
          {outroImages.map((image) => <div className="scroll63-hero-outro-img" key={`${image.src}-${image.alt}`}><img src={image.src} alt={image.alt} loading="lazy" /></div>)}
          <div className="scroll63-hero-outro-header">
            <h3>{outroHeading}</h3>
            {outroBody && <p>{outroBody}</p>}
            <a className="scroll63-hero-outro-cta" href={outroCtaHref} target={outroCtaHref.startsWith("http") ? "_blank" : undefined} rel={outroCtaHref.startsWith("http") ? "noopener noreferrer" : undefined}>{outroCtaLabel}</a>
          </div>
        </div>
      </section>

      {afterHeading && <section className="scroll63-about"><div><h3>{afterHeading}</h3>{afterBody && <p>{afterBody}</p>}</div></section>}
    </div>
  );
}
