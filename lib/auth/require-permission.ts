import 'server-only'

import { redirect } from 'next/navigation'
import { hasPermission, type AdminPermission } from '@/lib/auth/admin-permissions'
import { getAdminActor, requireAdmin, type AdminActor } from '@/lib/auth/require-admin'

export class AdminPermissionError extends Error {
  constructor(public readonly permission: AdminPermission) {
    super(`Missing admin permission: ${permission}`)
    this.name = 'AdminPermissionError'
  }
}

export async function requirePermission(permission: AdminPermission, callbackUrl = '/admin'): Promise<AdminActor> {
  const actor = await requireAdmin(callbackUrl)
  if (!hasPermission(actor.role, permission)) redirect(`/admin?forbidden=${encodeURIComponent(permission)}`)
  return actor
}

export async function authorizeAdminRequest(permission: AdminPermission): Promise<AdminActor> {
  const actor = await getAdminActor()
  if (!actor || !hasPermission(actor.role, permission)) throw new AdminPermissionError(permission)
  return actor
}

export function assertPermission(actor: Pick<AdminActor, 'role'>, permission: AdminPermission): void {
  if (!hasPermission(actor.role, permission)) throw new AdminPermissionError(permission)
}
