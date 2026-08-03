import { UserRole } from '@prisma/client'
import type { AdminActor } from '@/lib/auth/require-admin'

type AssignableResource = { assignedToId: string | null }

export function canAccessAssignedResource(actor: Pick<AdminActor, 'id' | 'role'>, resource: AssignableResource): boolean {
  if (actor.role === UserRole.SUPER_ADMIN || actor.role === UserRole.ADMIN) return true
  return resource.assignedToId === null || resource.assignedToId === actor.id
}

export function canAssignResource(actor: Pick<AdminActor, 'id' | 'role'>, assignedToId: string | null): boolean {
  if (actor.role === UserRole.SUPER_ADMIN || actor.role === UserRole.ADMIN) return true
  return assignedToId === null || assignedToId === actor.id
}

export function canManageUser(actor: Pick<AdminActor, 'id' | 'role'>, target: { id: string; role: UserRole }): boolean {
  if (actor.id === target.id && target.role === UserRole.SUPER_ADMIN) return false
  if (target.role === UserRole.SUPER_ADMIN) return actor.role === UserRole.SUPER_ADMIN
  return actor.role === UserRole.ADMIN || actor.role === UserRole.SUPER_ADMIN
}

export function mayViewPrivateDocuments(role: UserRole): boolean {
  return role === UserRole.OPERATIONS || role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN
}
