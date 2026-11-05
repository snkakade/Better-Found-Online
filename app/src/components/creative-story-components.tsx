import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransitionLink } from "@/components/site-chrome";
import { useAutoplayVideo } from "@/hooks/use-autoplay-video";
import { editorialSrcSet, humanImages } from "@/editorial-images";
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
  video?: string;
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
        <div><p className="eyebrow">Selected motion work</p><h2 id="creative-films-title">Campaign films and edits.</h2></div>
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
      <figure><img {...humanImages.storyboardSession} sizes="50vw" loading="lazy" /><figcaption>Direction</figcaption></figure>
      <figure><img {...humanImages.productSet} sizes="50vw" loading="lazy" /><figcaption>Expression</figcaption></figure>
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const item = capabilities[active];
  useAutoplayVideo(videoRef, { src: item.video ?? "", enabled: Boolean(item.video) });
  const advance = (direction: number) => setActive(previous => (previous + direction + capabilities.length) % capabilities.length);

  return (
    <section className="creative-capability-story modular-video-showcase" id="capabilities" aria-labelledby="capabilities-title">
      <h2 id="capabilities-title" className="sr-only">Creative production services</h2>
      <div className="slider" role="region" aria-roledescription="carousel" aria-label="Creative production services"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a,button,video")) return;
          advance(1);
        }}
        onKeyDown={(event) => {
          if ((event.target as HTMLElement).closest("a,button")) return;
          if (["ArrowRight", "ArrowLeft", "Enter", " "].includes(event.key)) {
            event.preventDefault();
            advance(event.key === "ArrowLeft" ? -1 : 1);
          }
        }} tabIndex={0}>
        <div className="slide-titles" aria-live="polite"><div className="title active"><h3>{item.sliderTitle}</h3></div></div>
        <div className="slide-images">
          {item.video ? <video key={item.video} ref={videoRef} className="slider-video" src={item.video} poster={item.poster}
            autoPlay muted loop playsInline preload="metadata" aria-label={item.title} />
            : <img key={item.image} className="slider-artwork" src={item.image} srcSet={editorialSrcSet(item.image)} sizes="(max-width: 900px) 100vw, 65vw" width="1440" height="960" alt={`Production planning for ${item.title.toLowerCase()}`} decoding="async" />}
        </div>
        <footer className="modular-slider-footer">
          <div className="links"><a href={item.href}>{item.cta}</a><TransitionLink href="/services">All services</TransitionLink></div>
          <nav className="creative-showcase-navigation" aria-label="Browse creative services">
            <button type="button" onClick={() => advance(-1)} aria-label="Previous creative service"><ArrowLeft size={22} aria-hidden="true" /></button>
            <span aria-live="polite" aria-atomic="true">{active + 1} / {capabilities.length}</span>
            <button type="button" onClick={() => advance(1)} aria-label="Next creative service"><ArrowRight size={22} aria-hidden="true" /></button>
          </nav>
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
        <h2 id="creative-faq-title">Your creative project questions, answered.</h2>
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
