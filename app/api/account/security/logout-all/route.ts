import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export async function POST() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in again to manage sessions.' } }, { status: 401 })
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { sessionVersion: { increment: 1 } } }),
    prisma.auditLog.create({ data: { actorId: user.id, action: 'ALL_SESSIONS_REVOKED', entity: 'User', entityId: user.id } }),
  ])
  return NextResponse.json({ data: { sessionsRevoked: true }, message: 'All sessions have been signed out.' })
}
