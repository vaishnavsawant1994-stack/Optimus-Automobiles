import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { MediaContentManager } from '@/components/admin/MediaContentManager'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'

export default async function Page() { await requirePermission('testimonial.manage'); const items = await prisma.testimonial.findMany({ orderBy: [{ published: 'desc' }, { sortOrder: 'asc' }] }); return <><AdminPageHeader title="Testimonials" text="Publish verified customer stories into the shared public review carousel." breadcrumb="Testimonials" actions={<Link className="admin-button" href="/admin/testimonials/new">New testimonial</Link>} /><MediaContentManager mode="testimonials" items={items} /></> }
