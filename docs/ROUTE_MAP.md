# Route Map

## Implemented public routes

- `/`
- `/inventory`
- `/inventory/[slug]`
- `/brands`
- `/brands/[slug]`
- `/body-types`
- `/body-types/[slug]`
- `/sell-your-car`
- `/services`
- `/about-us`
- `/contact`

## Canonical redirects

- `/contact-us` to `/contact`
- `/services/ownership-transfer` to `/services/rc-transfer`
- `/ownership-transfer` to `/services/rc-transfer`

## Database APIs

- `GET /api/vehicles`
- `GET /api/vehicles/[slug]`
- `GET /api/brands`
- `GET /api/body-types`
- `GET /api/search`
- `POST /api/inquiries`
- `POST /api/test-drives`

## Existing form/content APIs

- `/api/contact`
- `/api/newsletter`
- `/api/sell-request`
- `/api/testimonials`
- `/api/gallery`

## Later milestone routes

Compare, authenticated favourites, customer accounts, detailed service subpages, legal documents and admin routes remain later-phase work. The catch-all currently provides the existing styled temporary surface for those links.
