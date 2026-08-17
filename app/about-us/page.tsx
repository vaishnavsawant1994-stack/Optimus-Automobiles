import type { Metadata } from 'next'
import { AboutPage } from '@/components/interior/MarketingPages'
import { getPublishedContent } from '@/lib/content/public-content'

export const metadata: Metadata = {
  title: 'About Optimum Automobiles | Premium Pre-Owned Luxury Cars',
  description: 'Discover the story, standards and people behind Pune’s trusted premium pre-owned luxury car destination.',
}

export default async function Page() {
  return <AboutPage content={await getPublishedContent('about')} />
}
