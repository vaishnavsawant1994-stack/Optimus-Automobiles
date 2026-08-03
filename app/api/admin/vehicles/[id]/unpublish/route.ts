import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminError, validationError } from '@/lib/admin/api'
import { writeAuditLog } from '@/lib/admin/audit'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'

const schema = z.object({ reason: z.string().trim().min(5).max(500) })
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await authorizeAdminRequest('vehicle.publish')
    const parsed = schema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors)
    const { id } = await context.params
    const vehicle = await prisma.vehicle.update({ where: { id }, data: { published: false, updatedById: actor.id, version: { increment: 1 } } })
    await writeAuditLog({ actorId: actor.id, action: 'VEHICLE_UNPUBLISHED', resourceType: 'Vehicle', resourceId: id, summary: `Unpublished ${vehicle.stockNumber}.`, metadata: { reason: parsed.data.reason }, request })
    return NextResponse.json({ data: vehicle, message: 'Vehicle unpublished.' })
  } catch (error) { return adminError(error) }
}
