import type { Metadata } from 'next'
import { ServicesPage } from '@/components/interior/MarketingPages'

export const metadata: Metadata = {
  title: 'Luxury Car Services | Deccan Wheels Hyderabad',
  description: 'Car finance, insurance, RC transfer, warranty, detailing, buyback, evaluation and roadside assistance for luxury car owners.',
}

export default function Page() {
  return <ServicesPage />
}
