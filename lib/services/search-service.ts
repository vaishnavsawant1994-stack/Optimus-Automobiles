import 'server-only'

import { mapVehicleCard } from '@/lib/mappers/vehicle-mapper'
import { getVehicleSearchSuggestions } from '@/lib/repositories/vehicle-repository'
import type { SearchSuggestion } from '@/lib/types/inventory'

export async function searchInventory(query: string, limit = 8): Promise<SearchSuggestion[]> {
  const records = await getVehicleSearchSuggestions(query, Math.min(Math.max(limit, 1), 12))
  return records.map((record) => {
    const vehicle = mapVehicleCard(record)
    return {
      id: vehicle.id,
      title: `${vehicle.make} ${vehicle.model}`,
      subtitle: `${vehicle.variant} | ${vehicle.year}`,
      image: vehicle.image,
      year: vehicle.year,
      price: vehicle.price,
      status: vehicle.status,
      href: `/inventory/${vehicle.slug}`,
    }
  })
}
