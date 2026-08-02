import { z } from 'zod'
import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

const inputSchema = z.object({ vehicleId: z.string().cuid() })

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in to access saved vehicles.' } }, { status: 401 })
  const favorites = await prisma.favorite.findMany({ where: { userId: user.id }, select: { vehicleId: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ data: { ids: favorites.map((item) => item.vehicleId) } })
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in to save this vehicle.' } }, { status: 401 })
  const input = inputSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Select a valid vehicle.' } }, { status: 400 })
  const vehicle = await prisma.vehicle.findFirst({ where: { id: input.data.vehicleId, published: true, status: { notIn: ['DRAFT', 'ARCHIVED'] } }, select: { id: true } })
  if (!vehicle) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Vehicle not found.' } }, { status: 404 })
  const existing = await prisma.favorite.findUnique({ where: { userId_vehicleId: { userId: user.id, vehicleId: vehicle.id } } })
  if (!existing) await prisma.$transaction([prisma.favorite.create({ data: { userId: user.id, vehicleId: vehicle.id } }), prisma.vehicle.update({ where: { id: vehicle.id }, data: { favoriteCount: { increment: 1 } } })])
  return NextResponse.json({ data: { vehicleId: vehicle.id, favorite: true } }, { status: existing ? 200 : 201 })
}

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in to change saved vehicles.' } }, { status: 401 })
  const input = inputSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Select a valid vehicle.' } }, { status: 400 })
  const removed = await prisma.favorite.deleteMany({ where: { userId: user.id, vehicleId: input.data.vehicleId } })
  if (removed.count) await prisma.vehicle.update({ where: { id: input.data.vehicleId }, data: { favoriteCount: { decrement: 1 } } }).catch(() => null)
  return NextResponse.json({ data: { vehicleId: input.data.vehicleId, favorite: false } })
}
