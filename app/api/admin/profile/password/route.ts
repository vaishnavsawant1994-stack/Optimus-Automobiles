import { NextResponse } from 'next/server'
import { adminError, validationError } from '@/lib/admin/api'
import { writeAuditLog } from '@/lib/admin/audit'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
import { adminPasswordSchema } from '@/lib/validation/admin'
export async function POST(request: Request) { try { const actor = await authorizeAdminRequest('dashboard.view'); const parsed = adminPasswordSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors); const user = await prisma.user.findUnique({ where: { id: actor.id }, select: { passwordHash: true } }); if (!user?.passwordHash || !(await verifyPassword(user.passwordHash, parsed.data.currentPassword))) return NextResponse.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect.' } }, { status: 400 }); const passwordHash = await hashPassword(parsed.data.newPassword); await prisma.$transaction([prisma.user.update({ where: { id: actor.id }, data: { passwordHash, sessionVersion: { increment: 1 } } }), prisma.session.deleteMany({ where: { userId: actor.id } })]); await writeAuditLog({ actorId: actor.id, action: 'ADMIN_PASSWORD_CHANGED', resourceType: 'User', resourceId: actor.id, summary: 'Staff password changed and sessions revoked.', request }); return NextResponse.json({ message: 'Password changed. Sign in again.' }) } catch (error) { return adminError(error) } }
