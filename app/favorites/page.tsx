import type { Metadata } from 'next'
import { SavedVehiclesPage } from '@/components/account/SavedVehiclesPage'

export const metadata: Metadata = { title: 'Saved Vehicles | Optimum Automobiles', description: 'Review vehicles saved to your Optimum Automobiles garage.' }

export default function FavoritesPage() {
  return <SavedVehiclesPage />
}
