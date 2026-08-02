import type { Metadata } from 'next'
import { SellYourCarPage } from '@/components/interior/MarketingPages'

export const metadata: Metadata = {
  title: 'Sell Your Luxury Car in Hyderabad | Deccan Wheels',
  description: 'Get a transparent premium-car valuation, expert inspection, easy paperwork and secure payment from Deccan Wheels.',
}

export default function Page() {
  return <SellYourCarPage />
}
