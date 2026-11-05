# Public website release QA

Branch: `new-colour`. Scope: all 16 public sitemap routes. The console and app scaffold are outside this public website change.

## Implemented

- SEO related services now have four distinct destinations, concrete benefits, visible arrows and whole-card links.
- SEO removes repeated visibility/comparison sections and replaces jargon lists with short descriptions of actual work.
- Shared video, CGI, animation, graphic design and social pages separate service scope and deliverables into readable lists.
- Homepage, Services, Work, Studio, Creative, Insights, Website Design and Paid Advertising use shorter introductions and more specific headings.
- Insights proceeds from its introduction to the guides; its short articles no longer claim a two-minute reading time.
- Pages with their own final project action omit the repeated oversized footer CTA. Work retains its dedicated project CTA.
- Studio process steps use a compact layout and enter without fading text to low opacity. Image accordion labels have solid, readable surfaces.
- Footer labels, copyright and navigation use Outfit, readable sizes and stronger contrast.
- Each creative capability renders either one native video or one relevant production photograph. There is no separate loading photograph, offset video half or stacked clip behind active footage. Its title, service links and previous/next controls sit outside the video.
- The social-video capability uses the supplied social edit rather than unrelated coding footage. Three other unrelated stock placeholders, including underwater footage and generic effects, are replaced with relevant production photography.

Existing routes, service anchors, contact form fields, consent wording, privacy/terms text, report figures and evidence qualifications remain intact. The homepage tunnel and the slowed Services introduction remain intact.

## Release checks

```sh
cd app
npm run build:pages
node --test tests/*.test.mjs
python3 scripts/audit-public-site.py http://localhost:8788 --report /tmp/bfo-public-site-qa.json
```

The last command expects the packaged Pages build to be served locally. It checks sitemap routes, titles/descriptions/canonicals, H1 counts, duplicate IDs, local fragment targets, media and responsive image sources. It also checks that the creative capability carousel has one video and no photograph layers. Long initial paragraphs and headings are reported for editorial review; legal text and expanded FAQs are excluded from that scan.

The current automated suite has 71 passing checks. The structural audit covers 16 routes and 75 local media/destination URLs, with no errors.

## Visual release gate remains open

Browser control could discover tabs, but navigation, inspection and screenshots repeatedly failed with a `timeoutMs` error. Reconnecting, obtaining a fresh browser and starting a clean test session did not recover those actions. No desktop/mobile screenshots were captured for this release. Automated/source checks do **not** establish a completed visual audit or production sign-off.

When browser control works, review every public route at desktop 1440×800 and 1920×1080, and mobile 320×740, 390×844 and 430×932. Check:

- Headline, service purpose and next action are understandable immediately; detailed FAQs and evidence stay available on demand.
- No horizontal page overflow, cropped headings, masked letters or overlapping navigation.
- All creative carousel slides use one clean media item and advance by pointer and keyboard. The four supplied video edits autoplay muted without player controls; other capabilities use production photography.
- Website previews retire their exact-frame loading image after a painted video frame.
- Contact validation, service selection and WhatsApp review work without sending a message automatically.
- Navigation, disclosures, filters, focus states and reduced-motion layouts remain usable.
- iPhone autoplay is checked on a real device; operating-system autoplay restrictions still apply.

The three-second rule is an editorial design target, not a duration the automated checks can certify.
