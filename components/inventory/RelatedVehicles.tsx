'use client'

import { VehicleResultCard } from '@/components/inventory/InventoryPage'
import { useFavourites } from '@/components/providers/FavouriteProvider'
import type { VehicleCardData } from '@/lib/types/inventory'

export function RelatedVehicles({ vehicles }: { vehicles: VehicleCardData[] }) {
  const favorites = useFavourites()
  return <div className="inventory-grid vehicle-related-grid">{vehicles.map((vehicle) => <VehicleResultCard key={vehicle.id} vehicle={vehicle} favorite={favorites.has(vehicle.id)} toggle={() => favorites.toggle(vehicle.id)} />)}</div>
}
