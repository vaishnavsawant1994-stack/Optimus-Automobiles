import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { SiteFrame } from '@/components/layout/SiteFrame'
import { AppProviders } from '@/components/providers/AppProviders'
import './globals.css'
import './customer.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'),
  title: 'Deccan Wheels | Premium Pre-Owned Luxury Cars in Hyderabad',
  description:
    'Hyderabad luxury pre-owned car dealership with verified cars, transparent pricing, finance support and ownership transfer.',
  openGraph: {
    title: 'Deccan Wheels',
    description: 'Premium pre-owned luxury cars in Hyderabad.',
    type: 'website',
  },
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AppProviders>
          <SiteFrame header={<Header />} footer={<Footer />}>{children}</SiteFrame>
        </AppProviders>
      </body>
    </html>
  )
}
