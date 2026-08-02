import 'dotenv/config'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { buildPublicVehicleWhere, mapInventorySort } from '@/lib/services/inventory-service'
import { formatInr, formatMileage, toUrlSlug } from '@/lib/utils/inventory-formatters'
import { parseInventoryFilters } from '@/lib/validation/inventory'

describe('inventory query foundation', () => {
  it('generates stable URL-safe slugs', () => {
    expect(toUrlSlug('Mercedes-Benz E-Class E 220d AMG Line 2021')).toBe('mercedes-benz-e-class-e-220d-amg-line-2021')
  })

  it('formats INR and mileage without storing formatted database values', () => {
    expect(formatInr(5_490_000)).toContain('54,90,000')
    expect(formatMileage(28_500)).toBe('28,500 km')
  })

  it('parses valid filters and safely ignores invalid numeric values', () => {
    expect(parseInventoryFilters({ brand: 'Mercedes-Benz', maxPrice: '8000000', page: '-2', pageSize: '17', sort: 'price-asc' })).toMatchObject({ brand: 'mercedes-benz', maxPrice: 8_000_000, page: 1, pageSize: 12, sort: 'price-asc' })
  })

  it('builds a Prisma where clause for combined filters', () => {
    const filters = parseInventoryFilters({ brand: 'audi', bodyType: 'suv', certified: 'true', minPrice: '3000000', maxPrice: '8000000', search: 'quattro' })
    expect(buildPublicVehicleWhere(filters)).toMatchObject({ brand: { slug: 'audi' }, bodyType: { slug: 'suv' }, certified: true, price: { gte: 3_000_000, lte: 8_000_000 } })
  })

  it('maps every supported sort to deterministic Prisma order clauses', () => {
    expect(mapInventorySort('latest')).toEqual([{ publishedAt: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }])
    expect(mapInventorySort('popular')).toEqual([{ viewCount: 'desc' }, { favoriteCount: 'desc' }, { id: 'asc' }])
    expect(mapInventorySort('mileage-asc')).toEqual([{ mileage: 'asc' }, { id: 'asc' }])
  })
})
