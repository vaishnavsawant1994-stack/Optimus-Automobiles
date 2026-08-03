import { NextResponse } from 'next/server'
import { adminError } from '@/lib/admin/api'
import { writeAuditLog } from '@/lib/admin/audit'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
import { getImageStorage } from '@/lib/storage'

export async function DELETE(request: Request, context: { params: Promise<{ id: string; imageId: string }> }) {
  try {
    const actor = await authorizeAdminRequest('vehicle.update')
    const { id, imageId } = await context.params
    const image = await prisma.vehicleImage.findFirst({ where: { id: imageId, vehicleId: id } })
    if (!image) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Image not found.' } }, { status: 404 })
    await prisma.vehicleImage.delete({ where: { id: imageId } })
    if (image.storageKey) await getImageStorage().deleteObject(image.storageKey)
    if (image.isPrimary) { const next = await prisma.vehicleImage.findFirst({ where: { vehicleId: id }, orderBy: { sortOrder: 'asc' } }); if (next) await prisma.vehicleImage.update({ where: { id: next.id }, data: { isPrimary: true } }) }
    await writeAuditLog({ actorId: actor.id, action: 'VEHICLE_IMAGE_DELETED', resourceType: 'Vehicle', resourceId: id, summary: 'Vehicle image deleted.', metadata: { imageId }, request })
    return NextResponse.json({ message: 'Image removed.' })
  } catch (error) { return adminError(error) }
}
