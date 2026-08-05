import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

export type ReferenceKind = 'ENQ' | 'TD' | 'SELL' | 'CON'

async function referenceExists(tx: Prisma.TransactionClient, kind: ReferenceKind, referenceNumber: string) {
  if (kind === 'ENQ') return Boolean(await tx.inquiry.findUnique({ where: { referenceNumber }, select: { id: true } }))
  if (kind === 'TD') return Boolean(await tx.testDrive.findUnique({ where: { referenceNumber }, select: { id: true } }))
  if (kind === 'SELL') return Boolean(await tx.sellRequest.findUnique({ where: { referenceNumber }, select: { id: true } }))
  return Boolean(await tx.contactMessage.findUnique({ where: { referenceNumber }, select: { id: true } }))
}

export async function createReferenceNumber(kind: ReferenceKind) {
  return prisma.$transaction(async (tx) => {
    let counter = await tx.referenceCounter.upsert({
      where: { key: kind },
      update: { value: { increment: 1 } },
      create: { key: kind, value: 1 },
    })

    while (true) {
      const referenceNumber = `OA-${kind}-${new Date().getFullYear()}-${String(counter.value).padStart(6, '0')}`
      if (!(await referenceExists(tx, kind, referenceNumber))) return referenceNumber
      counter = await tx.referenceCounter.update({ where: { key: kind }, data: { value: { increment: 1 } } })
    }
  })
}
