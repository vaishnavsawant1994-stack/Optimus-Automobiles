'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton'

export function SiteFrame({ children, header, footer }: { children: ReactNode; header: ReactNode; footer: ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return children
  return <>{header}{children}<WhatsAppFloatingButton />{footer}</>
}
