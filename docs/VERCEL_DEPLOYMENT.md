# Vercel Deployment

## Client demo

- Vercel project: `vishnu26/optimus-automobiles`
- Production URL: `https://optimumautomobiles.com`
- GitHub source: `vaishnavsawant1994-stack/Optimus-Automobiles`
- Database: Neon PostgreSQL in Singapore, connected through Vercel Marketplace
- Function region: Singapore (`sin1`) to keep database-backed requests close to Neon

The production database has all three Prisma migrations and the deterministic demonstration catalog. Client-demo admin credentials are generated during bootstrap and stored only in the ignored local `.vercel/client-demo-admin.txt` file.

## Deployment environment

Vercel currently supplies the Neon connection variables. The project additionally requires:

- `DIRECT_URL` mapped to Neon's unpooled connection for migrations
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `NEXTAUTH_URL=https://optimumautomobiles.com` in production
- `NEXT_PUBLIC_SITE_URL=https://optimumautomobiles.com`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`

`postinstall` runs `prisma generate`. Schema changes must be applied with `prisma migrate deploy` before the release that depends on them.

## Required before a full production launch

The client demo uses committed showroom and vehicle media, so public browsing works without an object-storage provider. Before staff upload new vehicle images, configure the S3-compatible variables in `.env.example` and set `IMAGE_STORAGE_DRIVER=s3`.

Transactional email remains fail-closed until `RESEND_API_KEY`, `AUTH_FROM_EMAIL`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL` are configured with a verified domain. A custom domain should then replace the Vercel URL in `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL`.

Also complete legal-content approval, analytics consent, error monitoring, backup/restore testing, and production credential rotation before accepting real customer data.
