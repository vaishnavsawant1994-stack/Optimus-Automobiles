# Deccan Wheels

Database-backed premium pre-owned luxury-car website built with Next.js App Router, TypeScript, PostgreSQL, Prisma, React Hook Form, Zod and Embla Carousel.

The Windows folder and npm package retain the internal `Optimum Automobiles` name. All public UI, metadata, structured data, seed settings and documentation use **Deccan Wheels**.

## Local setup

```powershell
npm install
docker compose up -d postgres
npx prisma migrate dev
npm run db:seed
npm run dev
```

The current development server is available at:

```text
http://localhost:3001
```

See `docs/DATABASE_SETUP.md` for database health, logs, reset and Prisma Studio commands.

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
- Database-backed brand, body-type and search routes
- Canonical redirects, dynamic metadata and structured data
- Deterministic 30-vehicle development seed
- Unit, database integration and Playwright tests

Authentication, customer accounts, admin CRUD, object storage and full compare/favourites workflows belong to later milestones.
