import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useRef } from "react";
import { useAutoplayVideo } from "@/hooks/use-autoplay-video";
import { ImageAccordion } from "@/components/image-accordion";
import { KineticBand } from "@/components/kinetic-band";
import { ProcessPath } from "@/components/process-path";
import { SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import { PageSchema } from "@/components/page-schema";
import { StudioKineticTransition } from "@/components/studio-kinetic-transition";

export const Route = createFileRoute("/studio")({
  component: StudioPage,
  head: () => ({ meta: [
    { title: "Our Digital Studio | Better Found Online" },
    { name: "description", content: "Discover Better Found Online's approach to digital strategy, website design, SEO, and connected experiences. Clear thinking before execution." },
  ], links: [{ rel: "canonical", href: "https://betterfoundonline.com/studio" }] }),
});

function StudioBeliefVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useAutoplayVideo(videoRef, { src: "/assets/world/hero.mp4" });

  return (
    <video ref={videoRef} autoPlay muted loop playsInline preload="metadata" poster="/assets/world/poster.webp">
      <source src="/assets/world/hero-mobile.mp4" media="(max-width: 700px)" type="video/mp4" />
      <source src="/assets/world/hero.mp4" type="video/mp4" />
    </video>
  );
}

function StudioPage() {
  return (
    <div className="site interior-site studio-page">
      <StudioKineticTransition />
      <PageSchema name="Our Digital Studio | Better Found Online" path="/studio" description="Better Found Online approaches digital projects by understanding the audience and business problem, clarifying the offer, building the experience, and identifying opportunities for improvement." />
      <a className="skip-link" href="#main">Skip to Content</a>
      <SiteHeader />
      <main id="main">
        <section className="interior-hero studio-hero">
          <div className="studio-words" aria-hidden="true"><span>Think</span><span>Shape</span><span>Connect</span></div>
          <div className="interior-hero-copy">
            <p className="eyebrow">The studio</p>
            <h1>Good digital work<span>starts with better questions.</span></h1>
            <p>Good digital work rarely fits inside one discipline. A website, campaign, video, or visual experience needs the right thinking behind it. We start with the problem, bring in the right skills, and carry the idea through to execution.</p>
            <div className="interior-hero-actions">
              <TransitionLink className="primary-btn" href="/#contact">Discuss Your Project</TransitionLink>
              <TransitionLink href="/services">Explore Our Services</TransitionLink>
            </div>
          </div>
          <div className="studio-signal" aria-hidden="true">
            <svg viewBox="0 0 540 540">
              <path d="M35 270 C100 80 170 460 250 270 S405 90 505 270" />
              <path d="M35 310 C115 160 180 405 260 280 S405 155 505 310" />
              <circle cx="270" cy="270" r="205" />
            </svg>
          </div>
        </section>

        <KineticBand />
        <ProcessPath />
        <ImageAccordion />

        <section className="studio-belief section-pad">
          <div className="belief-media"><StudioBeliefVideo /></div>
          <div className="belief-copy"><p className="eyebrow">Why connected thinking matters</p><h2>Different skills.<br />One business goal.</h2><p>Good digital work rarely fits inside one discipline. The message, visual direction, experience, and channel all shape what people understand.</p><p>We start with the problem, bring in the right skills, and carry the idea through to execution without forcing every project into the same process.</p><TransitionLink href="/creative-production" className="text-link">Explore Creative Production <ArrowUpRight size={18} weight="light" /></TransitionLink></div>
        </section>

        <section className="interior-contact section-pad">
          <p>Have a challenge<br />worth figuring out?</p>
          <a href="https://wa.me/15707077078" target="_blank" rel="noopener noreferrer">Discuss Your Project <ArrowUpRight size={28} weight="light" /></a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
