import { ArrowUpRight } from "@phosphor-icons/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { CookieSettingsButton } from "@/components/analytics-consent";

const navigation = [
  ["Work", "/work"],
  ["Performance Marketing", "/services/performance-marketing"],
  ["Website", "/services"],
  ["Creative", "/creative-production"],
];

type BrandTone = "light" | "dark" | "wine" | "rose" | "badge";

export function Brand({ large = false, tone = "light" }: { large?: boolean; tone?: BrandTone }) {
  return (
    <a className={large ? "brand brand-large" : "brand"} href="/" aria-label="Better Found Online home">
      <span className="brand-mark"><img src={`/assets/brand/mark-${tone}.svg`} width="56" height="61" alt="" draggable={false} /></span>
      <span>better found<span>online.</span></span>
    </a>
  );
}

function transitionTo(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || href.startsWith("http")) return;
  const target = new URL(href, window.location.href);
  if (target.pathname === window.location.pathname && target.hash) return;
  event.preventDefault();
  if (document.querySelector("[data-studio-kinetic]")) {
    window.dispatchEvent(new CustomEvent("studio:leave", { detail: { href: target.href } }));
    return;
  }
  if (target.pathname === "/studio") {
    window.location.assign(target.href);
    return;
  }
  document.documentElement.classList.add("is-leaving");
  window.setTimeout(() => window.location.assign(target.href), 520);
}

export function TransitionLink({ href, className, children, onClick }: { href: string; className?: string; children: ReactNode; onClick?: () => void }) {
  return <a href={href} className={className} onClick={(event) => { onClick?.(); transitionTo(event, href); }}>{children}</a>;
}

export function PageTransition() {
  return <div className="page-curtain" aria-hidden="true"><i /><i /><i /><i /></div>;
}

export function SiteHeader({
  brandTone = "light",
  adaptiveBrand = false,
  frostFromSelector = ".work-reel",
}: {
  brandTone?: BrandTone;
  adaptiveBrand?: boolean;
  frostFromSelector?: string;
} = {}) {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resolvedBrandTone, setResolvedBrandTone] = useState<BrandTone>(brandTone);
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const previousOverflow = useRef("");
  const previousOpen = useRef<boolean | null>(null);

  useEffect(() => {
    const close = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && open && !animating) setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [animating, open]);

  useEffect(() => {
    const updateHeader = () => {
      const frostStart = document.querySelector<HTMLElement>(frostFromSelector);
      const headerHeight = document.querySelector<HTMLElement>(".header")?.offsetHeight ?? 78;
      setScrolled(Boolean(frostStart && frostStart.getBoundingClientRect().top <= headerHeight));
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);
    return () => {
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
    };
  }, [frostFromSelector]);

  useEffect(() => {
    if (!adaptiveBrand) {
      setResolvedBrandTone(brandTone);
      return;
    }

    const updateBrandTone = () => {
      const lightHero = document.querySelector<HTMLElement>(".services-hero");
      const headerHeight = document.querySelector<HTMLElement>(".header")?.offsetHeight ?? 82;
      const isOverLightSurface = Boolean(lightHero && lightHero.getBoundingClientRect().bottom > headerHeight);
      setResolvedBrandTone(isOverLightSurface ? "dark" : "light");
    };

    updateBrandTone();
    window.addEventListener("scroll", updateBrandTone, { passive: true });
    window.addEventListener("resize", updateBrandTone);
    return () => {
      window.removeEventListener("scroll", updateBrandTone);
      window.removeEventListener("resize", updateBrandTone);
    };
  }, [adaptiveBrand, brandTone]);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    gsap.registerPlugin(CustomEase);
    CustomEase.create("menuHop", "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1");

    const links = menu.querySelectorAll<HTMLElement>(".site-menu-link");
    const socialLines = menu.querySelectorAll<HTMLElement>(".site-menu-meta p, .site-menu-meta a");
    const video = menu.querySelector<HTMLElement>(".site-menu-video");
    const letters = menu.querySelectorAll<HTMLElement>(".site-menu-wordmark span");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.killTweensOf([menu, links, socialLines, video, letters]);

    if (previousOpen.current === null) {
      previousOpen.current = open;
      gsap.set(menu, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        pointerEvents: "none",
      });
      gsap.set(links, { y: 30, opacity: 0 });
      gsap.set(socialLines, { y: 30, opacity: 0 });
      gsap.set(video, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(letters, { y: 500, rotateY: 90, scale: 0.75 });
      return;
    }

    if (previousOpen.current === open) return;
    previousOpen.current = open;

    if (reduceMotion) {
      gsap.set(menu, {
        clipPath: open
          ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
          : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        pointerEvents: open ? "auto" : "none",
      });
      gsap.set([links, socialLines], { y: open ? 0 : 30, opacity: open ? 1 : 0 });
      gsap.set(video, { clipPath: open ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" });
      gsap.set(letters, { y: open ? 0 : 500, rotateY: open ? 0 : 90, scale: open ? 1 : 0.75 });
      document.body.style.overflow = open ? "hidden" : previousOverflow.current;
      return;
    }

    if (open) {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setAnimating(true);
      gsap.set(menu, { pointerEvents: "auto" });
      gsap.timeline({ onComplete: () => setAnimating(false) })
        .to(menu, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1.5,
          ease: "menuHop",
        }, 0)
        .to(links, { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "power3.out" }, 0.85)
        .to(socialLines, { y: 0, opacity: 1, stagger: 0.05, duration: 1, ease: "power3.out" }, 0.85)
        .to(video, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "menuHop" }, 0.5)
        .to(letters, { y: 0, scale: 1, stagger: 0.05, duration: 1.5, ease: "power4.out" }, 0.5)
        .to(letters, { rotateY: 0, stagger: 0.05, duration: 1.5, ease: "power4.out" }, 0.75);

      window.setTimeout(() => menu.querySelector<HTMLAnchorElement>(".site-menu-link a")?.focus(), 850);
    } else {
      setAnimating(true);
      gsap.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 0.975,
        ease: "menuHop",
        onComplete: () => {
          gsap.set(menu, {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            pointerEvents: "none",
          });
          gsap.set(links, { y: 30, opacity: 0 });
          gsap.set(socialLines, { y: 30, opacity: 0 });
          gsap.set(video, { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(letters, { y: 500, rotateY: 90, scale: 0.75 });
          document.body.style.overflow = previousOverflow.current;
          setAnimating(false);
          toggleRef.current?.focus();
        },
      });
    }

    return () => gsap.killTweensOf([menu, links, socialLines, video, letters]);
  }, [open]);

  useEffect(() => () => {
    document.body.style.overflow = previousOverflow.current;
  }, []);

  const trapFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || !open) return;
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      toggleRef.current?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      toggleRef.current?.focus();
    }
  };

  const wordmark = "BFO";

  return (
    <header className={`header brand-${resolvedBrandTone} ${open ? "menu-active" : ""} ${scrolled ? "scrolled" : ""}`}>
      <Brand tone={resolvedBrandTone} />
      <button
        ref={toggleRef}
        className={`menu-toggle ${open ? "opened" : "closed"}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="navigation"
        disabled={animating}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (open && event.key === "Tab" && event.shiftKey) {
            const focusable = menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
            const last = focusable?.[focusable.length - 1];
            if (last) {
              event.preventDefault();
              last.focus();
            }
          }
        }}
      >
        <span className="menu-copy" aria-hidden="true">{open ? "Close" : "Menu"}</span>
        <span className="menu-toggle-icon" aria-hidden="true">
          <span className="hamburger"><i data-position="top" /><i data-position="bottom" /></span>
        </span>
      </button>

      <nav
        ref={menuRef}
        id="navigation"
        className="site-menu"
        aria-label="Main navigation"
        aria-hidden={!open}
        inert={!open ? true : undefined}
        onKeyDown={trapFocus}
      >
        <div className="site-menu-col site-menu-primary">
          <Brand tone="light" />
          <div className="site-menu-links">
            {navigation.map(([label, href]) => (
              <div className="site-menu-link" key={href}>
                <TransitionLink href={href} onClick={() => setOpen(false)}>{label}</TransitionLink>
              </div>
            ))}
            <div className="site-menu-link site-menu-cta">
              <TransitionLink href="/#contact" onClick={() => setOpen(false)}>Discuss Your Project <ArrowUpRight size={28} weight="light" /></TransitionLink>
            </div>
          </div>
          <div className="site-menu-video">
            <video autoPlay muted loop playsInline poster="/assets/world/poster.webp">
              <source src="/assets/world/hero-mobile.mp4" media="(max-width: 700px)" type="video/mp4" />
              <source src="/assets/world/hero.mp4" type="video/mp4" />
            </video>
            <div className="site-menu-video-index" aria-hidden="true">
              <span><b>1</b><small>Find</small></span>
              <span><b>2</b><small>Build</small></span>
              <span><b>3</b><small>Grow</small></span>
            </div>
            <div className="site-menu-video-social" aria-hidden="true">
              <strong>Instagram</strong>
              <span className="site-menu-social-middle">
                <strong>Behance</strong>
                <span className="site-menu-eyes"><i /><i /></span>
                <strong>Facebook</strong>
              </span>
              <strong>LinkedIn</strong>
            </div>
          </div>
        </div>

        <div className="site-menu-col site-menu-secondary">
          <div className="site-menu-meta">
            <div>
              <p>Better Found Online</p>
              <p>Web, creative, SEO and marketing</p>
              <p>For the U.S. and beyond</p>
              <br />
              <a href="mailto:hello@betterfoundonline.com">hello@betterfoundonline.com</a>
              <a href="tel:+15707077078">+1 (570) 707-7078</a>
            </div>
            <div>
              <p className="site-menu-meta-label">Social profiles</p>
              <p>Instagram</p>
              <a href="https://www.linkedin.com/company/better-found-online" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <p>Facebook</p>
              <p className="site-menu-coming-soon">Launching soon</p>
              <br />
              <a href="https://wa.me/15707077078" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>
          <div className="site-menu-wordmark" aria-label="Better Found Online">
            {Array.from(wordmark).map((letter, index) => (
              <span aria-hidden="true" key={`${letter}-${index}`}>{letter === " " ? "\u00a0" : letter}</span>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter({ motionPaused, onMotionToggle }: { motionPaused?: boolean; onMotionToggle?: () => void }) {
  return (
    <footer id="site-footer" className="footer">
      <div className="footer-directory">
        <div className="footer-brand-block">
          <Brand large />
          <p>Website design, creative production, SEO, and digital marketing for businesses in the U.S. and beyond.</p>
        </div>
        <nav aria-label="Footer navigation">
          <p className="footer-label">Explore</p>
          <TransitionLink href="/work">Work</TransitionLink>
          <TransitionLink href="/services">Services</TransitionLink>
          <TransitionLink href="/studio">Studio</TransitionLink>
          <TransitionLink href="/insights">Insights</TransitionLink>
        </nav>
        <div>
          <p className="footer-label">Services</p>
          <TransitionLink href="/services">Website Design</TransitionLink>
          <TransitionLink href="/creative-production">Creative Production</TransitionLink>
          <TransitionLink href="/services">SEO &amp; Content</TransitionLink>
          <TransitionLink href="/services/performance-marketing">Performance Marketing</TransitionLink>
          <TransitionLink href="/services/social-media-management">Social Media Management</TransitionLink>
          <TransitionLink href="/services">CRM &amp; Integrations</TransitionLink>
        </div>
        <div>
          <p className="footer-label">Start a conversation</p>
          <a href="mailto:hello@betterfoundonline.com">hello@betterfoundonline.com</a>
          <a href="tel:+15707077078">+1 (570) 707-7078</a>
          <a href="https://www.linkedin.com/company/better-found-online" target="_blank" rel="noopener noreferrer">Follow us on LinkedIn</a>
          <a href="https://wa.me/15707077078" target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
        </div>
      </div>

      <div className="footer-wordmark" aria-hidden="true">BFO</div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Better Found Online</span>
        <span>Found. Understood. Chosen.</span>
        <TransitionLink href="/privacy">Privacy</TransitionLink>
        <CookieSettingsButton />
        {onMotionToggle && <button onClick={onMotionToggle} aria-pressed={motionPaused}>Motion {motionPaused ? "Off" : "On"}</button>}
        <a href="#main">Back to top ↑</a>
      </div>
    </footer>
  );
}
