import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { editorialSrcSet } from "@/editorial-images";
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
    const element = root.current;
    if (!element) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    // Compact and reduced-motion layouts retain ordinary document reading.
    media.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      const hero = element.querySelector<HTMLElement>(".scroll63-hero");
      const foreground = element.querySelector<HTMLElement>(".scroll63-hero-fg-content");
      const darkOverlay = element.querySelector<HTMLElement>(".scroll63-hero-fg-overlay-dark");
      const columns = element.querySelectorAll<HTMLElement>(".scroll63-hero-bg-content-col");
      const outro = element.querySelector<HTMLElement>(".scroll63-hero-outro-content");
      const images = element.querySelectorAll<HTMLElement>(".scroll63-hero-outro-img");
      const caption = element.querySelector<HTMLElement>(".scroll63-hero-outro-header");
      if (!hero || !foreground || !darkOverlay || !outro || !caption || columns.length !== 2 || images.length !== 2) return;

      const headerHeight = () => document.querySelector(".header")?.getBoundingClientRect().height ?? 80;
      const measure = () => element.style.setProperty("--story-header", `${headerHeight()}px`);
      measure();

      const context = gsap.context(() => {
        // Hide the whole ending, including its background, until that phase.
        gsap.set(columns, { autoAlpha: 0, y: 16 });
        gsap.set(outro, { autoAlpha: 0 });
        gsap.set(caption, { autoAlpha: 0, y: 16 });
        const fullFrame = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero,
            start: () => `top ${headerHeight()}px`,
            end: () => `+=${window.innerHeight * scrollScreens}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.35,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
          },
        })
          .to(foreground, { clipPath: "polygon(48% 0%, 52% 0%, 52% 100%, 48% 100%)", duration: 0.2 }, 0)
          .to(darkOverlay, { opacity: 1, duration: 0.2 }, 0)
          .to(foreground, { rotate: 65, scale: 0, autoAlpha: 0, duration: 0.18 }, 0.2)
          .to(columns, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.26)
          // Give both messages a stable reading interval before the ending.
          .to(columns, { autoAlpha: 0, y: -12, duration: 0.1 }, 0.62)
          .set(outro, { autoAlpha: 1 }, 0.72)
          .to(images[0], { clipPath: fullFrame, duration: 0.16 }, 0.72)
          .to(images[1], { clipPath: fullFrame, duration: 0.16 }, 0.72)
          .to(caption, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.78)
          // Hold the completed heading and action inside the pinned frame.
          .to(outro, { autoAlpha: 1, duration: 0.1 }, 0.9);
      }, element);

      const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(refreshFrame);
        context.revert();
        element.style.removeProperty("--story-header");
      };
    });
    return () => media.revert();
  }, [scrollScreens]);
  return (
    <div className={`scroll63-story${editorialSrcSet(foregroundImage) ? " scroll63-story--editorial" : ""}`} ref={root} id={id}>
      <section className="scroll63-hero" aria-label={foregroundHeading}>
        <div className="scroll63-hero-fg-content">
          <div className="scroll63-hero-fg-img"><img src={foregroundImage} srcSet={editorialSrcSet(foregroundImage)} sizes="100vw" alt={foregroundAlt} decoding="async" /></div>
          <div className="scroll63-hero-fg-header"><h2>{foregroundHeading}</h2></div>
          <div className="scroll63-hero-fg-overlay-dark" aria-hidden="true" />
        </div>

        <div className="scroll63-hero-bg-content">
          <div className="scroll63-hero-bg-content-col"><div className="scroll63-hero-bg-content-copy"><h3>{leftTitle}</h3><p>{leftBody}</p></div></div>
          <div className="scroll63-hero-bg-content-col"><div className="scroll63-hero-bg-content-copy"><h3>{rightTitle}</h3><p>{rightBody}</p></div></div>
        </div>

        <div className="scroll63-hero-outro-content">
          {outroImages.map((image) => <div className="scroll63-hero-outro-img" key={`${image.src}-${image.alt}`}><img src={image.src} srcSet={editorialSrcSet(image.src)} sizes="50vw" alt={image.alt} loading="lazy" decoding="async" /></div>)}
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
