import type { Metadata } from 'next'
import { SavedVehiclesPage } from '@/components/account/SavedVehiclesPage'

export const metadata: Metadata = { title: 'Saved Vehicles | Deccan Wheels', description: 'Review vehicles saved to your Deccan Wheels garage.' }

export default function FavoritesPage() {
  return <SavedVehiclesPage />
}
