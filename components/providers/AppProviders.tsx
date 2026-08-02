'use client'

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'
import { FavouriteProvider } from './FavouriteProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return <SessionProvider><FavouriteProvider>{children}</FavouriteProvider></SessionProvider>
}
