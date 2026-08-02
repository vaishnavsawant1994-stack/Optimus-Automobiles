# Prisma Migration Report

Public product: **Deccan Wheels**

## Migration

- Name: `20260802152914_inventory_foundation`
- File: `prisma/migrations/20260802152914_inventory_foundation/migration.sql`
- PostgreSQL schema: `public`
- Development database: `deccan_wheels`
- Money strategy: whole Indian rupees stored as PostgreSQL integers; display formatting occurs in application mappers.

## Database objects

The migration creates the core catalogue tables `Brand`, `BodyType`, `Vehicle`, `VehicleImage`, `Feature`, `VehicleFeature`, `Showroom`, and `SiteSetting`.

It also prepares the future-facing tables `User`, `Favorite`, `Inquiry`, `TestDrive`, `SellRequest`, `ContactMessage`, `NewsletterSubscriber`, `Testimonial`, `GalleryItem`, `ContentBlock`, and `AuditLog`.

Enums created:

- `UserRole`
- `RequestStatus`
- `VehicleStatus`
- `VehicleImageCategory`
- `FeatureCategory`
- `TestDriveStatus`

## Constraints and indexes

- Stable unique keys protect brand, body-type, feature and vehicle slugs.
- `Vehicle.stockNumber` is unique.
- Vehicle images and vehicle features cascade when a vehicle is deleted.
- Brand and body-type relationships are restricted to prevent accidental catalogue orphaning.
- Public-query indexes cover publication/status, brand, body type, model, year, price, mileage, fuel, transmission, featured, new-arrival, certification and publication dates.
- Compound indexes support the public visibility, brand inventory, body-type inventory, featured and new-arrival query paths.
- User favourites are unique per user and vehicle.

## Original schema changes

The existing broad model foundation was retained and refined. Required inventory metadata, image ordering, feature categories, public publication controls, vehicle status, enquiry consent, test-drive scheduling, showroom address fields, and query indexes were added. Prisma 7 datasource configuration moved to `prisma.config.ts`.

## Destructive changes

This is the first checked-in migration for the local `deccan_wheels` database. It creates tables and enums; it does not drop an earlier migrated production schema. Future changes must use a new migration and must review Prisma's generated SQL before deployment.

## Rollback considerations

Prisma migrations are forward-only in deployment. For local development, `npm run db:reset:dev` may reset and reseed only after its hostname and database-name guards pass. For production, restore from a tested PostgreSQL backup or create a corrective forward migration. Never run the development reset or seed against production.
