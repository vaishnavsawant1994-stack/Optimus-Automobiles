import 'server-only'

import { UserRole } from '@prisma/client'
import { endOfDay, startOfDay } from '@/lib/admin/date-utils'
import { prisma } from '@/lib/db/prisma'

export type DashboardRange = 'today' | '7d' | '30d' | 'month' | 'custom'

export function resolveDashboardRange(range: DashboardRange, customFrom?: Date, customTo?: Date) {
  const now = new Date()
  if (range === 'today') return { from: startOfDay(now), to: endOfDay(now) }
  if (range === 'month') return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) }
  if (range === 'custom' && customFrom && customTo) return { from: startOfDay(customFrom), to: endOfDay(customTo) }
  const days = range === '30d' ? 30 : 7
  return { from: startOfDay(new Date(now.getTime() - (days - 1) * 86_400_000)), to: endOfDay(now) }
}

export async function getAdminDashboard(input: { from: Date; to: Date; actorId: string; actorRole: UserRole }) {
  const period = { gte: input.from, lte: input.to }
  const assigned = input.actorRole === UserRole.ADMIN || input.actorRole === UserRole.SUPER_ADMIN ? {} : { OR: [{ assignedToId: null }, { assignedToId: input.actorId }] }
  const [
    available, reserved, sold, drafts, incompleteImages, newEnquiries, followUpEnquiries, upcomingDrives,
    pendingDrives, newSellRequests, inspections, openContacts, draftTestimonials, draftGallery, subscribers,
    assignedWork, overdueWork, recentEnquiries, drives, sellPipeline, audit,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }), prisma.vehicle.count({ where: { status: 'RESERVED' } }), prisma.vehicle.count({ where: { status: 'SOLD' } }), prisma.vehicle.count({ where: { status: 'DRAFT' } }),
    prisma.vehicle.count({ where: { images: { none: { isPrimary: true } } } }), prisma.inquiry.count({ where: { ...assigned, submittedAt: period } }), prisma.inquiry.count({ where: { ...assigned, followUpAt: { lte: input.to }, status: { notIn: ['CLOSED', 'CANCELLED', 'SPAM'] } } }),
    prisma.testDrive.count({ where: { ...assigned, preferredDate: { gte: startOfDay(new Date()) }, status: { in: ['CONFIRMED', 'RESCHEDULED'] } } }), prisma.testDrive.count({ where: { ...assigned, createdAt: period, status: 'REQUESTED' } }),
    prisma.sellRequest.count({ where: { ...assigned, createdAt: period } }), prisma.sellRequest.count({ where: { ...assigned, status: 'INSPECTION_SCHEDULED' } }), prisma.contactMessage.count({ where: { ...assigned, status: { notIn: ['CLOSED', 'SPAM', 'DUPLICATE'] } } }),
    prisma.testimonial.count({ where: { published: false, archived: false } }), prisma.galleryItem.count({ where: { published: false } }), prisma.newsletterSubscriber.count({ where: { status: 'SUBSCRIBED' } }),
    prisma.operationalFollowUp.count({ where: { assignedToId: input.actorId, completedAt: null } }), prisma.operationalFollowUp.count({ where: { assignedToId: input.actorId, completedAt: null, dueAt: { lt: new Date() } } }),
    prisma.inquiry.findMany({ where: { ...assigned, submittedAt: period }, orderBy: { submittedAt: 'desc' }, take: 6, include: { vehicle: { select: { shortTitle: true } }, assignedTo: { select: { name: true } } } }),
    prisma.testDrive.findMany({ where: { ...assigned, preferredDate: { gte: startOfDay(new Date()) } }, orderBy: { preferredDate: 'asc' }, take: 6, include: { vehicle: { select: { shortTitle: true } } } }),
    prisma.sellRequest.groupBy({ by: ['status'], _count: true }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 7, include: { actor: { select: { name: true } } } }),
  ])
  return { inventory: { available, reserved, sold, drafts, incompleteImages }, operations: { newEnquiries, followUpEnquiries, upcomingDrives, pendingDrives, newSellRequests, inspections, openContacts }, content: { draftTestimonials, draftGallery, subscribers }, team: { assignedWork, overdueWork }, recentEnquiries, drives, sellPipeline, audit }
}
