import { NextResponse } from 'next/server'
import { adminError } from '@/lib/admin/api'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) { try { const actor = await authorizeAdminRequest('notification.view'); const { id } = await params; const result = await prisma.adminNotification.updateMany({ where: { id, userId: actor.id }, data: { readAt: new Date() } }); if (!result.count) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 }); return NextResponse.json({ message: 'Notification marked as read.' }) } catch (error) { return adminError(error) } }
