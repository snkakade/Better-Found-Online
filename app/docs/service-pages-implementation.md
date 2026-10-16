# Service pages implementation record

## Source audit

Reviewed the former Shreyash Kakade site as reference material, including:

- `websites/index.html`, `assets/css/websites.css`, and `assets/js/websites.js`
- the website cost, delivery timeline, brief checklist, and SEO-versus-Google-Ads guides
- the dental-practice SEO case study and existing SEO verification script
- the portfolio media and editorial image library

The implementation adapts the useful commercial guidance to Better Found Online's voice and design system. It does not copy the former site's navigation, visual system, analytics, pricing, or unsupported performance claims.

## Content coverage

The Websites page includes the hero, positioning, five-filter portfolio, business-value principles, site formats, experience details, five-stage process, scoping/timeline guidance, investment and ownership questions, briefing guidance, related services, FAQs, and closing CTA.

The SEO & AI Search page includes the hero, changing discovery journey, visibility principles, technical SEO, search intent and information architecture, content strategy, GEO/AEO, measurement and search reviews, traditional-versus-AI search comparison, technical foundation, content framework, SEO-versus-paid decision guidance, evidence, five-stage process, realistic expectations, related services, FAQs, and closing CTA.

## Asset migration manifest

Portfolio videos copied to `public/assets/service-pages/websites/`:

- `dr-shweta.webm`
- `charterx.webm`
- `say-vanilla.webm`
- `tech-sales.webm`
- `hello-honey-bunny.webm`

Editorial images copied to `public/assets/service-pages/editorial/`:

- `website-design-studio.jpg`
- `responsive-web-system.jpg`
- `seo-discovery-network.jpg`
- `guides-research-library.jpg`

All assets are served locally from the Better Found Online project. No production dependency points back to the source repository.

## Motion and interaction manifest

- Existing BFO page transition and frosted global navigation are retained.
- Project filters use accessible pressed states and announce the updated card collection.
- Portfolio previews use native video controls, muted inline playback, and optional hover playback on pointer devices.
- CSS transitions are limited to functional feedback on links, buttons, cards, and details disclosures.
- `prefers-reduced-motion` disables animated project previews and non-essential transitions.
- No separate animation-gallery repository was found in the available website repositories, so no unverified animation package was imported.

## Routes and discovery

- `/services/websites`
- `/services/seo-ai-search`

Both routes are linked from the global menu, footer, Services hub, homepage Build/Grow paths, related-service modules, and XML sitemap. Each has a canonical URL, unique title and description, one H1, Open Graph metadata, Service schema, and BreadcrumbList schema.

## Publication checks and approvals

- Founder-portfolio attribution is disclosed on the Websites page.
- SEO evidence remains qualitative until attribution, reporting periods, and permissions are verified.
- No ranking, traffic, citation, AI-answer inclusion, or commercial outcome is guaranteed.
- Project publication remains subject to applicable client permissions.
