import 'dotenv/config'
import { afterAll, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { prisma } from '@/lib/db/prisma'
import { getActiveBrands, getBrandVehicleCount } from '@/lib/repositories/brand-repository'
import { getActiveBodyTypes, getBodyTypeVehicleCount } from '@/lib/repositories/body-type-repository'
import { getPublicVehicleBySlug } from '@/lib/repositories/vehicle-repository'
import { getInventory } from '@/lib/services/inventory-service'
import { getVehicleDetail } from '@/lib/services/vehicle-detail-service'
import { parseInventoryFilters } from '@/lib/validation/inventory'

describe('seeded PostgreSQL inventory', () => {
  afterAll(async () => prisma.$disconnect())

  it('contains the approved deterministic catalogue', async () => {
    await expect(prisma.brand.count()).resolves.toBeGreaterThanOrEqual(10)
    await expect(prisma.bodyType.count()).resolves.toBeGreaterThanOrEqual(8)
    await expect(prisma.vehicle.count()).resolves.toBeGreaterThanOrEqual(30)
    await expect(prisma.feature.count()).resolves.toBeGreaterThanOrEqual(30)
  })

  it('returns correct public brand and body-type counts', async () => {
    const [brands, bodyTypes] = await Promise.all([getActiveBrands(), getActiveBodyTypes()])
    const mercedes = brands.find((brand) => brand.slug === 'mercedes-benz')
    const suv = bodyTypes.find((bodyType) => bodyType.slug === 'suv')
    expect(mercedes?._count.vehicles).toBe(await getBrandVehicleCount('mercedes-benz'))
    expect(suv?._count.vehicles).toBe(await getBodyTypeVehicleCount('suv'))
    expect(mercedes?._count.vehicles).toBeGreaterThan(0)
    expect(suv?._count.vehicles).toBeGreaterThan(0)
  })

  it('executes combined filters and real pagination in PostgreSQL', async () => {
    const filtered = await getInventory(parseInventoryFilters({ brand: 'audi', bodyType: 'suv', maxPrice: '8000000', sort: 'price-desc' }))
    expect(filtered.items.length).toBeGreaterThan(0)
    expect(filtered.items.every((vehicle) => vehicle.brandSlug === 'audi' && vehicle.bodyTypeSlug === 'suv' && vehicle.priceValue <= 8_000_000)).toBe(true)
    const first = await getInventory(parseInventoryFilters({ page: '1', pageSize: '12' }))
    const second = await getInventory(parseInventoryFilters({ page: '2', pageSize: '12' }))
    expect(first.pagination.totalItems).toBe(30)
    expect(first.items).toHaveLength(12)
    expect(second.items).toHaveLength(12)
    expect(second.items[0]?.id).not.toBe(first.items[0]?.id)
  })

  it('looks up the seeded vehicle slug and maps database details', async () => {
    const slug = 'mercedes-benz-e-class-e-220d-amg-line-2021'
    const record = await getPublicVehicleBySlug(slug)
    const detail = await getVehicleDetail(slug)
    expect(record?.stockNumber).toBe('OA-0001')
    expect(detail?.vehicle.make).toBe('Mercedes-Benz')
    expect(detail?.vehicle.featureGroups.length).toBeGreaterThan(0)
    expect(detail?.vehicle.images).toHaveLength(8)
    expect(detail?.related.every((vehicle) => vehicle.slug !== slug)).toBe(true)
  })

  it('excludes unpublished and archived vehicles from public repositories', async () => {
    const source = await prisma.vehicle.findFirstOrThrow({ select: { brandId: true, bodyTypeId: true } })
    const temporary = await prisma.vehicle.create({
      data: {
        slug: 'integration-hidden-vehicle', stockNumber: 'TEST-HIDDEN', brandId: source.brandId, bodyTypeId: source.bodyTypeId,
        model: 'Hidden', variant: 'Test', shortTitle: 'Hidden Test', year: 2024, price: 1, mileage: 1,
        fuelType: 'Petrol', transmission: 'Automatic', shortDescription: 'Integration test record.', description: 'Integration test record.',
        status: 'ARCHIVED', published: false,
      },
    })
    try {
      await expect(getPublicVehicleBySlug(temporary.slug)).resolves.toBeNull()
      const result = await getInventory(parseInventoryFilters({ search: 'integration-hidden-vehicle' }))
      expect(result.items).toHaveLength(0)
    } finally {
      await prisma.vehicle.delete({ where: { id: temporary.id } })
    }
  })
})
