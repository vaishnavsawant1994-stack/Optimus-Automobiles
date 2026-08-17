import 'server-only'

import { UserStatus } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db/prisma'

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.authError) return null

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (user && user.status === UserStatus.ACTIVE && user.emailVerified && !user.deletedAt && user.sessionVersion === session.user.sessionVersion) {
      return user
    }
  } catch {
    return null
  }

  return null
}

export async function requireAuthenticatedUser(callbackUrl = '/account') {
  const user = await getAuthenticatedUser()
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  return user
}
