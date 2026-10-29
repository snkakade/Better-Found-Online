import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransitionLink } from "@/components/site-chrome";
import { useAutoplayVideo } from "@/hooks/use-autoplay-video";
export { CreativeProofReel } from "@/components/creative-proof-reel/creative-proof-reel";

export interface CreativeCapability {
  number: string;
  title: string;
  headline: string;
  body: string;
  tags: string;
  cta: string;
  href: string;
  image: string;
  video: string;
  poster?: string;
  sliderTitle: string;
}

export function InlineProjectVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useAutoplayVideo(videoRef, { src });
  return <video ref={videoRef} className={className} autoPlay muted loop playsInline preload="metadata" poster={poster} aria-label="Creative project video"><source src={src} type="video/mp4" /></video>;
}

export function CreativeCampaignFilms({ ctaHref }: { ctaHref: string }) {
  return (
    <section className="creative-films section-pad" id="selected-work" aria-labelledby="creative-films-title">
      <header className="creative-films-header">
        <div><p className="eyebrow">Selected motion work</p><h2 id="creative-films-title">Stories built to move.</h2></div>
      </header>
      <div className="creative-films-reel">
        <figure className="creative-film creative-film-primary">
          <InlineProjectVideo src="/assets/creative-work/campaign-film-rev.mp4" poster="/assets/creative-work/campaign-film-rev-poster.jpg" />
        </figure>
        <figure className="creative-film creative-film-secondary">
          <InlineProjectVideo src="/assets/creative-work/campaign-film-tts.mp4" poster="/assets/creative-work/campaign-film-tts-poster.jpg" />
        </figure>
      </div>
      <div className="creative-films-action"><a className="primary-btn creative-films-cta" href={ctaHref} target="_blank" rel="noopener noreferrer">Discuss a Creative Project</a></div>
    </section>
  );
}

function OrbitMotionText({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) node.dataset.visible = "true";
      else node.dataset.visible = "false";
    }, { threshold: 0.28 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <span ref={ref} className="orbit-motion-text">{children.split(" ").map((word, index) => <span key={`${word}-${index}`} style={{ "--word-index": index } as CSSProperties}>{word}</span>)}</span>;
}

function OrbitSplitGallery() {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const target = useRef(46);
  const current = useRef(46);

  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  const animate = () => {
    current.current += (target.current - current.current) * 0.15;
    root.current?.style.setProperty("--split", `${current.current}%`);
    if (Math.abs(target.current - current.current) > 0.1) frame.current = requestAnimationFrame(animate);
    else frame.current = null;
  };
  const update = (clientX: number) => {
    const rect = root.current?.getBoundingClientRect();
    if (!rect) return;
    target.current = Math.max(24, Math.min(76, ((clientX - rect.left) / rect.width) * 100));
    if (frame.current === null) frame.current = requestAnimationFrame(animate);
  };

  return (
    <div ref={root} className="orbit-split-gallery" style={{ "--split": "46%" } as CSSProperties} onPointerMove={(event) => update(event.clientX)}>
      <figure><img src="/assets/portals.webp" alt="Architectural metallic forms representing creative structure" /><figcaption>Direction</figcaption></figure>
      <figure><img src="/assets/world/poster.webp" alt="Abstract metallic composition representing a finished visual world" /><figcaption>Expression</figcaption></figure>
    </div>
  );
}

export function CreativeLensTabs() {
  return (
    <section className="creative-lens section-pad" aria-labelledby="creative-lens-title">
      <header>
        <p className="eyebrow">One idea, considered three ways</p>
        <h2 id="creative-lens-title"><OrbitMotionText>The story comes first.</OrbitMotionText></h2>
      </header>
      <Tabs defaultValue="message" className="creative-lens-tabs">
        <TabsList variant="bare" aria-label="Creative planning lenses">
          <TabsTrigger value="message">Message</TabsTrigger>
          <TabsTrigger value="moment">Moment</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
        </TabsList>
        <TabsContent value="message">
          <strong>What should people understand?</strong>
          <p>We clarify the idea before choosing the technique, so the visual direction has a reason to exist.</p>
        </TabsContent>
        <TabsContent value="moment">
          <strong>Where should attention turn?</strong>
          <p>We identify the frame, beat, or interaction that carries the story and makes the work memorable.</p>
        </TabsContent>
        <TabsContent value="medium">
          <strong>What form serves it best?</strong>
          <p>Video, CGI, motion, or graphic design is selected around the message, audience, and destination.</p>
        </TabsContent>
      </Tabs>
    </section>
  );
}

export function CreativeTransformation() {
  return (
    <section className="creative-transformation section-pad" aria-labelledby="creative-transformation-title">
      <div className="creative-transformation-copy">
        <p className="eyebrow">From direction to expression</p>
        <h2 id="creative-transformation-title"><OrbitMotionText>Move from an idea to a visual world.</OrbitMotionText></h2>
        <p>Drag the frame to explore how a single creative direction can shift from structural thinking to a richer visual expression.</p>
      </div>
      <OrbitSplitGallery />
    </section>
  );
}

export function CreativeCapabilityCarousel({ capabilities }: { capabilities: CreativeCapability[] }) {
  const [active, setActive] = useState(0);
  const slider = useRef<HTMLDivElement>(null);
  const slideTitles = useRef<HTMLDivElement>(null);
  const slideImages = useRef<HTMLDivElement>(null);
  const imgTop = useRef<HTMLDivElement>(null);
  const imgBottom = useRef<HTMLDivElement>(null);
  const currentIndex = useRef(1);
  const handleSlider = useRef<() => void>(() => undefined);
  const handleMediaHover = useRef<(expanded: boolean) => void>(() => undefined);

  useEffect(() => {
    let disposed = false;
    let activeTimer: ReturnType<typeof setTimeout> | undefined;
    let gsapInstance: typeof import("gsap").gsap | undefined;
    let mediaRequest = 0;
    const totalSlides = 7;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactVideo = window.matchMedia("(max-width: 900px)");
    const syncPlayback = () => {
      [imgTop.current, imgBottom.current].forEach(container => {
        container?.querySelectorAll<HTMLVideoElement>("video").forEach(video => {
          const hiddenHalf = compactVideo.matches && video.classList.contains("slider-video-bottom");
          const allowed = visible && !document.hidden && !motionPreference.matches && !hiddenHalf;
          video.autoplay = allowed;
          if (allowed && !video.error) void video.play().catch(() => undefined);
          else video.pause();
        });
      });
    };
    const playbackObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncPlayback(); }, { threshold: .1 });
    if (slider.current) playbackObserver.observe(slider.current);
    document.addEventListener("visibilitychange", syncPlayback);
    motionPreference.addEventListener("change", syncPlayback);
    compactVideo.addEventListener("change", syncPlayback);
    const resumePlayback = () => {
      [imgTop.current, imgBottom.current].forEach(container => container?.querySelectorAll<HTMLVideoElement>("video").forEach(video => {
        const hiddenHalf = compactVideo.matches && video.classList.contains("slider-video-bottom");
        if (visible && !document.hidden && !motionPreference.matches && !hiddenHalf && video.error) video.load();
      }));
      syncPlayback();
    };
    document.addEventListener("pointerup", resumePlayback, { passive: true });
    window.addEventListener("online", resumePlayback);

    const updateActiveSlide = () => {
      slideTitles.current?.querySelectorAll<HTMLElement>(".title").forEach((el, index) => {
        const isActive = index === currentIndex.current - 1;
        el.classList.toggle("active", isActive);
        el.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
      setActive(currentIndex.current - 1);
    };

    const trimExcessImages = () => {
      [imgTop.current, imgBottom.current].forEach((container) => {
        if (!container) return;
        while (container.children.length > 5) {
          const first = container.firstElementChild as HTMLVideoElement | null;
          first?.pause();
          first?.remove();
        }
      });
    };

    handleMediaHover.current = (expanded: boolean) => {
      if (!imgTop.current || !imgBottom.current) return;

      const clips = expanded
        ? ["polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)", "polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)"]
        : ["polygon(85% 0%, 0% 0%, 0% 50%, 85% 50%)", "polygon(100% 50%, 15% 50%, 15% 100%, 100% 100%)"];

      if (reducedMotion || !gsapInstance) {
        imgTop.current.style.clipPath = clips[0];
        imgBottom.current.style.clipPath = clips[1];
        return;
      }

      gsapInstance.to([imgTop.current, imgBottom.current], {
        clipPath: (index: number) => clips[index],
        duration: 1,
        ease: "power4.out",
        overwrite: true,
      });
    };

    const updateImages = (imageNumber: number) => {
      const requestId = ++mediaRequest;
      const sourceIndex = (imageNumber - 2 + totalSlides) % totalSlides;
      const item = capabilities[sourceIndex];
      if (!item || !imgTop.current || !imgBottom.current) return;
      // Keep the selected artwork visible while its actual video prepares.
      // Never leave an old slide or an empty blue box behind a loading gate.
      [imgTop.current, imgBottom.current].forEach(container => {
        container?.querySelectorAll<HTMLVideoElement>("video").forEach(video => { video.pause(); video.remove(); });
      });

      const createVideo = (className: string) => {
        const video = document.createElement("video");
        video.className = className;
        video.src = item.video;
        if (item.poster) video.poster = item.poster;
        video.autoplay = false;
        video.muted = true;
        video.defaultMuted = true;
        video.controls = false;
        video.loop = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.style.opacity = "0";
        video.setAttribute("aria-hidden", "true");
        video.tabIndex = -1;
        video.addEventListener("canplay", syncPlayback);
        return video;
      };

      const videoTop = createVideo("slider-video slider-video-top");
      const videoBottom = createVideo("slider-video slider-video-bottom");

      if (!reducedMotion && gsapInstance) {
        gsapInstance.set(videoTop, {
          clipPath: "polygon(85% 0%, 85% 0%, 85% 50%, 85% 50%)",
          scale: 2,
        });
        gsapInstance.set(videoBottom, {
          clipPath: "polygon(15% 50%, 15% 50%, 15% 100%, 15% 100%)",
          scale: 2,
        });
      }

      imgTop.current.appendChild(videoTop);
      imgBottom.current.appendChild(videoBottom);

      let revealed = false;
      const revealPreparedVideo = () => {
        if (revealed || videoTop.readyState < 2 || (!compactVideo.matches && videoBottom.readyState < 2)) return;
        revealed = true;

        if (disposed || requestId !== mediaRequest) {
          videoTop.pause();
          videoBottom.pause();
          videoTop.remove();
          videoBottom.remove();
          return;
        }

        [imgTop.current, imgBottom.current].forEach((container) => {
          container?.querySelectorAll<HTMLVideoElement>("video").forEach((video) => {
            if (video !== videoTop && video !== videoBottom) {
              video.pause();
              video.remove();
            }
          });
        });

        videoBottom.currentTime = videoTop.currentTime;
        videoTop.style.opacity = "1";
        videoBottom.style.opacity = "1";
        syncPlayback();

        if (reducedMotion || !gsapInstance) return;

        gsapInstance.to([videoTop, videoBottom], {
          clipPath: "polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)",
          scale: 1,
          duration: 2,
          ease: "power4.out",
          stagger: 0.15,
          overwrite: true,
          onComplete: trimExcessImages,
        });
      };

      // A display:none duplicate may never emit canplay on iPhone. Start the
      // visible clip immediately and never wait on the hidden mobile half.
      videoTop.addEventListener("loadeddata", revealPreparedVideo, { once: true });
      videoBottom.addEventListener("loadeddata", revealPreparedVideo, { once: true });
      videoTop.load();
      if (!compactVideo.matches) videoBottom.load();
      syncPlayback();
    };

    handleSlider.current = () => {
      currentIndex.current = currentIndex.current < totalSlides ? currentIndex.current + 1 : 1;

      if (reducedMotion || !gsapInstance || !slideTitles.current) {
        if (slideTitles.current) slideTitles.current.style.transform = `translateX(-${(currentIndex.current - 1) * 11.1111}%)`;
        updateImages(currentIndex.current + 1);
        updateActiveSlide();
        return;
      }

      gsapInstance.to(slideTitles.current, {
        onStart: () => {
          activeTimer = setTimeout(updateActiveSlide, 100);
          updateImages(currentIndex.current + 1);
        },
        x: `-${(currentIndex.current - 1) * 11.1111}%`,
        duration: 2,
        ease: "power4.out",
      });
    };

    import("gsap").then(({ gsap }) => {
      if (disposed) return;
      gsapInstance = gsap;
      updateImages(2);
      updateActiveSlide();
    });

    const slideTitlesElement = slideTitles.current;
    const imgTopElement = imgTop.current;
    const imgBottomElement = imgBottom.current;

    return () => {
      disposed = true;
      playbackObserver.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      motionPreference.removeEventListener("change", syncPlayback);
      compactVideo.removeEventListener("change", syncPlayback);
      document.removeEventListener("pointerup", resumePlayback);
      window.removeEventListener("online", resumePlayback);
      handleMediaHover.current = () => undefined;
      if (activeTimer) clearTimeout(activeTimer);
      if (gsapInstance) {
        gsapInstance.killTweensOf(slideTitlesElement);
        gsapInstance.killTweensOf([...(imgTopElement?.children ?? []), ...(imgBottomElement?.children ?? [])]);
      }
      [imgTopElement, imgBottomElement].forEach((container) => {
        container?.querySelectorAll("video").forEach((video) => video.pause());
      });
    };
  }, [capabilities]);

  const titles = [...capabilities, ...capabilities.slice(0, 2)];
  const item = capabilities[active];

  return (
    <section className="creative-capability-story modular-video-showcase" id="capabilities" aria-labelledby="capabilities-title">
      <h2 id="capabilities-title" className="sr-only">Creative production work and capabilities</h2>
      <div
        ref={slider}
        className="slider"
        role="region"
        aria-roledescription="carousel"
        aria-label="Creative production video showcase. Select the showcase to advance."
        aria-live="polite"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a,button,video")) return;
          handleSlider.current();
        }}
        onKeyDown={(event) => {
          if ((event.target as HTMLElement).closest("a,button")) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSlider.current();
          }
        }}
        tabIndex={0}
      >
        <div className="slide-titles" ref={slideTitles}>
          {titles.map((capability, index) => (
            <div className={`title${index === 0 ? " active" : ""}`} key={`${capability.number}-${index}`} aria-hidden={index === 0 ? "false" : "true"}>
              <h3>{capability.sliderTitle}</h3>
            </div>
          ))}
        </div>
        <div
          className="slide-images"
          ref={slideImages}
          aria-hidden="true"
          onPointerEnter={() => handleMediaHover.current(true)}
          onPointerLeave={() => handleMediaHover.current(false)}
        >
          <img className="slider-loading-artwork" src={item?.poster ?? item?.image} alt="" loading="eager" decoding="async" />
          <div className="img-top" ref={imgTop} />
          <div className="img-bottom" ref={imgBottom} />
        </div>
        <div className="modular-slider-kicker" aria-hidden="true">
          <span>Better Found Online</span>
          <span>Creative Production</span>
        </div>
        <footer className="modular-slider-footer">
          <div className="links">
            <a href={item?.href ?? "/services"}>{item?.cta ?? "Explore the work"}</a>
            <TransitionLink href="/services">All services</TransitionLink>
          </div>
          <p><span>{item?.headline}</span><span>{String(active + 1).padStart(2, "0")} / 07 - Select to advance</span></p>
        </footer>
      </div>
    </section>
  );
}

export function CreativeProcessStory({ process }: { process: string[][] }) {
  const [current, setCurrent] = useState(process[0]?.[1] ?? "Understand");
  const active = process.find(([, title]) => title === current) ?? process[0];
  return (
    <section className="creative-process-story section-pad" aria-labelledby="creative-process-title">
      <header>
        <p className="eyebrow">Creative process</p>
        <h2 id="creative-process-title"><OrbitMotionText>A clear path from brief to delivery.</OrbitMotionText></h2>
      </header>
      <nav aria-label="Creative production process" className="creative-step-rail">
        {process.map(([number, title]) => <button type="button" key={title} aria-pressed={current === title} onClick={() => setCurrent(title)}><span>{number}</span>{title}</button>)}
      </nav>
      {active ? <div className="creative-process-focus" aria-live="polite"><span>{active[0]}</span><h3>{active[1]}</h3><p>{active[2]}</p></div> : null}
    </section>
  );
}

export function CreativeFaq({ faq }: { faq: string[][] }) {
  return (
    <section className="faq-section section-pad" aria-labelledby="creative-faq-title">
      <header>
        <p className="eyebrow">Frequently asked questions</p>
        <h2 id="creative-faq-title">What buyers usually need to know.</h2>
      </header>
      <div>
        {faq.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function OrbitShapeTransition() {
  return <div className="orbit-shape-transition" aria-hidden="true"><svg viewBox="0 0 100 18" preserveAspectRatio="none"><path d="M0 18V12C18 2 32 2 50 12S82 22 100 12V18Z" /><path d="M0 18V14C18 7 32 7 50 14S82 21 100 14V18Z" /><path d="M0 18V16C18 12 32 12 50 16S82 20 100 16V18Z" /></svg></div>;
}
