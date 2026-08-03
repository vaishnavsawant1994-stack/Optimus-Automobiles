import { createHash } from 'node:crypto'
import type { Prisma } from '@prisma/client'

const sensitiveKeys = /password|token|secret|authorization|cookie|document|access.?key/i

export function sanitizeAuditMetadata(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => sanitizeAuditMetadata(item) ?? null)
  if (typeof value === 'object') {
    const safe: Record<string, Prisma.InputJsonValue> = {}
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (sensitiveKeys.test(key)) continue
      const sanitized = sanitizeAuditMetadata(item)
      if (sanitized !== undefined) safe[key] = sanitized
    }
    return safe
  }
  if (typeof value === 'string') return value.slice(0, 1000)
  if (typeof value === 'number' || typeof value === 'boolean') return value
  return String(value).slice(0, 1000)
}

export function hashRequestValue(value: string | null): string | undefined {
  return value ? createHash('sha256').update(value).digest('hex') : undefined
}
