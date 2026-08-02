'use client'

import { useState } from 'react'
import { VehicleResultCard } from '@/components/inventory/InventoryPage'
import type { VehicleCardData } from '@/lib/types/inventory'

export function RelatedVehicles({ vehicles }: { vehicles: VehicleCardData[] }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  return <div className="inventory-grid vehicle-related-grid">{vehicles.map((vehicle) => <VehicleResultCard key={vehicle.id} vehicle={vehicle} favorite={favorites.has(vehicle.id)} toggle={() => setFavorites((current) => { const next = new Set(current); if (next.has(vehicle.id)) next.delete(vehicle.id); else next.add(vehicle.id); return next })} />)}</div>
}
