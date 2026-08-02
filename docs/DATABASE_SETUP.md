# Database Setup

The development database is PostgreSQL 17 in Docker Compose. Commands below are written for Windows PowerShell and must be run from the project root.

## Prerequisites

- Docker Desktop with the Linux container engine running.
- Node.js and project dependencies installed with `npm install`.
- A local `.env` based on `.env.example`.

Never commit `.env` or use the example development password in production.

If port `5432` is already in use, set `POSTGRES_PORT=5433` and update both database URLs in `.env` to use port `5433`.

## Start PostgreSQL

```powershell
docker compose up -d postgres
docker compose ps
```

## Stop PostgreSQL

```powershell
docker compose stop postgres
```

To stop the complete Compose project without deleting data:

```powershell
docker compose down
```

## View logs

```powershell
docker compose logs -f postgres
```

## Check health

```powershell
docker compose ps
npm run db:health
```

## Generate Prisma Client

```powershell
npm run db:generate
```

## Create a migration

```powershell
npx prisma migrate dev --name describe_the_change
```

## Apply committed migrations

Development:

```powershell
npx prisma migrate dev
```

Production or CI:

```powershell
npx prisma migrate deploy
```

## Seed deterministic development data

```powershell
npm run db:seed
```

The seed refuses to run when `NODE_ENV=production`.

## Reset development data

```powershell
npm run db:reset:dev
```

This command is intentionally guarded and only permits local development database URLs.

## Open Prisma Studio

```powershell
npm run db:studio
```

## Remove the development database volume

This permanently deletes local PostgreSQL data:

```powershell
docker compose down --volumes
```
