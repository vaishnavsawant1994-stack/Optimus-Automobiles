import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const data = await prisma.testimonial.findMany({ where: { published: true, archived: false }, orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }] })
  return NextResponse.json({ data: data.map((item) => ({ id: item.id, name: item.name, quote: item.quote, purchase: item.purchase || 'Optimum Automobiles customer', location: item.location || 'Pune', avatar: item.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=85', rating: item.rating, verifiedBuyer: item.verifiedBuyer })) })
}
