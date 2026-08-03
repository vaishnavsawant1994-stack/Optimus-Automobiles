import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { MediaContentManager } from '@/components/admin/MediaContentManager'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
export default async function Page() { await requirePermission('gallery.manage'); const items = await prisma.galleryItem.findMany({ orderBy: [{ published: 'desc' }, { sortOrder: 'asc' }] }); return <><AdminPageHeader title="Gallery" text="Curate showroom, delivery and vehicle imagery with accessible alt text." breadcrumb="Gallery" actions={<Link className="admin-button" href="/admin/gallery/new">New gallery item</Link>} /><MediaContentManager mode="gallery" items={items} /></> }
