import 'server-only'

import { mapVehicleCard, mapVehicleDetail } from '@/lib/mappers/vehicle-mapper'
import { getPublicVehicleBySlug, getRelatedVehicles, incrementVehicleViewCount } from '@/lib/repositories/vehicle-repository'

export async function getVehicleDetail(slug: string, options: { incrementView?: boolean } = {}) {
  const vehicle = await getPublicVehicleBySlug(slug)
  if (!vehicle) return null
  if (options.incrementView) {
    incrementVehicleViewCount(vehicle.id).catch((error: unknown) => {
      console.error('vehicle_view_increment_failed', { vehicleId: vehicle.id, error })
    })
  }
  const related = await getRelatedVehicles({ vehicleId: vehicle.id, brandId: vehicle.brandId, bodyTypeId: vehicle.bodyTypeId, price: vehicle.price })
  return { vehicle: mapVehicleDetail(vehicle), related: related.map(mapVehicleCard) }
}
