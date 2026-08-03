import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { UserManager } from '@/components/admin/UserManager'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
export default async function Page() { await requirePermission('user.view'); const users = await prisma.user.findMany({ where: { deletedAt: null }, orderBy: [{ role: 'asc' }, { name: 'asc' }], include: { _count: { select: { sessions: true } } } }); return <><AdminPageHeader title="Users & Roles" text="Manage status, role boundaries and active sessions without exposing credentials." breadcrumb="Users & Roles" actions={<Link className="admin-button" href="/admin/users/invite">Invite staff</Link>} /><UserManager users={users.map((user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status, emailVerified: user.emailVerified?.toISOString() ?? null, lastLoginAt: user.lastLoginAt?.toISOString() ?? null, createdAt: user.createdAt.toISOString(), sessionCount: user._count.sessions }))} /></> }
