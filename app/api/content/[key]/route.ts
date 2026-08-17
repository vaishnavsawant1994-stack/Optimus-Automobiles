import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

const allowed = new Set(['homepage', 'about', 'contact', 'services'])

function withDbTimeout<T>(promise: Promise<T>, ms = 600): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ])
}

export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  if (!allowed.has(key)) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })

  try {
    const data = await withDbTimeout(
      prisma.contentBlock.findFirst({
        where: {
          key,
          status: 'PUBLISHED',
          OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
        },
        select: { key: true, value: true, version: true, publishedAt: true },
      }),
      500
    )
    return data
      ? NextResponse.json({ data })
      : NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })
  } catch {
    return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })
  }
}
