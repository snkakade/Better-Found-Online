# Mobile visual audit - 29 October 2026

Branch: `new-colour`. Public website only; no console, database, or main-branch changes.

## Follow-up: rendering and iPhone video failures

The earlier checks below missed real rendering failures reported in the user's
iPhone screenshots. Layout measurements alone did not catch invisible GSAP
reveals, a stale accordion height, or a video with no painted frame. This
follow-up corrects those paths rather than treating the earlier audit as a
physical-device pass.

- Homepage scroll reveals no longer hide mobile headings, service rows, or
  insight cards. Mobile content is visible from the initial HTML/CSS state.
- The three mobile chapters now use ordinary document flow, with their own
  eagerly loaded artwork. The duplicate sticky stage, counter, and navigation
  labels are not rendered visually on mobile. The tunnel remains in the hero;
  it no longer competes with chapter copy. Desktop tunnel choreography remains.
- Mobile service disclosures use native details without cancellable height
  animations. Closed panels explicitly leave layout; open panels size to content.
- Homepage project videos have definite 16:10 media boxes, not percentage
  heights inside indefinite grid rows. This removes the large blank video area.
- Ten existing website/device recordings now have smaller H.264 Main/yuv420p,
  fast-start MP4 derivatives. Real videos remain on iPhone; they are not replaced
  by static photos. Exact encoded-frame covers appear only while video prepares.
  A visible play/retry action remains until playback starts, including a stalled
  request or blocked autoplay. Videos become visible after a painted video frame.
- Website-page projects and Work device screens share this playback path. A
  failed device no longer blocks the other previews in a readiness polling loop.
- The creative showcase starts its visible mobile video without waiting for the
  hidden duplicate half to buffer. Creative films, before/after examples, and
  search/advertising clips retain real playable media and a user-gesture path.
- Removed the showcase edit's 3.1-second black ending in a separate web-loop
  derivative. No picture content was cropped; the original file is unchanged.
- Live verification exposed a delivery issue as well: the Pages asset binding
  returned 200/full video bodies for byte-range probes. Public video responses
  now supply streaming single-range 206 responses when the binding ignores the
  Range header. Existing partial/error responses, validators, HEAD requests,
  compression, non-video assets, and console-host requests are preserved.
- Restored the SEO hero video on phones and kept the advertising video on short
  screens. Balanced the website hero line wrapping and made the scrolled mobile
  header opaque immediately.

Follow-up verification:

- Rechecked all 16 public routes at 320, 390, 440, and 768 px, including scrolled
  positions. In-view headings/body text and ancestor visibility were checked,
  not just element dimensions. Reviewed rendered screenshots of the problem
  sections, service pages, website projects, Work devices, creative footage,
  insights, and legal pages. No hidden in-view text, broken displayed images, or
  page-level horizontal overflow was found in these checks.
- Observed advancing playback time and painted footage in the homepage reel,
  website projects, Work phone, creative showcase/films/before-after, and
  SEO/advertising clips. Offscreen previews pause.
- Interrupted MP4 downloads, verified the real play action stayed available,
  restored the connection, and started the video through that action. The
  recovered CharterX preview reached readyState 4 and advanced normally.
- All ten derivatives have validated codecs/pixel format and size limits.
  Frame-zero cover files are byte-for-byte matches to FFmpeg extraction from
  their encoded clips. The trimmed showcase loop ends before the black tail.
- 59 Node regression tests, UI contract checks, TypeScript, and the Pages build
  pass. Bun is unavailable locally; equivalent npm/Node checks were used.

These are Chrome responsive-rendering and media-recovery checks, not a claim
of a physical iPhone/Safari run. No physical iPhone or Safari automation surface
was available. iOS Low Power Mode can prevent autoplay; the explicit play action
is the supported user-gesture recovery, not a promise to bypass browser policy.

## Earlier audit (retained for history)

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
