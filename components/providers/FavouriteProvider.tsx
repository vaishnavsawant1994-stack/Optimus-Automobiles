'use client'

import { useSession } from 'next-auth/react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'optimum-favorites'
const LEGACY_KEYS = ['inventory-favorites', 'deccan-favorites']

type FavouriteContextValue = {
  ids: Set<string>
  count: number
  ready: boolean
  authenticated: boolean
  has: (vehicleId: string) => boolean
  toggle: (vehicleId: string) => Promise<void>
}

const FavouriteContext = createContext<FavouriteContextValue | null>(null)

function readGuestIds() {
  const ids = new Set<string>()
  for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
    try {
      const value = JSON.parse(window.localStorage.getItem(key) ?? '[]') as unknown
      if (Array.isArray(value)) value.filter((id): id is string => typeof id === 'string').forEach((id) => ids.add(id))
    } catch {
      window.localStorage.removeItem(key)
    }
  }
  return [...ids]
}

function writeGuestIds(ids: Iterable<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key))
}

export function FavouriteProvider({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [ready, setReady] = useState(false)
  const guestIds = useRef<string[]>([])

  useEffect(() => {
    guestIds.current = readGuestIds()
    setIds(new Set(guestIds.current))
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || status !== 'authenticated') return
    const controller = new AbortController()
    async function synchronize() {
      if (guestIds.current.length) {
        const sync = await fetch('/api/favorites/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleIds: guestIds.current }), signal: controller.signal })
        if (sync.ok) {
          writeGuestIds([])
          guestIds.current = []
        }
      }
      const response = await fetch('/api/favorites', { signal: controller.signal })
      const payload = await response.json().catch(() => null) as { data?: { ids?: string[] } } | null
      if (response.ok) setIds(new Set(payload?.data?.ids ?? []))
    }
    synchronize().catch((error) => { if ((error as Error).name !== 'AbortError') console.error('favorite_sync_failed') })
    return () => controller.abort()
  }, [ready, status])

  const toggle = useCallback(async (vehicleId: string) => {
    let adding = false
    setIds((current) => {
      const next = new Set(current)
      adding = !next.has(vehicleId)
      if (adding) next.add(vehicleId)
      else next.delete(vehicleId)
      if (status !== 'authenticated') writeGuestIds(next)
      return next
    })
    if (status !== 'authenticated') return
    const response = await fetch('/api/favorites', {
      method: adding ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId }),
    })
    if (!response.ok) {
      setIds((current) => {
        const next = new Set(current)
        if (adding) next.delete(vehicleId)
        else next.add(vehicleId)
        return next
      })
    }
  }, [status])

  const value = useMemo(() => ({ ids, count: ids.size, ready, authenticated: status === 'authenticated', has: (vehicleId: string) => ids.has(vehicleId), toggle }), [ids, ready, status, toggle])
  return <FavouriteContext.Provider value={value}>{children}</FavouriteContext.Provider>
}

export function useFavourites() {
  const context = useContext(FavouriteContext)
  if (!context) throw new Error('useFavourites must be used inside FavouriteProvider.')
  return context
}
