import 'server-only'

import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth/session'
import { isStaffRole } from '@/lib/auth/admin-permissions'

export type AdminActor = NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>

export async function getAdminActor(): Promise<AdminActor | null> {
  const user = await getAuthenticatedUser()
  return user && isStaffRole(user.role) ? user : null
}

export async function requireAdmin(callbackUrl = '/admin'): Promise<AdminActor> {
  const user = await getAuthenticatedUser()
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  if (!isStaffRole(user.role)) redirect('/account?admin=forbidden')
  return user
}
