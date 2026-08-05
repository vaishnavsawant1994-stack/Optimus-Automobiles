import type { Metadata } from 'next'
import { ContactPage } from '@/components/interior/MarketingPages'

export const metadata: Metadata = {
  title: 'Contact Optimum Automobiles | Luxury Pre-Owned Cars Pune',
  description: 'Contact Optimum Automobiles for premium pre-owned cars, vehicle sales, finance, insurance, RC transfer and after-sales support.',
}

export default function Page() {
  return <ContactPage />
}
