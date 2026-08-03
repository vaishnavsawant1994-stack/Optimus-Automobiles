# Admin Roles and Permissions

## Enforcement

Permissions are defined centrally in `lib/auth/admin-permissions.ts`. Server components call `requirePermission`; APIs call `authorizeAdminRequest`; assignment and protected-user decisions use `admin-resource-policy.ts`. Client-side visibility is only an ergonomic layer and is never the security boundary.

## Roles

| Role | Operational scope |
| --- | --- |
| `CUSTOMER` | No admin access. |
| `SALES` | Assigned/unassigned enquiries, test drives, contact messages, vehicle summaries and sell-request summaries. Cannot publish inventory, manage content, users or settings. |
| `OPERATIONS` | Vehicle operational data/status, catalogs, test drives, inspections, valuations and sell requests. Cannot publish vehicles or manage users/security. |
| `CONTENT_MANAGER` | Testimonials, gallery, structured public content, newsletter and non-secret SEO visibility. No private sell workflow access. |
| `ADMIN` | Inventory publication, all lead operations, content, showrooms, normal users, settings, exports and audit logs. Cannot delete vehicles or change protected role assignments. |
| `SUPER_ADMIN` | Complete permission set, protected role management and session revocation. |

## Permission families

- Dashboard: `dashboard.view`
- Vehicles: `vehicle.view`, `create`, `update`, `publish`, `reserve`, `markSold`, `archive`, `delete`
- Catalogs: `brand.manage`, `bodyType.manage`, `feature.manage`
- Enquiries: `enquiry.view`, `assign`, `update`, `close`
- Test drives: `testDrive.view`, `assign`, `confirm`, `reschedule`, `complete`, `cancel`
- Sell requests: `sellRequest.view`, `assign`, `inspect`, `value`, `offer`, `complete`
- Contact messages: `contactInquiry.view`, `assign`, `update`, `close`
- Content: `testimonial.manage`, `gallery.manage`, `content.manage`, `newsletter.view`, `newsletter.export`
- Management: `showroom.manage`, `user.view`, `user.invite`, `user.update`, `user.disable`, `user.role.manage`, `session.revoke`
- Platform: `settings.view`, `settings.update`, `auditLog.view`, `notification.view`, `export.create`

## Resource rules

- Focused roles may access only unassigned records or records assigned to themselves.
- ADMIN and SUPER_ADMIN may assign records across active staff queues.
- Customer-facing queries always filter by the authenticated customer's `userId`.
- Internal operational notes never enter customer engagement queries.
- ADMIN cannot modify SUPER_ADMIN accounts. Critical SUPER_ADMIN self-changes and removal of the last active SUPER_ADMIN are blocked.
- Role/status changes revoke active sessions when appropriate.
