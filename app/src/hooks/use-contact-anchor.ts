import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Pinned homepage sections measure after the browser's first fragment jump.
 * Keep the enquiry destination aligned until the visitor starts interacting. */
export function useContactAnchor() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let disposed = false;
    let alignContact = window.location.hash === "#contact";
    let frame = 0;
    let settledFrame = 0;
    const align = () => {
      if (disposed || !alignContact || window.location.hash !== "#contact") return;
      document.getElementById("contact")?.scrollIntoView({ block: "start", behavior: "instant" });
    };
    const schedule = () => {
      if (disposed || !alignContact) return;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(settledFrame);
      frame = requestAnimationFrame(() => { settledFrame = requestAnimationFrame(align); });
    };
    const onHashChange = () => {
      alignContact = window.location.hash === "#contact";
      schedule();
    };
    const onInteraction = () => { alignContact = false; };
    const interactions = ["pointerdown", "wheel", "touchstart", "keydown"] as const;

    ScrollTrigger.addEventListener("refresh", schedule);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("load", schedule, { once: true });
    interactions.forEach(event => window.addEventListener(event, onInteraction, { passive: true }));
    void document.fonts.ready.then(schedule);
    schedule();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(settledFrame);
      ScrollTrigger.removeEventListener("refresh", schedule);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("load", schedule);
      interactions.forEach(event => window.removeEventListener(event, onInteraction));
    };
  }, []);
}
