import { NextResponse } from 'next/server'
import { adminError } from '@/lib/admin/api'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
export async function GET(request: Request) { try { const actor = await authorizeAdminRequest('notification.view'); const unread = new URL(request.url).searchParams.get('unread') === 'true'; const data = await prisma.adminNotification.findMany({ where: { userId: actor.id, ...(unread ? { readAt: null } : {}) }, take: 100, orderBy: { createdAt: 'desc' } }); return NextResponse.json({ data }) } catch (error) { return adminError(error) } }
export async function PATCH() { try { const actor = await authorizeAdminRequest('notification.view'); await prisma.adminNotification.updateMany({ where: { userId: actor.id, readAt: null }, data: { readAt: new Date() } }); return NextResponse.json({ message: 'All notifications marked as read.' }) } catch (error) { return adminError(error) } }
