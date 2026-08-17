import type { Metadata } from 'next'
import { ContactPage } from '@/components/interior/MarketingPages'
import { getPublishedContent } from '@/lib/content/public-content'

export const metadata: Metadata = {
  title: 'Contact Optimum Automobiles | Luxury Pre-Owned Cars Pune',
  description: 'Contact Optimum Automobiles for premium pre-owned cars, vehicle sales, finance, insurance, RC transfer and after-sales support.',
}

export default async function Page() {
  return <ContactPage content={await getPublishedContent('contact')} />
}
