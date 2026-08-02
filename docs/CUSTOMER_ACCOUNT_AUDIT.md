# Customer Account and Authentication Audit

Date: 2026-08-03

## Current baseline

- The public Deccan Wheels website and database-backed vehicle inventory are implemented.
- PostgreSQL is the source of truth for vehicles, enquiries, test-drive requests, sell requests, and site content.
- `next-auth` is installed, but no Auth.js configuration, providers, route handler, session provider, or protected route policy exists.
- The `User` table currently stores a unique email, optional password hash, role, profile basics, and relations to customer records.
- Enquiries and test-drive requests are written to PostgreSQL as guest submissions. Their nullable `userId` fields are not populated because there is no authenticated session.
- `/login`, `/signup`, `/account`, and account subpaths currently resolve through the generic catch-all placeholder page.

## Favourite-state audit

Two unrelated browser-only implementations currently exist:

- Homepage: `deccan-favorites`
- Inventory page: `inventory-favorites`
- Related vehicles: component-local state that is lost on navigation

There is a valid `Favorite` database model with a unique `(userId, vehicleId)` constraint, but no API or UI uses it. The milestone will introduce one canonical guest key, migrate both legacy keys, synchronize guest selections after sign-in, and use the database for authenticated customers.

## Data and ownership gaps

- Enquiries and test drives do not have customer-facing reference numbers.
- Account ownership is not enforced because account endpoints do not yet exist.
- Submitted records have no preferred contact method, customer notification settings, status history, or customer follow-up messages.
- Test-drive statuses do not cover reschedule requests or rejected requests.
- Sell requests support `userId`, but the public submission flow does not attach an authenticated customer.
- Existing APIs validate their public request fields, but do not apply per-client rate limits or duplicate-submission protection.

## Authentication and security gaps

- No credentials or Google provider configuration.
- No email verification, resend verification, forgot-password, or reset-password flow.
- No password-strength policy or Argon2id password hashing implementation.
- No session-revocation mechanism for password changes or logout-all-devices.
- No route-level protection for `/account/*` or `/admin/*`.
- No safe callback URL validation.
- No neutral forgot-password response to prevent account enumeration.
- No production email adapter or development email-preview behavior.
- No audit trail for sign-in, password, verification, or account security events.

## Implementation boundaries

This milestone will:

1. Add Auth.js with credentials and optional Google sign-in.
2. Add verified-customer sessions, account state, security tokens, notification preferences, and Auth.js adapter models.
3. Preserve all existing guest enquiry and test-drive records while adding reference numbers and ownership support.
4. Introduce protected account pages and server-side ownership checks for every customer record.
5. Replace local-only favourites with a shared guest/database-backed implementation.
6. Send verification, password-reset, enquiry, and test-drive emails through a real provider when configured, with explicit preview-only behavior in development.

The admin dashboard and staff workflow UI remain outside this milestone. Staff assignment fields and auditable statuses may be stored now so the later admin implementation does not require another disruptive customer-data migration.
