'use client'

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'
import { FavouriteProvider } from './FavouriteProvider'
import { SiteConfigProvider } from './SiteConfigProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return <SessionProvider><SiteConfigProvider><FavouriteProvider>{children}</FavouriteProvider></SiteConfigProvider></SessionProvider>
}
