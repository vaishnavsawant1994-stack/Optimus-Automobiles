import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword, passwordSchema, verifyPassword } from '@/lib/auth/password'
import { getAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { checkRateLimit, requestFingerprint } from '@/lib/security/rate-limit'

const schema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: passwordSchema })

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in again to change your password.' } }, { status: 401 })
  const limit = await checkRateLimit(`${requestFingerprint(request, 'change-password')}:${user.id}`, 5, 15 * 60_000)
  if (!limit.allowed) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } }, { status: 429 })
  const input = schema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: input.error.issues[0]?.message ?? 'Check your password.' } }, { status: 400 })
  if (!user.passwordHash || !(await verifyPassword(user.passwordHash, input.data.currentPassword))) return NextResponse.json({ error: { code: 'INVALID_PASSWORD', message: 'Your current password is incorrect.' } }, { status: 400 })
  if (await verifyPassword(user.passwordHash, input.data.newPassword)) return NextResponse.json({ error: { code: 'PASSWORD_REUSED', message: 'Choose a password different from your current password.' } }, { status: 400 })
  const passwordHash = await hashPassword(input.data.newPassword)
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash, sessionVersion: { increment: 1 } } }),
    prisma.auditLog.create({ data: { actorId: user.id, action: 'PASSWORD_CHANGED', entity: 'User', entityId: user.id } }),
  ])
  return NextResponse.json({ data: { sessionsRevoked: true }, message: 'Password changed. Sign in again on this device.' })
}
