import type { Metadata } from 'next'
import { ServicesPage } from '@/components/interior/MarketingPages'
import { getPublishedContent } from '@/lib/content/public-content'

export const metadata: Metadata = {
  title: 'Luxury Car Services | Optimum Automobiles Pune',
  description: 'Car finance, insurance, RC transfer, warranty, detailing, buyback, evaluation and roadside assistance for luxury car owners.',
}

export default async function Page() {
  return <ServicesPage content={await getPublishedContent('services')} />
}
