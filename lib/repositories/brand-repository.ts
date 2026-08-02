import 'server-only'

import { VehicleStatus } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

const publicVehicleWhere = { published: true, status: { in: [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED] } }

export function getActiveBrands() {
  return prisma.brand.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { vehicles: { where: publicVehicleWhere } } } },
  })
}

export function getFeaturedBrands(limit = 10) {
  return prisma.brand.findMany({
    where: { active: true, featured: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    take: limit,
    include: { _count: { select: { vehicles: { where: publicVehicleWhere } } } },
  })
}

export function getBrandBySlug(slug: string) {
  return prisma.brand.findFirst({
    where: { slug, active: true },
    include: { _count: { select: { vehicles: { where: publicVehicleWhere } } } },
  })
}

export async function getBrandVehicleCount(slug: string) {
  const brand = await getBrandBySlug(slug)
  return brand?._count.vehicles ?? 0
}
