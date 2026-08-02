import type { Metadata } from 'next'
import { ContactPage } from '@/components/interior/MarketingPages'

export const metadata: Metadata = {
  title: 'Contact Deccan Wheels | Luxury Pre-Owned Cars Hyderabad',
  description: 'Contact Deccan Wheels for premium pre-owned cars, vehicle sales, finance, insurance, RC transfer and after-sales support.',
}

export default function Page() {
  return <ContactPage />
}
