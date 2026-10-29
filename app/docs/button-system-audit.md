# Public-site actions and advertising cues

Branch: `new-colour`. Main and console styling are unchanged.

## Shared design system

`src/site-actions.css` is the single public-site action layer. Existing labels,
destinations, form handling, analytics attributes and section order are preserved.
The frontend design review kept the existing brand and layout rather than adding
a new framework, component library or animation dependency.

- Primary: tomato red `#BB232B`, mixed with white for the top stop and royal blue
  `#20309A` for the lower stop. White labels; calculated gradient contrast is
  5.68:1 at the lightest stop and 7.02:1 at the darkest stop.
- Secondary: outlined, subtly tinted surface with restrained inset lighting.
- Tertiary: compact underlined actions without a raised slab.
- 10px corners, 16px Outfit labels, 52–56px primary touch targets.
- Four primary shadow layers: top inset highlight, lower inset shade, contact
  shadow and a diffused red ambient shadow. Hover lifts 1px over 220ms; press
  moves down 1px over 120ms and replaces raised lighting with an inset shadow.
- Keyboard focus has a white outline and blue outer ring. Disabled and busy
  states suppress lift. Reduced motion removes translation and transitions.
  Forced-colour mode uses system colours. Long mobile labels wrap.

The reference reel could not be fetched; its supplied CSS technique and detailed
written specification were implemented directly. No claim is made to have watched it.

## Changed files

Action coverage:

- `src/site-actions.css`
- `src/components/service-landing.tsx` — related-service actions use secondary emphasis.
- `src/routes/work.tsx` — enquiry remains primary; browsing work is secondary.

Platform cues:

- `src/components/ad-platform-mark.tsx` and `.css`
- `src/components/performance-proof-cards.tsx`
- `src/performance-evidence.css`
- `src/routes/services_.performance-marketing.tsx`
- `public/assets/platforms/linkedin-mark.png` and `bing-logo.svg`

Existing Google Ads and Amazon Ads artwork is reused. Supplied LinkedIn and Bing
assets are copied without recolouring. Meta uses the clean vector already
available in the installed icon library, avoiding a supplied raster with a baked
checkerboard background. Report tabs and report headers only show the platform
that produced that report. Search/social platform cues are separate from results;
they do not imply partnerships, certification or additional performance evidence.

Autoplay and player-UI removal:

- `src/hooks/use-autoplay-video.ts`
- `src/components/ambient-video.tsx`
- `src/components/website-preview.tsx` and `.css`
- `src/components/creative-story-components.tsx`
- `src/components/creative-proof-reel/creative-proof-reel.tsx` and `.css`
- `src/routes/studio.tsx`
- `src/search-ads-video.css`, `src/service-detail.css`, `src/mobile-refinements.css`

Native controls and custom play/retry/pause overlays are removed from public-site
videos. Footage remains muted, looping and inline, with visibility-based playback,
gesture/connection retries and reduced-motion support. Existing H.264 delivery,
Safari byte-range handling, exact-frame loading covers and the mobile showcase's
hidden-half buffering fix are preserved. Scroll-scrub engines are unchanged.

Regression coverage:

- `tests/site-actions.test.mjs`
- `tests/mobile-layout.test.mjs`
- `tests/mobile-rendering.test.mjs`

## Verification

- `npm run build:pages`: passed, including UI contract and TypeScript checks.
- `node --test tests/*.test.mjs`: 64 passed, 0 failed.
- ESLint on changed TypeScript/TSX files: passed.
- `git diff --check`: passed.
- Full `npm run lint`: six pre-existing errors in untouched files:
  `analytics-consent.tsx`, `site-chrome.tsx`, `ui/carousel.tsx`, `use-mobile.ts`
  (set-state-in-effect), and two in `lib/analytics.ts` (rest parameters/const).
- `npm test`: unavailable because the environment does not have Bun. The separate
  Bun-only `.test.ts` suites were not run.

Browser inspection used the built Cloudflare Pages bundle. Desktop 1440px,
tablet 768px, mobile 390px and narrow 320px layouts were checked. Representative
visual checks covered blue, white and image-backed surfaces, header/mobile menu,
homepage hero, website projects, paid report tabs, creative videos, contact submit
and footer. Mobile DOM checks also covered Services, Work, Studio, Insights, SEO
and the generic social-service template, with no clipped action labels or page
horizontal overflow in those checks.

Campaign tabs were tested with arrow keys; exactly one corresponding panel stays
visible. Real hover, mouse-down and keyboard focus checks were performed. Video
playback was observed with `readyState = 4`, advancing time and `controls = false`.
Forms and external messaging actions were not submitted during QA.

## Limitations

Physical iPhone/Safari testing was not available; responsive browser emulation and
existing H.264/range regression checks are not a substitute for it. iOS Low Power
Mode or other browser policies can still block autoplay. Reduced-motion users
intentionally do not receive autoplay. Player controls were removed as requested;
there is no visible per-video playback override. Disabled/busy/forced-colour
treatments have shared CSS and regression coverage, not an invented form-loading
workflow. Unrelated lint failures and unavailable Bun suites remain as noted above.
