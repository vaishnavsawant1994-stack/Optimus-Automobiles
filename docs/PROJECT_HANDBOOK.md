# Optimum Automobiles — Vehicle Marketplace — Project Handbook

> Owner: `vaishnavsawant1994-stack` · Repository: `Optimus-Automobiles` · Reviewed: 15 November 2026  
> Documentation maturity: repo/source/manifest inspection; **not** an independent live release certification.

## Project overview and audience
Pre-owned vehicle discovery, enquiry, test drive and valuation product under the Optimum Automobiles branding; repository name retains the older `Optimus` spelling.

**Intended users:** Prospective vehicle buyers, sellers and dealership administrators.

## Main features / user journeys
1. Searchable vehicle listings and detail pages.
2. Enquiries, test-drive booking, favourites and valuation requests.
3. Customer accounts and role-based admin tools.
4. Private file storage, form validation and SEO metadata.

These items are code areas and project goals; individual end-to-end flows must be qualified separately.

## Architecture, stack and repository layout
Next.js/TypeScript App Router, PostgreSQL/Prisma, Auth.js, Zod and validation, object-storage adapters, tests (Vitest/Playwright). Root `app/`, `components/`, `prisma/`, `scripts/`, `tests/`, `docs/`.

## What is actually qualified or still outstanding
Broad database-backed marketplace source and local verification scripts are present. The currently deployed environment and exact-head acceptance were not re-certified; installed payment/storage packages do not establish live providers.

Source code and historical QA reports are distinct from passing current CI, real integrations, live deployment and production acceptance.

## Installation and developer operations
`npm install`, use an isolated PostgreSQL DB, `npm run db:generate`, `npm run dev`; validate `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`. `vercel-build` applies migrations: use only with an approved target.

Before running migrations, scripts or providers, verify environment, branches, private credentials, target database and rollback. Do not use actual user/customer records in unqualified development.

## Security and quality requirements
- Customers and ownership documents require strict storage/access controls.
- Do not assume vehicle availability/pricing is synchronized with an external dealer.
- Preserve separation from independent `Car-Dealership` demo repository.
Release acceptance also requires role/session auditing, dependency/security review, accessible interaction, observability, backups, restore and a controlled rollback where applicable.

## Prioritized roadmap
1. Resolve public brand spelling and legal-name wording.
2. Test complete enquiry/test-drive/valuation journeys.
3. Verify image/storage, access controls and spam prevention.
4. Re-certify exact live deployment and rollback.

## Source-of-truth documents
- [`README.md`](../README.md)
- [`package.json`](../package.json)
- [`prisma/`](../prisma/)
- [`docs/`](../docs/)
- [`tests/`](../tests/)

**Maintenance:** Revisit this guide when functional implementation, project boundaries or deployment gates change. For precise status, read qualified exact-commit test and release artifacts.
