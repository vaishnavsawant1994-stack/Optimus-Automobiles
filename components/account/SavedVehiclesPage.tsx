'use client'

import { CarFront, Heart, LoaderCircle, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { VehicleResultCard } from '@/components/inventory/InventoryPage'
import { useFavourites } from '@/components/providers/FavouriteProvider'
import type { VehicleCardData } from '@/lib/types/inventory'

export function SavedVehiclesPage({ embedded = false }: { embedded?: boolean }) {
  const favourites = useFavourites()
  const [vehicles, setVehicles] = useState<VehicleCardData[]>([])
  const [loading, setLoading] = useState(true)
  const idsKey = useMemo(() => [...favourites.ids].join(','), [favourites.ids])

  useEffect(() => {
    if (!favourites.ready) return
    const controller = new AbortController()
    setLoading(true)
    fetch('/api/favorites/summaries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleIds: [...favourites.ids] }), signal: controller.signal })
      .then(async (response) => ({ response, body: await response.json() as { data?: VehicleCardData[] } }))
      .then(({ response, body }) => { if (response.ok) setVehicles(body.data ?? []) })
      .catch((error) => { if ((error as Error).name !== 'AbortError') setVehicles([]) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [favourites.ready, favourites.ids, idsKey])

  return <main className={embedded ? 'saved-page saved-page--embedded' : 'saved-page'} id={embedded ? undefined : 'main-content'}>
    <header className="saved-page__header container-wide"><span><Heart />Private garage</span><h1>Saved Vehicles</h1><p>{favourites.count ? `${favourites.count} handpicked ${favourites.count === 1 ? 'car' : 'cars'} ready for another look.` : 'Keep promising vehicles together while you compare your options.'}</p>{!favourites.authenticated ? <div className="saved-page__sync"><LogIn /><span><strong>Keep these cars on every device.</strong><small>Sign in and your guest selections will sync automatically.</small></span><Link className="dark-button" href="/login?callbackUrl=/favorites">Sign in</Link></div> : null}</header>
    <section className="saved-page__content container-wide">
      {loading ? <div className="saved-empty"><LoaderCircle className="spin" /><h2>Opening your garage</h2></div> : vehicles.length ? <div className="inventory-grid saved-grid">{vehicles.map((vehicle) => <VehicleResultCard key={vehicle.id} vehicle={vehicle} favorite={favourites.has(vehicle.id)} toggle={() => favourites.toggle(vehicle.id)} />)}</div> : <div className="saved-empty"><CarFront /><h2>Your garage is ready</h2><p>Use the heart on any vehicle to save it here.</p><Link className="gold-button" href="/inventory">Explore inventory</Link></div>}
    </section>
  </main>
}
