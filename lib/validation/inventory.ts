import { z } from 'zod'
import { inventorySorts, type InventoryFilters } from '@/lib/types/inventory'

const positiveInteger = z.coerce.number().int().positive().optional().catch(undefined)
const nonNegativeInteger = z.coerce.number().int().nonnegative().optional().catch(undefined)
const booleanQuery = z
  .union([z.literal('true'), z.literal('false')])
  .transform((value) => value === 'true')
  .optional()
  .catch(undefined)

export const inventoryQuerySchema = z.object({
  brand: z.string().trim().toLowerCase().max(80).optional().catch(undefined),
  make: z.string().trim().toLowerCase().max(80).optional().catch(undefined),
  model: z.string().trim().max(100).optional().catch(undefined),
  minPrice: nonNegativeInteger,
  maxPrice: positiveInteger,
  fromYear: z.coerce.number().int().min(1900).max(2100).optional().catch(undefined),
  toYear: z.coerce.number().int().min(1900).max(2100).optional().catch(undefined),
  year: z.coerce.number().int().min(1900).max(2100).optional().catch(undefined),
  minMileage: nonNegativeInteger,
  maxMileage: positiveInteger,
  mileage: positiveInteger,
  bodyType: z.string().trim().toLowerCase().max(80).optional().catch(undefined),
  body: z.string().trim().toLowerCase().max(80).optional().catch(undefined),
  fuelType: z.string().trim().max(40).optional().catch(undefined),
  fuel: z.string().trim().max(40).optional().catch(undefined),
  transmission: z.string().trim().max(40).optional().catch(undefined),
  ownership: z.coerce.number().int().min(1).max(10).optional().catch(undefined),
  certified: booleanQuery,
  newArrival: booleanQuery,
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD']).optional().catch(undefined),
  search: z.string().trim().max(120).optional().catch(undefined),
  page: z.coerce.number().int().positive().optional().catch(1),
  pageSize: z.coerce.number().pipe(z.union([z.literal(12), z.literal(24), z.literal(48)])).optional().catch(12),
  sort: z.enum(inventorySorts).optional().catch('latest'),
})

export function parseInventoryFilters(input: Record<string, string | string[] | undefined>): InventoryFilters {
  const flat = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]))
  const parsed = inventoryQuerySchema.parse(flat)
  const maxMileage = parsed.maxMileage ?? parsed.mileage
  const fromYear = parsed.fromYear ?? parsed.year
  const priceRange = typeof flat.price === 'string' ? flat.price.split('-').map(Number) : []

  return {
    ...(parsed.brand ?? parsed.make ? { brand: parsed.brand ?? parsed.make } : {}),
    ...(parsed.model ? { model: parsed.model } : {}),
    ...(parsed.minPrice ?? priceRange[0] ? { minPrice: parsed.minPrice ?? priceRange[0] } : {}),
    ...(parsed.maxPrice ?? priceRange[1] ? { maxPrice: parsed.maxPrice ?? priceRange[1] } : {}),
    ...(fromYear ? { fromYear } : {}),
    ...(parsed.toYear ? { toYear: parsed.toYear } : {}),
    ...(parsed.minMileage !== undefined ? { minMileage: parsed.minMileage } : {}),
    ...(maxMileage ? { maxMileage } : {}),
    ...(parsed.bodyType ?? parsed.body ? { bodyType: parsed.bodyType ?? parsed.body } : {}),
    ...(parsed.fuelType ?? parsed.fuel ? { fuelType: parsed.fuelType ?? parsed.fuel } : {}),
    ...(parsed.transmission ? { transmission: parsed.transmission } : {}),
    ...(parsed.ownership ? { ownership: parsed.ownership } : {}),
    ...(parsed.certified !== undefined ? { certified: parsed.certified } : {}),
    ...(parsed.newArrival !== undefined ? { newArrival: parsed.newArrival } : {}),
    ...(parsed.status ? { status: parsed.status } : {}),
    ...(parsed.search ? { search: parsed.search } : {}),
    page: parsed.page ?? 1,
    pageSize: parsed.pageSize ?? 12,
    sort: parsed.sort ?? 'latest',
  }
}
