import type { Metadata } from 'next'
import { AboutPage } from '@/components/interior/MarketingPages'

export const metadata: Metadata = {
  title: 'About Optimum Automobiles | Premium Pre-Owned Luxury Cars',
  description: 'Discover the story, standards and people behind Pune’s trusted premium pre-owned luxury car destination.',
}

export default function Page() {
  return <AboutPage />
}
