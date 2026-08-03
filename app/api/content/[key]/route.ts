import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
const allowed = new Set(['homepage', 'about', 'contact', 'services'])
export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }) { const { key } = await params; if (!allowed.has(key)) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 }); const data = await prisma.contentBlock.findFirst({ where: { key, status: 'PUBLISHED', OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }] }, select: { key: true, value: true, version: true, publishedAt: true } }); return data ? NextResponse.json({ data }) : NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 }) }
