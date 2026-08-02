# Branding and Route Lock

Date: 2026-08-02

## Public identity

The final public identity is **Deccan Wheels**.

The Windows folder `Optimum Automobiles` and npm package name `optimum-automobiles` are internal implementation identifiers. They must not appear in public metadata, UI text, database settings, emails, structured data or legal documents.

## Canonical public routes

| Purpose | Canonical route |
| --- | --- |
| Home | `/` |
| Inventory | `/inventory` |
| Vehicle detail | `/inventory/[slug]` |
| Brand directory | `/brands` |
| Brand inventory | `/brands/[slug]` |
| Body-type directory | `/body-types` |
| Body-type inventory | `/body-types/[slug]` |
| Compare | `/compare` |
| Public favourites | `/favorites` |
| Customer favourites | `/account/favourites` |
| Contact | `/contact` |
| RC transfer | `/services/rc-transfer` |

## Permanent redirects

- `/contact-us` redirects permanently to `/contact`.
- `/services/ownership-transfer` redirects permanently to `/services/rc-transfer`.
- Any older ownership-transfer aliases must resolve to `/services/rc-transfer`.

## Slug rules

- Lowercase only.
- Words separated by hyphens.
- URL safe and stable after publication.
- Unique within the model.
- Vehicle slugs include brand, model, variant and year when needed for uniqueness.

Examples: `mercedes-benz`, `land-rover`, `sports-car`, `mercedes-benz-e-class-e220d-amg-line-2021`.

## Canonical body-type slugs

`sedan`, `suv`, `coupe`, `convertible`, `hatchback`, `sports-car`, `muv`, `supercar`.

## Link policy

Internal links must target canonical routes directly. Redirects exist for external bookmarks and legacy URLs, not as a substitute for correcting source links.

