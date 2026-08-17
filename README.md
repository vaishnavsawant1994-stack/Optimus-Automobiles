# Optimum Automobiles

Database-backed premium pre-owned luxury-car website built with Next.js App Router, TypeScript, PostgreSQL, Prisma, Auth.js, React Hook Form, Zod and Embla Carousel.

The Windows folder and npm package use the `Optimum Automobiles` name. All public UI, metadata, structured data and seed settings use **Optimum Automobiles**.

## Local setup

```powershell
npm install
docker compose up -d postgres
npx prisma migrate dev
npx prisma generate
npm run db:seed
npm run dev
```

The current development server is available at:

```text
http://localhost:3001
```

See `docs/DATABASE_SETUP.md` for database health, logs, reset and Prisma Studio commands. See `docs/CUSTOMER_ACCOUNT_MILESTONE.md` for authentication, email and demo-account setup.

## Verification

```powershell
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

## Implemented scope

- PostgreSQL-backed homepage inventory and brands
- Server-filtered, sorted and paginated inventory
- Real vehicle details, ordered gallery, specifications and grouped features
- Persisted enquiries and test-drive requests
- Sell-car valuation requests with private JPG/PNG/PDF attachments
- Verified customer registration, sign-in and password recovery
- Persistent favourites with automatic guest-to-account synchronization
- Protected customer dashboard, owned enquiries, test drives and sell requests
- Profile, notification and account-security controls
- Database-backed brand, body-type and search routes
- Canonical redirects, dynamic metadata and structured data
- Explicit service, information and legal pages with real 404, robots and sitemaps
- Role-based admin operations, content, settings, gallery and customer-document access
- Database-backed shared rate limiting and production security headers
- Deterministic 30-vehicle development seed
- Unit, database integration and Playwright tests

## Required production configuration

Set a strong `AUTH_SECRET`, database URLs, the canonical `NEXT_PUBLIC_SITE_URL`, real showroom phone variables, email delivery credentials and S3-compatible storage values before deployment. `PRIVATE_STORAGE_DRIVER=s3` keeps customer valuation documents private; they must not be served through the public CDN configured by `S3_PUBLIC_BASE_URL`.

Run `npx prisma migrate deploy` before starting a new release. The latest migration adds shared rate-limit buckets and private sell-request attachment metadata.
