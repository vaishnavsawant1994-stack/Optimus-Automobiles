import type { Metadata } from 'next'
import { AboutPage } from '@/components/interior/MarketingPages'

export const metadata: Metadata = {
  title: 'About Deccan Wheels | Premium Pre-Owned Luxury Cars',
  description: 'Discover the story, standards and people behind Hyderabad’s trusted premium pre-owned luxury car destination.',
}

export default function Page() {
  return <AboutPage />
}
