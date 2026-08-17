import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { gallery } from '@/lib/constants/site'

function withDbTimeout<T>(promise: Promise<T>, ms = 600): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ])
}

export async function GET() {
  try {
    const data = await withDbTimeout(
      prisma.galleryItem.findMany({
        where: { published: true },
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      500
    )
    if (!data || data.length === 0) throw new Error('No gallery items in DB')
    return NextResponse.json({
      data: data.map((item) => ({
        id: item.id,
        alt: item.alt,
        image: item.imageUrl,
        title: item.title,
        caption: item.caption,
        href: item.href,
      })),
    })
  } catch {
    return NextResponse.json({
      data: gallery.map((item, index) => ({
        id: `gallery-fallback-${index + 1}`,
        alt: item.alt,
        image: item.image,
        title: item.alt,
        caption: '',
        href: '',
      })),
    })
  }
}
