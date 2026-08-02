import 'server-only'

import { VehicleStatus } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

const publicVehicleWhere = { published: true, status: { in: [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED] } }

export function getActiveBodyTypes() {
  return prisma.bodyType.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { vehicles: { where: publicVehicleWhere } } } },
  })
}

export function getBodyTypeBySlug(slug: string) {
  return prisma.bodyType.findFirst({
    where: { slug, active: true },
    include: { _count: { select: { vehicles: { where: publicVehicleWhere } } } },
  })
}

export async function getBodyTypeVehicleCount(slug: string) {
  const bodyType = await getBodyTypeBySlug(slug)
  return bodyType?._count.vehicles ?? 0
}
