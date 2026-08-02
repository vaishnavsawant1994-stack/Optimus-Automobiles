# Database Inventory Audit

Date: 2026-08-02

Public brand: Deccan Wheels

Workspace folder: `Optimum Automobiles` (folder name is not public branding)

## Existing schema status

- `prisma/schema.prisma` already targets PostgreSQL and contains foundational models for users, brands, body types, vehicles, images, features, favourites, enquiries, test drives, sell requests, contacts, newsletter subscribers, testimonials, gallery items, showrooms, content blocks, settings and audit logs.
- The original inventory schema lacks the final public inventory status enum, detailed vehicle specifications, image metadata, feature categories, display ordering and the compound indexes required for public queries.
- No migration directory or applied migration exists.
- `prisma/seed.ts` only upserts ten brand names and one showroom.
- No reusable Prisma singleton, repository layer, service layer or UI DTO layer exists.
- `DATABASE_URL` is blank in `.env.example`; no checked-in secrets exist.

## Current data sources

- `lib/constants/site.ts` contains a homepage `vehicles` array, a `brands` array, testimonials, gallery data and search-route data.
- `lib/constants/interior.ts` contains a second `inventoryVehicles` array with a different shape, values and set of cars.
- Homepage new arrivals and search options read directly from `site.ts`.
- Inventory filtering and sorting load all records from `interior.ts` and process them in the browser.
- `/api/vehicles`, `/api/brands` and `/api/search` return constant or memory-backed data.
- Testimonials and gallery remain static content in this milestone unless explicitly migrated for shared site data.

## Duplicated types and formatting

- Homepage and inventory vehicle records use implicit array-derived types rather than shared DTOs.
- Prices and mileages are stored as formatted strings in local constants and reparsed for filtering.
- Vehicle card fields use both `make` and `brand` terminology.
- Badge/status values such as `New`, `Certified` and `Signature` are not tied to a canonical database status.

## Components requiring migration

- `components/home/HomePage.tsx`: brand carousel, make/model search and new arrivals.
- `components/inventory/InventoryPage.tsx`: filters, sorting, pagination, cards and local favourites.
- `components/layout/Header.tsx`: global search currently filters `searchableRoutes` in memory.
- `app/api/vehicles/route.ts`: static vehicle response.
- `app/api/brands/route.ts`: static brand response.
- `app/api/search/route.ts`: static route/vehicle search.

## Placeholder and missing routes

- `app/[...slug]/page.tsx` renders a generic placeholder for vehicle details, brands, body types, compare, favourites, service details, customer and admin routes.
- `/inventory/[slug]`, `/brands`, `/brands/[slug]`, `/body-types`, `/body-types/[slug]` and `/compare` do not have real route implementations.
- Inventory pagination buttons are visual only.
- Vehicle cards do not yet open database-backed detail pages.

## Memory and browser-only behaviour

- Inventory favourites are stored in `localStorage` only.
- Newsletter subscriptions are stored in a process-local `Set` and reset when the server restarts.
- Contact and sell-request APIs validate and return success but do not persist records.
- Valuation upload files are selected and validated in the browser but are not stored.

## Branding inconsistencies

- Public UI, metadata, README and current content use `Deccan Wheels` consistently.
- The workspace and npm package use `Optimum Automobiles` / `optimum-automobiles`; these are internal identifiers and may remain.
- Database seed settings, future email templates, structured data and legal copy must use `Deccan Wheels`.

## Route inconsistencies

- Internal links still use `/services/ownership-transfer`; canonical route is `/services/rc-transfer`.
- `/contact-us` currently has a route file rather than a permanent canonical redirect to `/contact`.
- Existing navigation uses non-canonical body-type slugs `luxury-sedan` and `premium-suv`; canonical slugs are `sedan` and `suv`.
- Public favourites use `/favorites`; customer favourites will use `/account/favourites`.

## Environment and tooling

- Docker Desktop and Docker Compose are installed; the Docker engine was not running at audit start.
- The workspace is not a Git repository, so logical Git checkpoints cannot be produced without initialization.
- Prisma 7.9.1 and `@prisma/client` 7.9.1 are installed.
- Next.js 16.2.12, React 19, Vitest and Playwright are configured.

## Migration risks

- Replacing client filtering with server queries changes `InventoryPage` ownership and requires URL parameters to be parsed before rendering.
- Static generation must handle a temporarily unavailable development database without silently hiding production failures.
- Prisma 7 configuration and generated client output must remain server-only and compatible with Next.js hot reload.
- Existing remote image URLs need deterministic primary-image ordering and safe fallbacks.
- Search, card and detail data must share DTOs to prevent another divergent local model.
- Public visibility must always enforce `published = true` and `status` in `AVAILABLE`, `RESERVED` or explicitly accessible `SOLD` detail records.
- Seed operations must be idempotent and must refuse to run against production.

## Migration approach

1. Add Docker PostgreSQL and environment documentation.
2. Refine the existing schema without deleting future-facing models.
3. Create and apply a real migration.
4. Seed deterministic brands, body types, features, vehicles, images, showroom and settings.
5. Introduce DTOs, mappers, repositories and services.
6. Convert APIs and public pages to server-side database queries.
7. Retain local data only as an explicit development fallback for the homepage when the database is unavailable; never silently fall back in production.

