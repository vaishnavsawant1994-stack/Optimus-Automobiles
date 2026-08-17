import { NextResponse } from 'next/server'
import { hashPassword, passwordSchema } from '@/lib/auth/password'
import { hashOneTimeToken } from '@/lib/auth/tokens'
import { prisma } from '@/lib/db/prisma'
import { checkRateLimit, requestFingerprint } from '@/lib/security/rate-limit'

export async function POST(request: Request) {
  const limit = await checkRateLimit(requestFingerprint(request, 'reset-password'), 8, 15 * 60_000)
  if (!limit.allowed) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } }, { status: 429 })
  const body = await request.json().catch(() => null) as { token?: string; password?: string } | null
  const password = passwordSchema.safeParse(body?.password)
  if (!body?.token || !password.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: password.success ? 'This reset link is invalid.' : password.error.issues[0]?.message } }, { status: 400 })

  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashOneTimeToken(body.token) } })
  if (!record || record.usedAt || record.expiresAt <= new Date()) return NextResponse.json({ error: { code: 'TOKEN_EXPIRED', message: 'This reset link is invalid or has expired.' } }, { status: 400 })
  const passwordHash = await hashPassword(password.data)
  const claimed = await prisma.passwordResetToken.updateMany({ where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } })
  if (claimed.count !== 1) return NextResponse.json({ error: { code: 'TOKEN_USED', message: 'This reset link has already been used.' } }, { status: 409 })
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash, sessionVersion: { increment: 1 } } }),
    prisma.auditLog.create({ data: { actorId: record.userId, action: 'PASSWORD_RESET_COMPLETED', entity: 'User', entityId: record.userId } }),
  ])
  return NextResponse.json({ data: { reset: true }, message: 'Password updated. Sign in with your new password.' })
}
