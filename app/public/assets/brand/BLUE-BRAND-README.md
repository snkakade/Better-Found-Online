# Better Found Online — blue brand assets

- `profile-blue-2048.png`: 2048 × 2048 square PNG for LinkedIn and social profile pictures. Upload the complete square; do not crop into the logo.
- `profile-blue.svg`: scalable master with the original logo paths, pure white mark, and royal-blue gradient anchored in #20309A.
- `favicon.ico`: multi-resolution browser icon (16, 32, 48, 64, 128 and 256 px), included in the download kit. The website serves the same file at `/favicon.ico`.
- `icon-16.png`, `icon-32.png`, `icon-48.png`: browser PNG fallbacks.
- `icon-180.png`: Apple touch icon. `icon-192.png` and `icon-512.png`: standard app icons.
- `maskable.png` and `maskable-blue.svg`: app icon with extra safe space for circular and rounded operating-system masks. Not the social profile version.

The original uploaded image and existing header-logo assets are unchanged. Console icons use matching exports. Versioned favicon references and a new console service-worker cache identity prevent the old burgundy icons being reused.

## Creation

Built-in image editing was used to establish the blue-gradient treatment from the supplied image. The final downloadable assets were then rendered directly from the repository's matching original vector logo (`mark-light.svg` paths), with the mark changed to pure white. This preserves exact geometry and produces true high-resolution edges rather than enlarging an AI-generated raster.

Re-export on macOS with `node scripts/export-blue-brand.mjs` from `app`.

### Image-editing prompt

Use case: precise-object-edit / logo-brand. Image 1 is the edit target, not just inspiration. Create the blue-theme version of this exact Better Found Online logo tile. Preserve the exact existing mark: its shape, proportions, smooth rounded stroke ends, internal gaps, floating curved segment, orientation, scale and placement. Change the warm off-white mark to pure white #FFFFFF. Replace only the burgundy background with a beautiful premium smooth royal-blue gradient anchored in the brand colour #20309A: luminous rich royal blue around the centre and lower right, gently deepening to darker blue/navy around the opposite edges. The blue should feel rich, clean, modern and minimal, not purple or cyan. The gradient must be refined and seamless without banding, noise, grain, waves or added shapes. Keep the mark flat and extremely crisp, with no bevel, metallic shading, glow, drop shadow, texture or redesign. Preserve the original generous margins so the entire mark fits inside a circular social-profile crop. Full-bleed opaque blue background, square 1:1 composition, no frame, no text, no extra symbols, no watermark. Intended for a high-definition LinkedIn/company social profile image and matching website favicon. Render at 2048 by 2048 pixels or the highest available square resolution.
