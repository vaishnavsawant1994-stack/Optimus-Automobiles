import 'server-only'

import { Prisma, VehicleStatus } from '@prisma/client'
import { mapVehicleCard } from '@/lib/mappers/vehicle-mapper'
import { getActiveBrands } from '@/lib/repositories/brand-repository'
import { getActiveBodyTypes } from '@/lib/repositories/body-type-repository'
import { getInventoryFilterValues, getPublicVehicles } from '@/lib/repositories/vehicle-repository'
import type { BrandSummary, BodyTypeSummary, InventoryFilters, InventoryResult, InventorySort } from '@/lib/types/inventory'

const brandAccents: Record<string, string> = {
  bmw: '#1c69d4', audi: '#e21d38', porsche: '#d5001c', 'land-rover': '#1f8a50', volvo: '#3f8fcb', toyota: '#eb0a1e',
}

export function buildPublicVehicleWhere(filters: InventoryFilters): Prisma.VehicleWhereInput {
  const status = filters.status ? VehicleStatus[filters.status] : { in: [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED] }
  const search = filters.search?.trim()
  return {
    status,
    ...(filters.brand ? { brand: { slug: filters.brand } } : {}),
    ...(filters.model ? { model: { equals: filters.model, mode: 'insensitive' } } : {}),
    ...(filters.bodyType ? { bodyType: { slug: filters.bodyType } } : {}),
    ...(filters.fuelType ? { fuelType: { equals: filters.fuelType, mode: 'insensitive' } } : {}),
    ...(filters.transmission ? { transmission: { equals: filters.transmission, mode: 'insensitive' } } : {}),
    ...(filters.ownership ? { ownershipCount: filters.ownership } : {}),
    ...(filters.certified !== undefined ? { certified: filters.certified } : {}),
    ...(filters.newArrival !== undefined ? { newArrival: filters.newArrival } : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined ? { price: { gte: filters.minPrice, lte: filters.maxPrice } } : {}),
    ...(filters.fromYear !== undefined || filters.toYear !== undefined ? { year: { gte: filters.fromYear, lte: filters.toYear } } : {}),
    ...(filters.minMileage !== undefined || filters.maxMileage !== undefined ? { mileage: { gte: filters.minMileage, lte: filters.maxMileage } } : {}),
    ...(search ? {
      OR: [
        { brand: { name: { contains: search, mode: 'insensitive' } } },
        { model: { contains: search, mode: 'insensitive' } },
        { variant: { contains: search, mode: 'insensitive' } },
        { stockNumber: { contains: search, mode: 'insensitive' } },
        { bodyType: { name: { contains: search, mode: 'insensitive' } } },
      ],
    } : {}),
  }
}

export function mapInventorySort(sort: InventorySort): Prisma.VehicleOrderByWithRelationInput[] {
  const id: Prisma.VehicleOrderByWithRelationInput = { id: 'asc' }
  const sorts: Record<InventorySort, Prisma.VehicleOrderByWithRelationInput[]> = {
    latest: [{ publishedAt: 'desc' }, { createdAt: 'desc' }, id],
    'price-asc': [{ price: 'asc' }, id],
    'price-desc': [{ price: 'desc' }, id],
    'year-desc': [{ year: 'desc' }, id],
    'year-asc': [{ year: 'asc' }, id],
    'mileage-asc': [{ mileage: 'asc' }, id],
    popular: [{ viewCount: 'desc' }, { favoriteCount: 'desc' }, id],
  }
  return sorts[sort]
}

export async function getInventory(filters: InventoryFilters): Promise<InventoryResult> {
  const where = buildPublicVehicleWhere(filters)
  const requestedPage = Math.max(1, filters.page)
  const skip = (requestedPage - 1) * filters.pageSize
  const [{ items, totalItems }, availableFilters] = await Promise.all([
    getPublicVehicles({ where, orderBy: mapInventorySort(filters.sort), skip, take: filters.pageSize }),
    getAvailableInventoryFilters(),
  ])
  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize))
  const page = Math.min(requestedPage, totalPages)

  if (page !== requestedPage && totalItems > 0) {
    const corrected = await getPublicVehicles({
      where,
      orderBy: mapInventorySort(filters.sort),
      skip: (page - 1) * filters.pageSize,
      take: filters.pageSize,
    })
    return createResult(corrected.items.map(mapVehicleCard), corrected.totalItems, page, filters, availableFilters)
  }
  return createResult(items.map(mapVehicleCard), totalItems, page, filters, availableFilters)
}

async function getAvailableInventoryFilters() {
  const [brands, bodyTypes, values] = await Promise.all([getActiveBrands(), getActiveBodyTypes(), getInventoryFilterValues()])
  return {
    brands: brands.map(mapBrandSummary),
    bodyTypes: bodyTypes.map(mapBodyTypeSummary),
    models: values.models.map(({ model }) => model),
    fuelTypes: values.fuels.map(({ fuelType }) => fuelType),
    transmissions: values.transmissions.map(({ transmission }) => transmission),
    yearRange: { min: values.aggregates._min.year ?? 2018, max: values.aggregates._max.year ?? new Date().getFullYear() },
    priceRange: { min: values.aggregates._min.price ?? 0, max: values.aggregates._max.price ?? 0 },
    mileageRange: { min: values.aggregates._min.mileage ?? 0, max: values.aggregates._max.mileage ?? 0 },
  }
}

function createResult(items: InventoryResult['items'], totalItems: number, page: number, filters: InventoryFilters, availableFilters: InventoryResult['availableFilters']): InventoryResult {
  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize))
  return {
    items,
    pagination: { page, pageSize: filters.pageSize, totalItems, totalPages, hasPreviousPage: page > 1, hasNextPage: page < totalPages },
    appliedFilters: { ...filters, page },
    availableFilters,
  }
}

export function mapBrandSummary(brand: Awaited<ReturnType<typeof getActiveBrands>>[number]): BrandSummary {
  return { id: brand.id, name: brand.name, slug: brand.slug, logoUrl: brand.logoUrl, logoAlt: brand.logoAlt, description: brand.description, country: brand.country, vehicleCount: brand._count.vehicles, accent: brandAccents[brand.slug] ?? '#f4f7f8' }
}

export function mapBodyTypeSummary(bodyType: Awaited<ReturnType<typeof getActiveBodyTypes>>[number]): BodyTypeSummary {
  return { id: bodyType.id, name: bodyType.name, slug: bodyType.slug, description: bodyType.description, ...(bodyType.icon ? { icon: bodyType.icon } : {}), ...(bodyType.imageUrl ? { imageUrl: bodyType.imageUrl } : {}), vehicleCount: bodyType._count.vehicles }
}
