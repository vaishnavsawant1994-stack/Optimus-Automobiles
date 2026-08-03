import { NextResponse } from 'next/server'
import { adminError } from '@/lib/admin/api'
import { writeAuditLog } from '@/lib/admin/audit'
import { getPublicationReadiness } from '@/lib/admin/vehicle-workflow'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await authorizeAdminRequest('vehicle.publish')
    const { id } = await context.params
    const vehicle = await prisma.vehicle.findUnique({ where: { id }, include: { images: { select: { isPrimary: true, category: true } } } })
    if (!vehicle) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Vehicle not found.' } }, { status: 404 })
    const readiness = getPublicationReadiness(vehicle)
    if (!readiness.ready) return NextResponse.json({ error: { code: 'NOT_READY', message: 'This vehicle is incomplete and cannot be published.', checklist: readiness } }, { status: 422 })
    const updated = await prisma.vehicle.update({ where: { id }, data: { published: true, publishedAt: vehicle.publishedAt ?? new Date(), scheduledPublishAt: null, updatedById: actor.id, version: { increment: 1 } } })
    await writeAuditLog({ actorId: actor.id, action: 'VEHICLE_PUBLISHED', resourceType: 'Vehicle', resourceId: id, summary: `Published ${vehicle.stockNumber}.`, metadata: { readinessScore: readiness.score }, request })
    return NextResponse.json({ data: updated, checklist: readiness, message: 'Vehicle published.' })
  } catch (error) { return adminError(error) }
}
