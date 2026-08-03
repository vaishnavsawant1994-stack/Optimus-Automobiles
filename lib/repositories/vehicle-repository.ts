import 'server-only'

import { Prisma, VehicleStatus } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { vehicleCardInclude, vehicleDetailInclude } from '@/lib/mappers/vehicle-mapper'

const publicStatuses = [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED, VehicleStatus.SOLD]
const listingStatuses = [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED]

function withPublicVisibility(where: Prisma.VehicleWhereInput = {}): Prisma.VehicleWhereInput {
  return { AND: [{ published: true, status: { in: publicStatuses } }, where] }
}

function withListingVisibility(where: Prisma.VehicleWhereInput = {}): Prisma.VehicleWhereInput {
  return { AND: [{ published: true, status: { in: listingStatuses } }, where] }
}

export async function getPublicVehicles(args: {
  where?: Prisma.VehicleWhereInput
  orderBy?: Prisma.VehicleOrderByWithRelationInput[]
  skip: number
  take: number
}) {
  const where = withListingVisibility(args.where)
  const [items, totalItems] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
      include: vehicleCardInclude,
    }),
    prisma.vehicle.count({ where }),
  ])
  return { items, totalItems }
}

export function getPublicVehicleBySlug(slug: string) {
  return prisma.vehicle.findFirst({
    where: withPublicVisibility({ slug }),
    include: vehicleDetailInclude,
  })
}

export async function resolvePublicVehicleSlug(slug: string) {
  const vehicle = await getPublicVehicleBySlug(slug)
  if (vehicle) return { vehicle, redirectedFrom: null as string | null }
  const redirect = await prisma.vehicleSlugRedirect.findUnique({ where: { fromSlug: slug }, include: { vehicle: { include: vehicleDetailInclude } } })
  if (!redirect || !redirect.vehicle.published || ![VehicleStatus.AVAILABLE, VehicleStatus.RESERVED, VehicleStatus.SOLD].some((status) => status === redirect.vehicle.status)) return null
  return { vehicle: redirect.vehicle, redirectedFrom: slug }
}

export function getFeaturedVehicles(limit = 8) {
  return prisma.vehicle.findMany({
    where: withListingVisibility({ featured: true }),
    orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
    take: limit,
    include: vehicleCardInclude,
  })
}

export function getNewArrivalVehicles(limit = 10) {
  return prisma.vehicle.findMany({
    where: withListingVisibility({ newArrival: true }),
    orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
    take: limit,
    include: vehicleCardInclude,
  })
}

export function getRelatedVehicles(args: {
  vehicleId: string
  brandId: string
  bodyTypeId: string
  price: number
  limit?: number
}) {
  const priceDelta = Math.max(Math.round(args.price * 0.35), 1_500_000)
  return prisma.vehicle.findMany({
    where: withListingVisibility({
      id: { not: args.vehicleId },
      OR: [
        { brandId: args.brandId },
        { bodyTypeId: args.bodyTypeId },
        { price: { gte: Math.max(0, args.price - priceDelta), lte: args.price + priceDelta } },
      ],
    }),
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { id: 'asc' }],
    take: args.limit ?? 6,
    include: vehicleCardInclude,
  })
}

export function getVehicleSearchSuggestions(query: string, limit = 8) {
  const term = query.trim()
  return prisma.vehicle.findMany({
    where: withListingVisibility({
      OR: [
        { brand: { name: { contains: term, mode: 'insensitive' } } },
        { model: { contains: term, mode: 'insensitive' } },
        { variant: { contains: term, mode: 'insensitive' } },
        { stockNumber: { contains: term, mode: 'insensitive' } },
        { bodyType: { name: { contains: term, mode: 'insensitive' } } },
      ],
    }),
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { id: 'asc' }],
    take: limit,
    include: vehicleCardInclude,
  })
}

export function incrementVehicleViewCount(id: string) {
  return prisma.vehicle.update({ where: { id }, data: { viewCount: { increment: 1 } }, select: { id: true } })
}

export async function getInventoryFilterValues() {
  const where = withListingVisibility()
  const [models, fuels, transmissions, aggregates] = await Promise.all([
    prisma.vehicle.findMany({ where, distinct: ['model'], select: { model: true }, orderBy: { model: 'asc' } }),
    prisma.vehicle.findMany({ where, distinct: ['fuelType'], select: { fuelType: true }, orderBy: { fuelType: 'asc' } }),
    prisma.vehicle.findMany({ where, distinct: ['transmission'], select: { transmission: true }, orderBy: { transmission: 'asc' } }),
    prisma.vehicle.aggregate({ where, _min: { year: true, price: true, mileage: true }, _max: { year: true, price: true, mileage: true } }),
  ])
  return { models, fuels, transmissions, aggregates }
}

export const publicVehicleVisibility = {
  detail: publicStatuses,
  listing: listingStatuses,
}
