import { prisma } from '@/lib/db/prisma'

export type ReferenceKind = 'ENQ' | 'TD' | 'SELL'

export async function createReferenceNumber(kind: ReferenceKind) {
  const counter = await prisma.referenceCounter.upsert({
    where: { key: kind },
    update: { value: { increment: 1 } },
    create: { key: kind, value: 1 },
  })
  return `DW-${kind}-${new Date().getFullYear()}-${String(counter.value).padStart(6, '0')}`
}
