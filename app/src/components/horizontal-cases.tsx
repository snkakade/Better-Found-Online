import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const cases = [
  {
    name: "Dr Shweta Valunj",
    service: "Website Strategy / Design / SEO",
    headline: "Make specialist expertise easier to trust.",
    text: "A carefully structured dental practice website that brings clarity to treatment information, communicates professional expertise, and makes the consultation path easier to follow.",
    devices: [{ kind: "macbook", src: "/assets/work/dr-shweta-desktop.webm", label: "Dr Shweta Valunj desktop website preview on a MacBook", urlLabel: "drshwetavalunj.in" }],
  },
  {
    name: "Say Vanilla",
    service: "Website Strategy / Design / Development",
    headline: "Turn a specialist product into a story worth exploring.",
    text: "A tactile, mobile-first website that gives an ingredient-led brand the space to explain its product, build confidence, and make discovery feel effortless.",
    devices: [{ kind: "phone", src: "/assets/work/say-vanilla-mobile.webm", label: "Say Vanilla mobile website preview on an iPhone" }],
  },
  {
    name: "CharterX",
    service: "Website / Digital Experience",
    headline: "Premium presentation. Clear purpose.",
    text: "A polished website experience that brings structure and character to yacht services, with a focus on presenting a specialized offer clearly.",
    devices: [{ kind: "tablet", src: "/assets/work/charterx-tablet.webm", label: "CharterX website preview on an iPad" }],
  },
  {
    name: "Tech Sales Sourced",
    service: "Positioning / Website Development",
    headline: "Stand out in a market full of sameness.",
    text: "Focused messaging and clear journeys help a specialist recruitment business communicate its value to hiring teams and candidates.",
    devices: [
      { kind: "macbook", src: "/assets/work/tech-sales-desktop-smooth.webm", label: "Tech Sales Sourced desktop website preview", urlLabel: "techsalessourced.net" },
      { kind: "tablet", src: "/assets/work/tech-sales-tablet-smooth.webm", label: "Tech Sales Sourced tablet website preview" },
      { kind: "phone", src: "/assets/work/tech-sales-mobile-smooth.webm", label: "Tech Sales Sourced mobile website preview" },
    ],
  },
] as const;

type CaseDevice = (typeof cases)[number]["devices"][number];

function DevicePreview({ device, registerVideo, synchronized = false }: { device: CaseDevice; registerVideo?: (video: HTMLVideoElement | null) => void; synchronized?: boolean }) {
  const video = (
    <video ref={registerVideo} loop muted playsInline preload="auto" aria-label={device.label}>
      <source src={device.src} type="video/webm" />
    </video>
  );

  if (device.kind === "phone") {
    return <div className="case-device case-device-phone"><div className="case-device-phone-screen">{video}<span className="case-device-phone-island" aria-hidden="true" /></div></div>;
  }

  if (device.kind === "tablet") {
    return <div className="case-device case-device-tablet"><span className="case-device-camera" aria-hidden="true" /><div className="case-device-tablet-screen">{video}</div></div>;
  }

  return <div className="case-device case-device-macbook"><div className="case-device-macbook-lid"><span className="case-device-camera" aria-hidden="true" /><div className="case-device-macbook-screen"><div className="case-browser-bar" aria-hidden="true"><span className="case-browser-controls"><i /><i /><i /></span><span className="case-browser-address">{device.urlLabel}</span><span className="case-browser-menu">•••</span></div><div className="case-browser-viewport">{video}</div></div></div><span className="case-device-macbook-base" aria-hidden="true" /></div>;
}

function DeviceSet({ devices }: { devices: readonly CaseDevice[] }) {
  const root = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const synchronized = devices.length > 1;

  useEffect(() => {
    const basePlaybackRate = synchronized ? 0.72 : 0.78;
    let readyTimer = 0;
    let syncTimer = 0;
    let hasEntered = false;
    const media = videos.current.filter((video): video is HTMLVideoElement => Boolean(video));

    const startTogether = () => {
      if (media.length !== devices.length || media.some((video) => video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA)) return false;
      media.forEach((video) => {
        video.pause();
        video.currentTime = 0;
        video.playbackRate = basePlaybackRate;
      });
      void Promise.all(media.map((video) => video.play().catch(() => undefined)));
      return true;
    };

    const startWhenReady = () => {
      window.clearInterval(readyTimer);
      if (startTogether()) return;
      readyTimer = window.setInterval(() => {
        if (startTogether()) window.clearInterval(readyTimer);
      }, 80);
    };

    const keepTogether = () => {
      const master = media[0];
      if (!master || master.paused || master.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      media.slice(1).forEach((video) => {
        if (video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) void video.play().catch(() => undefined);
        const difference = master.currentTime - video.currentTime;
        if (Math.abs(difference) > 0.75) {
          video.currentTime = master.currentTime;
          video.playbackRate = basePlaybackRate;
        } else {
          video.playbackRate = Math.min(basePlaybackRate + 0.025, Math.max(basePlaybackRate - 0.025, basePlaybackRate + difference * 0.04));
        }
      });
    };

    const handleVisibility = () => {
      if (document.visibilityState !== "visible" || !media[0]) return;
      media.slice(1).forEach((video) => {
        video.currentTime = media[0]!.currentTime;
        video.playbackRate = basePlaybackRate;
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!hasEntered) {
          hasEntered = true;
          startWhenReady();
        } else {
          media.forEach((video) => void video.play().catch(() => undefined));
        }
      } else {
        media.forEach((video) => video.pause());
      }
    // Start the next panel's preview before the horizontal track brings it on screen.
    // The generous horizontal margin prevents a late first frame without keeping
    // every off-screen video running for the entire page visit.
    }, { rootMargin: "80% 1000%", threshold: 0.01 });

    if (root.current) observer.observe(root.current);
    if (synchronized) syncTimer = window.setInterval(keepTogether, 250);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(readyTimer);
      window.clearInterval(syncTimer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [devices.length, synchronized]);

  return (
    <div className="case-device-stage" ref={root}>
      {devices.map((device, index) => (
        <DevicePreview
          device={device}
          key={device.src}
          synchronized={synchronized}
          registerVideo={(video) => { videos.current[index] = video; }}
        />
      ))}
    </div>
  );
}

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
            scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${window.innerWidth * 4.5}`, pin: true, scrub: 1.35, invalidateOnRefresh: true },
          });
        },
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <section className="horizontal-cases" ref={root} aria-label="Selected case studies">
      <div className="case-track" ref={track} style={{ "--case-count": cases.length } as CSSProperties}>
        {cases.map((item, index) => (
          <article className="case-panel" key={item.name}>
            <div className={`case-visual case-visual--${item.devices.length > 1 ? "ensemble" : item.devices[0].kind}`}>
              <DeviceSet devices={item.devices} />
            </div>
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
