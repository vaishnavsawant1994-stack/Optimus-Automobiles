import { FeatureCategory } from '@prisma/client'
import { z } from 'zod'
import type { AdminPermission } from '@/lib/auth/admin-permissions'

export const resourcePermissions = { brands: 'brand.manage', 'body-types': 'bodyType.manage', features: 'feature.manage' } satisfies Record<string, AdminPermission>
export type CatalogResource = keyof typeof resourcePermissions
export function isCatalogResource(value: string): value is CatalogResource {
  return value in resourcePermissions
}
const base = { name: z.string().trim().min(2).max(100), slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().trim().max(1000).default(''), active: z.boolean().default(true) }
export const catalogSchemas = {
  brands: z.object({ ...base, logoUrl: z.string().trim().min(1), logoAlt: z.string().trim().min(2).max(160), websiteUrl: z.url().optional().or(z.literal('')), country: z.string().trim().min(2).max(80), featured: z.boolean().default(false), displayOrder: z.number().int().nonnegative().default(0) }),
  'body-types': z.object({ ...base, icon: z.string().trim().max(80).optional().or(z.literal('')), imageUrl: z.string().trim().max(500).optional().or(z.literal('')), featured: z.boolean().default(false), displayOrder: z.number().int().nonnegative().default(0) }),
  features: z.object({ ...base, category: z.enum(FeatureCategory), icon: z.string().trim().max(80).optional().or(z.literal('')) }),
}
