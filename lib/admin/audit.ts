import 'server-only'

export { hashRequestValue, sanitizeAuditMetadata } from './audit-sanitize'
import { hashRequestValue, sanitizeAuditMetadata } from './audit-sanitize'
import { prisma } from '@/lib/db/prisma'

export async function writeAuditLog(input: {
  actorId?: string
  action: string
  resourceType: string
  resourceId?: string
  summary: string
  metadata?: unknown
  request?: Request
}) {
  const ip = input.request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entity: input.resourceType,
      entityId: input.resourceId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      summary: input.summary.slice(0, 500),
      metadata: sanitizeAuditMetadata(input.metadata),
      ipHash: hashRequestValue(ip),
      userAgent: input.request?.headers.get('user-agent')?.slice(0, 500),
    },
  })
}
