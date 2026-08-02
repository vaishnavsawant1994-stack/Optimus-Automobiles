# Production Readiness

## Completed foundation

- Next.js App Router public website and responsive shared interface
- PostgreSQL Docker development environment
- Prisma migration history and deterministic catalogue seed
- Database-backed homepage, inventory, vehicle details, brands, body types and search
- Server-side filtering, sorting and pagination
- Persisted vehicle enquiries and test-drive requests
- Public-safe API errors, loading states, 404 behavior and canonical redirects
- Unit, PostgreSQL integration and Playwright coverage for the inventory milestone

## Remaining production work

- Authentication, customer account workflows and role enforcement
- Admin inventory/content management and tagged cache invalidation
- Authenticated favourites and compare workflow
- Object storage for vehicle media and private documents
- Transactional email delivery and staff notifications
- Rate limiting, bot controls and additional CSRF review
- Production database backup/restore drills and secret management
- Observability, deployment configuration and final visual-regression baselines

## Next recommended phase

Build authentication and the admin vehicle-management workflow against the established inventory schema. Add tagged revalidation after admin mutations before introducing longer-lived public caching.
