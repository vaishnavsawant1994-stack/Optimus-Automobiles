import { MediaContentManager } from '@/components/admin/MediaContentManager'
import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
export default async function Page({ params }: { params: Promise<{ id: string }> }) { await requirePermission('gallery.manage'); const { id } = await params; const items = await prisma.galleryItem.findMany({ orderBy: [{ published: 'desc' }, { sortOrder: 'asc' }] }); return <><AdminPageHeader title="Edit Gallery Item" breadcrumb="Gallery / Edit" /><MediaContentManager mode="gallery" items={items} initialId={id} /></> }
