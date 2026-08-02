# Homepage Visual Comparison

Reference: `references/deccan-wheels-homepage-reference.png`

## Final Status

- The homepage follows the reference section order and uses real React/HTML controls throughout.
- The high-DPI desktop capture is `1920 x 3183`, aligned to the supplied reference's approximately `1920 x 3200` composition.
- The desktop content area renders at 1750 physical pixels with approximately 85-pixel outer margins.
- The hero headline, showroom sign, sedan crop, statistics overlap, search panel, brand strip, five-card inventory row, benefits, service promotions, testimonials, Instagram gallery, four-column contact row, and footer were visually checked in system Chrome.
- The final hero is a separate local high-resolution image with no baked-in UI text: `public/images/hero/deccan-wheels-hero-v3.png`.
- The `1440px` CSS/high-DPI desktop layout has dedicated sizing so Windows display scaling preserves the reference proportions.
- The application preview is standardized at `http://localhost:3001`.

## Browser Checks

- Desktop high-DPI: 1440 x 900 CSS pixels, 1.333 device scale, 1920 x 3183 full-page capture
- Desktop: 1920 x 1080
- Mobile: 390 x 844
- No horizontal overflow
- No Next.js error overlay
- No browser page errors
- Hero headline remains exactly two lines on desktop
- All ten brand marks render

## Validation

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm test`: passed
- `npm run build`: passed
