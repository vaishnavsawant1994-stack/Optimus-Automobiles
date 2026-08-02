# Database Inventory Implementation Report

## Outcome

The Deccan Wheels public catalogue now reads inventory from PostgreSQL through Prisma. Local arrays remain only as an explicitly logged homepage fallback when a development database is temporarily unavailable; production throws instead of silently displaying fallback inventory.

## Database and seed

- Docker Compose PostgreSQL 17 with a persistent named volume and health check.
- Local port `5435` avoids other PostgreSQL containers already using `5432` through `5434`.
- Prisma 7 uses `prisma.config.ts` and the PostgreSQL driver adapter.
- Migration: `20260802152914_inventory_foundation`.
- Deterministic seed: 10 brands, 8 body types, 30 vehicles, 32 reusable features and 150 ordered vehicle images.
- Each normal vehicle has 3 images; each of the 12 featured vehicles has 8.
- Re-running the seed updates stable records and replaces only seeded vehicle images/features, preventing uncontrolled duplicates.

## Architecture

Repositories contain database access only:

- `vehicle-repository.ts`: public listings/details, featured/new arrivals, related cars, search, view counts and filter metadata.
- `brand-repository.ts`: active/featured brands, slug lookup and database counts.
- `body-type-repository.ts`: active body types, slug lookup and database counts.

Services contain validation-facing query behavior and DTO mapping:

- `inventory-service.ts`: Prisma where clauses, sorting, pagination, filter metadata and DTO output.
- `vehicle-detail-service.ts`: detail mapping, related vehicles and safe view-count updates.
- `search-service.ts`: limited public vehicle suggestions.

Shared DTOs live in `lib/types/inventory.ts`. Database records are mapped in `lib/mappers/vehicle-mapper.ts`; raw Prisma models are not passed directly into client components.

## Public integration

- Homepage new arrivals and brand logos use PostgreSQL.
- `/inventory` executes filtering, sorting and pagination in PostgreSQL, with URL parameters as the source of truth.
- `/inventory/[slug]` displays database title, price, status, specifications, features, inspection summary, related vehicles and ordered images.
- The gallery includes thumbnails, previous/next controls, image counts, swipe, keyboard controls, Escape close, focus wrapping and focus restoration.
- Vehicle enquiry and test-drive forms validate on the client and server and persist to `Inquiry` and `TestDrive`.
- `/brands`, `/brands/[slug]`, `/body-types`, and `/body-types/[slug]` use database counts and reuse the inventory interface.
- Header search calls `/api/search` and no longer searches a memory array.

## APIs

- `GET /api/vehicles`
- `GET /api/vehicles/[slug]`
- `GET /api/brands`
- `GET /api/body-types`
- `GET /api/search`
- `POST /api/inquiries`
- `POST /api/test-drives`

Errors use public-safe structured payloads. Prisma error details are logged server-side and are not returned to users.

## Routes and redirects

- `/contact-us` permanently redirects to `/contact`.
- `/services/ownership-transfer` and `/ownership-transfer` permanently redirect to `/services/rc-transfer`.
- Internal ownership-transfer links now use `/services/rc-transfer`.

## Freshness strategy

Public inventory, homepage inventory, detail, brand, body-type and inventory APIs use dynamic server rendering. This avoids stale availability before an admin-triggered invalidation workflow exists. A later admin milestone may add tagged caching and `revalidateTag` after vehicle mutations.

## SEO and states

- Dynamic vehicle metadata, canonical URLs, Open Graph images, Product JSON-LD and Breadcrumb JSON-LD.
- Brand/body metadata and canonicals.
- Sold details are visible but marked unavailable and set to no-index.
- Draft, archived and unpublished vehicles return no public data.
- Detail loading skeleton, inventory empty state, designed vehicle 404 and safe image fallback.

## Tests

- Unit coverage: slug generation, query parsing, Prisma where clauses, sort clauses, INR/mileage formatting.
- PostgreSQL integration coverage: seed size, brand/body counts, combined filters, pagination, slug lookup, detail mapping, related exclusion and unpublished/archive exclusion.
- Playwright coverage: database listing/detail, URL filters, sort, pagination, refresh persistence, gallery, brand/body constraints, database search, invalid slug, redirects and 390px overflow.
- Final results: 14 Vitest unit/integration tests and 21 Playwright browser tests passed. Prisma format, validation, generation, migration, seed, lint, typecheck and production build also passed.
- The migration was applied to a new temporary `deccan_wheels_verify` database; 20 public application tables were confirmed before that temporary database was removed.

## Known limitations

- Favourites remain browser-local pending customer authentication.
- Compare has an integration URL but its full comparison page belongs to the next milestone.
- Vehicle photos currently use existing public/local and Unsplash assets; object storage and private document images remain future work.
- Full authentication, customer accounts, admin CRUD, email delivery, rate limiting and CRM integrations were intentionally not started.
- Git checkpoints could not be created because this workspace is not a Git repository.

## Principal files changed

Database: `docker-compose.yml`, `.env.example`, `prisma.config.ts`, `prisma/schema.prisma`, `prisma/seed.ts`, the migration SQL, `lib/db/*`, and `scripts/*`.

Data layer: `lib/types/inventory.ts`, `lib/mappers/vehicle-mapper.ts`, `lib/repositories/*`, `lib/services/*`, and inventory/lead validation.

Public routes: homepage, inventory, vehicle details, brands, body types, search/vehicle/lead APIs, canonical redirects, loading and not-found files.

Interface: `HomePage.tsx`, `InventoryPage.tsx`, `VehicleGallery.tsx`, `VehicleActions.tsx`, `RelatedVehicles.tsx`, `Header.tsx`, and scoped additions to `app/globals.css`.
