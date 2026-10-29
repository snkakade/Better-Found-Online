# Mobile visual audit - 29 October 2026

Branch: `new-colour`. Public website only; no console, database, or main-branch changes.

## Coverage

All 16 public routes were checked at 320 x 568, 390 x 844, 430 x 932, and 768 x 1024:

- Home, Services, Websites, SEO & AI Search, Performance Marketing
- Creative Production, Video Production & Editing, 3D & CGI, Motion Graphics, Graphic Design, Social Media Management
- Work, Studio, Insights, Privacy, Terms

The checks combined rendered screenshots, section-level visual inspection, DOM measurements, and interaction tests in Chrome device emulation. This is not a physical-device Safari certification or a Lighthouse performance audit.

## Issues corrected

- Mobile menu links were oversized and overlapped; Studio and Insights were difficult to find. The core pages now remain visible, with a native Services disclosure and 44 px service-link targets. Focus returns to the menu toggle on Escape, closed service links are skipped, and body scrolling is restored.
- Desktop service narratives pinned for several phone screens and reduced copy to about 11 px. Up to 900 px they now read in document order at 16 px, with the original images, copy, destinations, and desktop motion retained.
- Service chapters used narrow, offset text panels and excessive vertical whitespace. Mobile panels now align to a shared 20 px gutter, with shorter cards and consistent heading and paragraph scales.
- Hero actions appeared too late, especially on shorter phones. Mobile heroes are content-sized, and the Services overview places its actions before its swipeable imagery.
- Landscape creative videos were cropped behind overlaid titles and controls. On mobile the full video is shown in a 16:9 frame, with headings and actions outside the footage. Website previews also use contain sizing. Existing before/after media retains its full frame.
- The creative process used app-kit typography and small numbered controls. It now uses native, branded, touch-sized controls with visible labels.
- Video showcase playback now pauses offscreen, in hidden tabs, and for reduced motion. The hidden duplicate video half is not played on mobile.
- Enquiry inputs used 15 px text, which can trigger iPhone focus zoom. Text fields now use 16 px; no fields, validation, or submission behavior changed.
- Footer targets were too small, and legal pages lacked the shared site wrapper. Footer navigation now has 44 px targets and readable text, including on legal pages.
- Cookie choices were undersized. Mobile choices now use 14 px body text, 48 px actions, safe-area spacing, and a bounded scrollable panel. Consent wording and stored preferences are unchanged.

## Verification

- 64 route/viewport checks: no page-level horizontal overflow, clipped text, broken rendered images, undersized footer targets, undersized text inputs, or mobile service-story pinning.
- Decorative zoomed images and intentionally scrollable galleries were excluded from text-overflow assertions; their visible framing was reviewed separately.
- Tested menu open/close, keyboard focus return, closed Services focus order, Services disclosure, website filters, insight filters, FAQ expansion, campaign tabs, expanded source-report figures, creative process selection, and reduced-motion video behavior.
- The source-report consumer metrics remain readable without overflow. Currency, figures, reporting periods, and disclosures were not changed.
- Existing royal blue, white, red, logo, imagery, URLs, metadata, legal copy, and form fields preserved.
- Desktop navigation and the two-line website hero were checked after restoring the browser viewport.
- 32 regression tests pass. `npm run build:pages` passes, including UI contract checks and TypeScript.

No forms were submitted and no cookie consent choices were saved during testing.
