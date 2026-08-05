import type { Metadata } from 'next'
import { SellYourCarPage } from '@/components/interior/MarketingPages'

export const metadata: Metadata = {
  title: 'Sell Your Luxury Car in Pune | Optimum Automobiles',
  description: 'Get a transparent premium-car valuation, expert inspection, easy paperwork and secure payment from Optimum Automobiles.',
}

export default function Page() {
  return <SellYourCarPage />
}
