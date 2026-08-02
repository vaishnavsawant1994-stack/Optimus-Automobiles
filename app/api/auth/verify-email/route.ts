import { UserStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { hashOneTimeToken } from '@/lib/auth/tokens'
import { prisma } from '@/lib/db/prisma'
import { checkRateLimit, requestFingerprint } from '@/lib/security/rate-limit'

export async function POST(request: Request) {
  const limit = checkRateLimit(requestFingerprint(request, 'verify-email'), 10, 15 * 60_000)
  if (!limit.allowed) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } }, { status: 429 })
  const body = await request.json().catch(() => null) as { token?: string } | null
  if (!body?.token || body.token.length > 256) return NextResponse.json({ error: { code: 'INVALID_TOKEN', message: 'This verification link is invalid.' } }, { status: 400 })

  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashOneTimeToken(body.token) } })
  if (!record || record.usedAt || record.expiresAt <= new Date()) return NextResponse.json({ error: { code: 'TOKEN_EXPIRED', message: 'This verification link is invalid or has expired.' } }, { status: 400 })

  const claimed = await prisma.emailVerificationToken.updateMany({ where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } })
  if (claimed.count !== 1) return NextResponse.json({ error: { code: 'TOKEN_USED', message: 'This verification link has already been used.' } }, { status: 409 })
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date(), status: UserStatus.ACTIVE } }),
    prisma.auditLog.create({ data: { actorId: record.userId, action: 'EMAIL_VERIFIED', entity: 'User', entityId: record.userId } }),
  ])
  return NextResponse.json({ data: { verified: true }, message: 'Email verified. You can now sign in.' })
}
