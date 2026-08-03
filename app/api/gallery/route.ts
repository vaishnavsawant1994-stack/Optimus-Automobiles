import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const data = await prisma.galleryItem.findMany({ where: { published: true }, orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }] })
  return NextResponse.json({ data: data.map((item) => ({ id: item.id, alt: item.alt, image: item.imageUrl, title: item.title, caption: item.caption, href: item.href })) })
}
