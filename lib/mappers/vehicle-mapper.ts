import type { Prisma } from '@prisma/client'

import type { VehicleCardData, VehicleDetailData } from '@/lib/types/inventory'
import { formatDate, formatInr, formatMileage } from '@/lib/utils/inventory-formatters'

export const vehicleCardInclude = {
  brand: true,
  bodyType: true,
  images: { where: { isPrimary: true, category: { not: 'DOCUMENT' as const } }, orderBy: { sortOrder: 'asc' as const }, take: 1 },
} satisfies Prisma.VehicleInclude

export const vehicleDetailInclude = {
  brand: true,
  bodyType: true,
  images: { where: { category: { not: 'DOCUMENT' as const } }, orderBy: { sortOrder: 'asc' as const } },
  features: { include: { feature: true }, orderBy: { feature: { name: 'asc' as const } } },
} satisfies Prisma.VehicleInclude

export type VehicleCardRecord = Prisma.VehicleGetPayload<{ include: typeof vehicleCardInclude }>
export type VehicleDetailRecord = Prisma.VehicleGetPayload<{ include: typeof vehicleDetailInclude }>

const fallbackImage = '/images/hero/deccan-wheels-hero-final.png'

export function mapVehicleCard(record: VehicleCardRecord): VehicleCardData {
  const primaryImage = record.images[0]
  const badge = record.status === 'SOLD' ? 'Sold' : record.status === 'RESERVED' ? 'Reserved' : record.newArrival ? 'New' : record.certified ? 'Certified' : 'Available'

  return {
    id: record.id,
    slug: record.slug,
    make: record.brand.name,
    brandSlug: record.brand.slug,
    model: record.model,
    variant: record.variant,
    year: record.year,
    mileage: formatMileage(record.mileage),
    mileageValue: record.mileage,
    fuel: record.fuelType,
    transmission: record.transmission,
    price: formatInr(record.price),
    priceValue: record.price,
    image: primaryImage?.url ?? fallbackImage,
    imageAlt: primaryImage?.altText ?? `${record.year} ${record.brand.name} ${record.model}`,
    badge,
    status: record.status as VehicleCardData['status'],
    certified: record.certified,
    newArrival: record.newArrival,
    bodyType: record.bodyType.name,
    bodyTypeSlug: record.bodyType.slug,
  }
}

export function mapVehicleDetail(record: VehicleDetailRecord): VehicleDetailData {
  const card = mapVehicleCard({ ...record, images: record.images.filter((image) => image.isPrimary).slice(0, 1) })
  const featureMap = new Map<string, Array<{ name: string; value?: string }>>()
  for (const item of record.features) {
    const category = titleCase(item.feature.category)
    const current = featureMap.get(category) ?? []
    current.push({ name: item.feature.name, ...(item.value ? { value: item.value } : {}) })
    featureMap.set(category, current)
  }

  const optionalSpecs: Array<[string, string | number | null | undefined]> = [
    ['Year', record.year],
    ['Mileage', formatMileage(record.mileage)],
    ['Fuel Type', record.fuelType],
    ['Transmission', record.transmission],
    ['Ownership', record.ownershipCount ? `${record.ownershipCount}${record.ownershipCount === 1 ? 'st' : record.ownershipCount === 2 ? 'nd' : 'th'} owner` : undefined],
    ['Body Type', record.bodyType.name],
    ['Engine', record.engineDescription ?? (record.engineDisplacement ? `${record.engineDisplacement} cc` : undefined)],
    ['Power', record.power],
    ['Torque', record.torque],
    ['Drivetrain', record.drivetrain],
    ['Seating', record.seatingCapacity ? `${record.seatingCapacity} seats` : undefined],
    ['Exterior Colour', record.exteriorColor],
    ['Interior Colour', record.interiorColor],
    ['Registration State', record.registrationState],
    ['Insurance Validity', record.insuranceValidity ? formatDate(record.insuranceValidity) : undefined],
    ['Service History', record.serviceHistory],
    ['Keys Available', record.keysAvailable],
  ]

  return {
    ...card,
    stockNumber: record.stockNumber,
    shortTitle: record.shortTitle,
    shortDescription: record.shortDescription,
    description: record.description,
    ...(record.originalPrice ? { originalPrice: formatInr(record.originalPrice) } : {}),
    location: 'Banjara Hills, Hyderabad',
    images: record.images.map((image) => ({
      id: image.id,
      url: image.url,
      thumbnailUrl: image.thumbnailUrl ?? image.url,
      altText: image.altText,
      category: image.category,
    })),
    featureGroups: [...featureMap].map(([category, items]) => ({ category, items })),
    specifications: optionalSpecs
      .filter((entry): entry is [string, string | number] => entry[1] !== null && entry[1] !== undefined && entry[1] !== '')
      .map(([label, value]) => ({ label, value: String(value) })),
    viewCount: record.viewCount,
    favoriteCount: record.favoriteCount,
    ...(record.publishedAt ? { publishedAt: record.publishedAt.toISOString() } : {}),
  }
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/(^|_)([a-z])/g, (_, __, letter: string) => `${_ ? ' ' : ''}${letter.toUpperCase()}`).trim()
}
