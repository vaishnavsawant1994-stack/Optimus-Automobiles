import { NextResponse } from 'next/server'
import { adminError } from '@/lib/admin/api'
import { writeAuditLog } from '@/lib/admin/audit'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const actor = await authorizeAdminRequest('session.revoke'); const { id } = await params; const target = await prisma.user.findUnique({ where: { id }, select: { email: true } }); if (!target) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 }); await prisma.$transaction([prisma.session.deleteMany({ where: { userId: id } }), prisma.user.update({ where: { id }, data: { sessionVersion: { increment: 1 } } })]); await writeAuditLog({ actorId: actor.id, action: 'SESSIONS_REVOKED', resourceType: 'User', resourceId: id, summary: `Revoked sessions for ${target.email}.`, request }); return NextResponse.json({ message: 'All active sessions revoked.' }) } catch (error) { return adminError(error) } }
