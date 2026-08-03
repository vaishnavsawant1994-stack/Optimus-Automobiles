import { VehicleStatus, type Vehicle } from '@prisma/client'

export const vehicleStatusTransitions: Record<VehicleStatus, readonly VehicleStatus[]> = {
  DRAFT: [VehicleStatus.AVAILABLE, VehicleStatus.ARCHIVED],
  AVAILABLE: [VehicleStatus.RESERVED, VehicleStatus.SOLD, VehicleStatus.ARCHIVED],
  RESERVED: [VehicleStatus.AVAILABLE, VehicleStatus.SOLD],
  SOLD: [VehicleStatus.ARCHIVED],
  ARCHIVED: [],
}

export function canTransitionVehicle(from: VehicleStatus, to: VehicleStatus): boolean {
  return vehicleStatusTransitions[from].includes(to)
}

export function statusTransitionNeedsReason(from: VehicleStatus, to: VehicleStatus): boolean {
  return to === VehicleStatus.SOLD || to === VehicleStatus.ARCHIVED || (from === VehicleStatus.RESERVED && to === VehicleStatus.AVAILABLE)
}

export type PublicationVehicle = Pick<Vehicle, 'slug' | 'stockNumber' | 'model' | 'variant' | 'year' | 'price' | 'mileage' | 'fuelType' | 'transmission' | 'shortDescription' | 'status' | 'featured'> & {
  brandId: string
  bodyTypeId: string
  images: Array<{ isPrimary: boolean; category: string }>
}

export function getPublicationReadiness(vehicle: PublicationVehicle) {
  const publicImages = vehicle.images.filter((image) => image.category !== 'DOCUMENT')
  const checks = [
    ['Unique public slug', Boolean(vehicle.slug)],
    ['Stock number', Boolean(vehicle.stockNumber)],
    ['Brand', Boolean(vehicle.brandId)],
    ['Model and variant', Boolean(vehicle.model && vehicle.variant)],
    ['Year, price and mileage', vehicle.year >= 1900 && vehicle.price > 0 && vehicle.mileage >= 0],
    ['Fuel and transmission', Boolean(vehicle.fuelType && vehicle.transmission)],
    ['Body type', Boolean(vehicle.bodyTypeId)],
    ['Public description', vehicle.shortDescription.trim().length >= 20],
    ['Primary image', publicImages.some((image) => image.isPrimary)],
    ['Minimum three images', publicImages.length >= 3],
    ['Public status', vehicle.status === VehicleStatus.AVAILABLE || vehicle.status === VehicleStatus.RESERVED || vehicle.status === VehicleStatus.SOLD],
  ] as const
  const complete = checks.filter(([, passed]) => passed).length
  return { ready: complete === checks.length, score: Math.round((complete / checks.length) * 100), checks: checks.map(([label, passed]) => ({ label, passed })) }
}

export function generateVehicleSlug(input: { year: number; brand: string; model: string; variant: string }): string {
  return `${input.year}-${input.brand}-${input.model}-${input.variant}`.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
