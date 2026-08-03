# Admin Security Review

Date: 2026-08-03

## Implemented controls

- Auth.js sessions are checked against active/verified status, role and `sessionVersion` on every protected server boundary.
- Explicit RBAC is enforced in server components and APIs; client button hiding is not trusted.
- Assignment policies limit focused staff and prevent lead IDOR.
- Lead detail projections explicitly exclude password hashes, session versions, tokens and unrelated private account fields.
- Customer queries require ownership and select only customer-visible messages.
- Zod validates mutation bodies; endpoints use explicit field schemas instead of generic CRUD updates.
- Staff invitations use cryptographically random tokens, hashed storage, 48-hour expiry, one-time claims and Argon2id passwords.
- Protected SUPER_ADMIN rules prevent unsafe account changes and final-super-admin removal.
- Vehicle, lead, content and setting mutations use version conflicts where concurrent edits matter.
- Uploads validate signatures/dimensions/type/size/ownership, strip metadata and exclude documents publicly.
- CSV exports are permission protected, row limited, audited and formula safe.
- Audit metadata sanitization removes secret-like values; audit UI is permission restricted.
- Public contact references are allocated atomically and recover from stale counters.
- Secret-like setting keys are blocked from admin forms.

## Dependency and build review

- Next.js remains on stable `16.2.12`; no canary framework build is used.
- Sharp remains pinned to `0.35.3` through the existing Next override.
- A valid global `$postcss` override resolves all consumers, including Next, to patched `8.5.25`.
- `npm audit --omit=dev` reports zero vulnerabilities.
- The native Windows production build completed successfully; Windows Application Control was not weakened.

## Residual production work

- Replace development email preview with a verified provider/domain and delivery monitoring.
- Configure S3-compatible storage/CDN, lifecycle policies, malware scanning where required and backup/versioning.
- Move rate limiting and job delivery to shared infrastructure for horizontal scaling.
- Add central observability, alerting, encrypted backups and restore drills.
- Configure production CSP/security headers, reverse-proxy request limits and secret rotation.
- Conduct deployment-environment penetration testing and privacy/legal review before launch.

## Verification evidence

The milestone includes permission/workflow unit tests, PostgreSQL integration tests, end-to-end role and lifecycle tests, a clean fresh-database migration, production build and documented production screenshots. No raw Prisma error is intentionally exposed by admin APIs.
