import { MediaContentManager } from '@/components/admin/MediaContentManager'
import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
export default async function Page({ params }: { params: Promise<{ id: string }> }) { await requirePermission('testimonial.manage'); const { id } = await params; const items = await prisma.testimonial.findMany({ orderBy: [{ published: 'desc' }, { sortOrder: 'asc' }] }); return <><AdminPageHeader title="Edit Testimonial" breadcrumb="Testimonials / Edit" /><MediaContentManager mode="testimonials" items={items} initialId={id} /></> }
