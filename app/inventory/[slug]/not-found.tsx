import { CarFront } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return <main className="inventory-empty vehicle-not-found" id="main-content"><CarFront /><h1>Vehicle not found</h1><p>This car is unavailable or the link is no longer active.</p><Link className="gold-button" href="/inventory">Browse Inventory</Link></main>
}
