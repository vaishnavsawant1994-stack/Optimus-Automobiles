import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { ShowroomManager } from '@/components/admin/ShowroomManager'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
export default async function Page() { await requirePermission('showroom.manage'); const items = await prisma.showroom.findMany({ orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }] }); return <><AdminPageHeader title="Showrooms" text="Active primary showroom data powers public contact details and location links." breadcrumb="Showrooms" /><ShowroomManager items={items.map((item) => ({ ...item, latitude: item.latitude?.toString() ?? null, longitude: item.longitude?.toString() ?? null }))} /></> }
