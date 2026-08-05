import { ContactInquiryStatus, InquiryStatus, RequestStatus, TestDriveStatus, UserRole, UserStatus, VehicleStatus } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import { sanitizeAuditMetadata } from './audit-sanitize'
import { createCsv, sanitizeCsvCell } from './csv'
import { canTransition, contactTransitions, inquiryTransitions, sellRequestTransitions, testDriveTransitions } from './lead-workflows'
import { invitationIsUsable, isCriticalSelfChange, wouldRemoveLastSuperAdmin } from './staff-security'
import { canTransitionVehicle, generateVehicleSlug, getPublicationReadiness, statusTransitionNeedsReason } from './vehicle-workflow'
import { hasPermission, permissionsForRole } from '@/lib/auth/admin-permissions'
import { canAccessAssignedResource, canAssignResource, mayViewPrivateDocuments } from '@/lib/auth/admin-resource-policy'
import { vehicleAdminSchema } from '@/lib/validation/admin'

describe('admin permission matrix', () => {
  it('denies all staff permissions to customers', () => expect(permissionsForRole(UserRole.CUSTOMER)).toEqual([]))
  it('allows sales to process leads but not publish inventory', () => { expect(hasPermission(UserRole.SALES, 'enquiry.update')).toBe(true); expect(hasPermission(UserRole.SALES, 'vehicle.publish')).toBe(false) })
  it('allows content managers to publish content but not see sell documents', () => { expect(hasPermission(UserRole.CONTENT_MANAGER, 'testimonial.manage')).toBe(true); expect(mayViewPrivateDocuments(UserRole.CONTENT_MANAGER)).toBe(false) })
  it('keeps role management exclusive to super admins', () => { expect(hasPermission(UserRole.ADMIN, 'user.role.manage')).toBe(false); expect(hasPermission(UserRole.SUPER_ADMIN, 'user.role.manage')).toBe(true) })
  it('limits non-admin staff to their own and unassigned records', () => { const actor = { id: 'staff-1', role: UserRole.SALES }; expect(canAccessAssignedResource(actor as never, { assignedToId: null })).toBe(true); expect(canAccessAssignedResource(actor as never, { assignedToId: 'staff-1' })).toBe(true); expect(canAccessAssignedResource(actor as never, { assignedToId: 'staff-2' })).toBe(false) })
  it('prevents non-admin assignment to another user', () => expect(canAssignResource({ id: 'staff-1', role: UserRole.OPERATIONS } as never, 'staff-2')).toBe(false))
})

describe('vehicle workflow and validation', () => {
  const complete = { slug: '2022-bmw-x5-sport', stockNumber: 'OA-TEST-1', brandId: 'brand', bodyTypeId: 'body', model: 'X5', variant: 'Sport', year: 2022, price: 5_000_000, mileage: 12_000, fuelType: 'Diesel', transmission: 'Automatic', shortDescription: 'A complete inspected premium vehicle.', status: VehicleStatus.AVAILABLE, featured: false, images: [{ isPrimary: true, category: 'EXTERIOR' }, { isPrimary: false, category: 'EXTERIOR' }, { isPrimary: false, category: 'INTERIOR' }] }
  it('accepts valid transitions and rejects shortcuts', () => { expect(canTransitionVehicle(VehicleStatus.DRAFT, VehicleStatus.AVAILABLE)).toBe(true); expect(canTransitionVehicle(VehicleStatus.DRAFT, VehicleStatus.SOLD)).toBe(false) })
  it('requires reasons for irreversible or exception transitions', () => { expect(statusTransitionNeedsReason(VehicleStatus.AVAILABLE, VehicleStatus.SOLD)).toBe(true); expect(statusTransitionNeedsReason(VehicleStatus.RESERVED, VehicleStatus.AVAILABLE)).toBe(true) })
  it('blocks publication without enough public images', () => expect(getPublicationReadiness({ ...complete, images: complete.images.slice(0, 2) }).ready).toBe(false))
  it('allows a complete available record to publish', () => expect(getPublicationReadiness(complete).ready).toBe(true))
  it('ignores private document images in readiness', () => expect(getPublicationReadiness({ ...complete, images: [{ isPrimary: true, category: 'DOCUMENT' }, ...complete.images.slice(1)] }).ready).toBe(false))
  it('generates stable public slugs', () => expect(generateVehicleSlug({ year: 2024, brand: 'Mercedes-Benz', model: 'E Class', variant: 'E 220d AMG' })).toBe('2024-mercedes-benz-e-class-e-220d-amg'))
  it('rejects a malformed vehicle payload', () => expect(vehicleAdminSchema.safeParse({ model: 'X5' }).success).toBe(false))
})

describe('lead state machines', () => {
  it('moves enquiries through contact and resolution', () => { expect(canTransition(inquiryTransitions, InquiryStatus.NEW, InquiryStatus.CONTACTED)).toBe(true); expect(canTransition(inquiryTransitions, InquiryStatus.CANCELLED, InquiryStatus.NEW)).toBe(false) })
  it('prevents a completed test drive from reopening', () => expect(canTransition(testDriveTransitions, TestDriveStatus.COMPLETED, TestDriveStatus.CONFIRMED)).toBe(false))
  it('requires inspection before valuation in sell requests', () => { expect(canTransition(sellRequestTransitions, RequestStatus.INSPECTION_COMPLETED, RequestStatus.VALUATION_READY)).toBe(true); expect(canTransition(sellRequestTransitions, RequestStatus.SUBMITTED, RequestStatus.OFFER_MADE)).toBe(false) })
  it('allows contact spam to be restored for review', () => expect(canTransition(contactTransitions, ContactInquiryStatus.SPAM, ContactInquiryStatus.NEW)).toBe(true))
})

describe('security utilities', () => {
  it('neutralizes spreadsheet formulas', () => { expect(sanitizeCsvCell('=HYPERLINK("bad")')).toContain("'=HYPERLINK"); expect(sanitizeCsvCell('@SUM(A1)')).toContain("'@SUM") })
  it('creates BOM-prefixed, quoted CSV output', () => expect(createCsv(['Name'], [['Alice']])).toBe('\uFEFF"Name"\r\n"Alice"'))
  it('redacts audit secrets recursively', () => expect(sanitizeAuditMetadata({ okay: 'yes', password: 'no', nested: { tokenHash: 'no', count: 2 } })).toEqual({ okay: 'yes', nested: { count: 2 } }))
  it('recognises usable and expired invitations', () => { expect(invitationIsUsable({ expiresAt: new Date(Date.now() + 1000), usedAt: null, revokedAt: null })).toBe(true); expect(invitationIsUsable({ expiresAt: new Date(Date.now() - 1), usedAt: null, revokedAt: null })).toBe(false) })
  it('protects the last active super administrator', () => expect(wouldRemoveLastSuperAdmin({ role: UserRole.SUPER_ADMIN, status: UserStatus.ACTIVE }, { status: UserStatus.DISABLED }, 1)).toBe(true))
  it('blocks critical self-demotion', () => expect(isCriticalSelfChange({ id: 'one' }, { id: 'one', role: UserRole.SUPER_ADMIN }, { role: UserRole.ADMIN })).toBe(true))
})
