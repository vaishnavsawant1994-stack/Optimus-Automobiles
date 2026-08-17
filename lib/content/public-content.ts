import 'server-only'
import { prisma } from '@/lib/db/prisma'

export async function getPublishedContent(key: string): Promise<Record<string, string>> {
  try {
    const block = await Promise.race([
      prisma.contentBlock.findFirst({ where: { key, status: 'PUBLISHED' }, select: { value: true } }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Content DB timeout')), 600)),
    ])
    if (!block?.value || typeof block.value !== 'object' || Array.isArray(block.value)) return {}
    return Object.fromEntries(Object.entries(block.value as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
  } catch { return {} }
}
