# Admin System Audit

Date: 2026-08-03

## Existing foundation

- Auth.js credentials authentication uses Argon2id passwords, verified/active account checks, JWT session-version revocation and optional Google OAuth.
- Existing roles are `CUSTOMER`, `SALES`, `CONTENT_MANAGER`, `ADMIN` and `SUPER_ADMIN`.
- `proxy.ts` protects `/admin`, but currently admits only `ADMIN` and `SUPER_ADMIN`; there is no permission matrix for focused staff roles.
- PostgreSQL already stores vehicles, brands, body types, features, favourites, enquiries, test drives, sell requests, contact messages, newsletter subscribers, testimonials, gallery items, showrooms, content blocks, settings and audit logs.
- Public inventory reads through repository/service boundaries and correctly limits public vehicles by publication and operational status.
- Enquiries and test drives already support optional staff assignment and customer-visible engagement messages.
- The current database contains 30 seeded vehicles, 150 vehicle images, customer accounts, favourites and development workflow records.

## Missing administration capabilities

- There is no dedicated admin route tree, shell, dashboard, responsive navigation, operational table system or staff profile experience.
- Permission checks are role-name comparisons in middleware. There are no reusable permissions, resource policies, assignment rules or server-side privilege helpers.
- `OPERATIONS` is missing from the role enum.
- Vehicles have no optimistic version, status history, publication checklist history, slug redirects, publication scheduling or staff authorship.
- Vehicle images have no storage key, MIME type, byte size, checksum, original filename or generated-variant metadata. The existing public detail include does not explicitly exclude document-category images.
- Enquiries lack the `ASSIGNED` status, priority, follow-up scheduling, versioning and a shared operational timeline.
- Test drives lack priority, follow-up scheduling, versioning and slot/status history.
- Sell requests lack assignment, inspection, valuation, offer, communication and status-history data.
- Contact messages are not persisted by the public API and have no reference, assignment, priority, status or workflow history.
- Newsletter submissions currently use an in-memory `Set`; records are lost on restart despite an existing database model.
- Public testimonial and gallery APIs still return local constants instead of PostgreSQL records.
- Content blocks and settings lack draft/publish state, revisions, authorship and optimistic conflict detection.
- Showrooms lack primary-showroom enforcement, coordinates, country, WhatsApp and structured phone/email/opening-hours data.
- Staff invitations, admin notifications and per-staff admin preferences do not exist.
- Audit logs contain only actor/action/entity/metadata and have no summary, request fingerprint fields or explicit append-only service boundary.
- No protected CSV export service exists.

## Upload and storage limitations

- The public sell form selects files only in browser memory and does not upload them.
- Vehicle images currently reference seeded local assets; there is no authenticated image manager or storage adapter.
- Production object storage is not configured. A production adapter must fail closed unless explicit S3-compatible configuration is supplied.
- Image validation must happen server-side using MIME, extension, signatures, dimensions, size, count, ownership and staff permission checks. Binary image data must remain outside PostgreSQL.

## Security and migration risks

- Hiding admin actions in the client is insufficient; all mutations and exports need server-side permission enforcement and field whitelisting.
- Lead detail access must prevent IDOR and ensure focused roles cannot see unnecessary customer or document data.
- Internal notes must use an explicit `customerVisible = false` path and must never be selected by customer account pages.
- Vehicle, lead, content and settings updates need optimistic conflict detection to prevent silent overwrites.
- Role changes must protect the current actor, protected `SUPER_ADMIN` accounts and the final active `SUPER_ADMIN`.
- Invitation, password and verification tokens must remain hashed, expiring and single-use.
- Existing enums and relations must be extended additively so current public/customer records survive migration.

## Public surfaces that must remain unchanged

- Homepage, public inventory and vehicle cards/details.
- Sell Your Car, Services, About Us and Contact visual layouts.
- Authentication and customer account layouts.
- Header, footer and mobile navigation composition.

Only their data sources may be moved from constants or memory to PostgreSQL where required by this milestone.
