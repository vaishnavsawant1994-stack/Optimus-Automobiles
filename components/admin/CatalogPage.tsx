import { AdminPageHeader } from './AdminPrimitives'
import { CatalogManager } from './CatalogManager'
import type { AdminPermission } from '@/lib/auth/admin-permissions'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'

export async function CatalogPage({ resource, title, permission }: { resource: 'brands' | 'body-types' | 'features'; title: string; permission: AdminPermission }) {
  await requirePermission(permission)
  const items = resource === 'brands' ? await prisma.brand.findMany({ orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }], include: { _count: { select: { vehicles: true } } } }) : resource === 'body-types' ? await prisma.bodyType.findMany({ orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }], include: { _count: { select: { vehicles: true } } } }) : await prisma.feature.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }], include: { _count: { select: { vehicles: true } } } })
  return <><AdminPageHeader title={title} text="Reusable catalog records are validated and cannot be deleted while referenced by vehicles." breadcrumb={title} /><CatalogManager resource={resource} items={items} /></>
}
