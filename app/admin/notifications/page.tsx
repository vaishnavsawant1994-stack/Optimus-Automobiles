import { AdminEmpty, AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { NotificationList } from '@/components/admin/NotificationList'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
export default async function Page() { const actor = await requirePermission('notification.view'); const items = await prisma.adminNotification.findMany({ where: { userId: actor.id }, take: 100, orderBy: { createdAt: 'desc' } }); return <><AdminPageHeader title="Notifications" text="Operational alerts for your role and assignments." breadcrumb="Notifications" />{items.length ? <NotificationList items={items.map((item) => ({ ...item, readAt: item.readAt?.toISOString() ?? null, createdAt: item.createdAt.toISOString() }))} /> : <AdminEmpty title="No notifications" text="New operational alerts will appear here." />}</> }
