import { z } from 'zod'
import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

const syncSchema = z.object({ vehicleIds: z.array(z.string().cuid()).max(100) })

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in to synchronize saved vehicles.' } }, { status: 401 })
  const input = syncSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Saved vehicle data is invalid.' } }, { status: 400 })
  const uniqueIds = [...new Set(input.data.vehicleIds)]
  const vehicles = await prisma.vehicle.findMany({ where: { id: { in: uniqueIds }, published: true, status: { notIn: ['DRAFT', 'ARCHIVED'] } }, select: { id: true } })
  await prisma.favorite.createMany({ data: vehicles.map((vehicle) => ({ userId: user.id, vehicleId: vehicle.id })), skipDuplicates: true })
  const ids = (await prisma.favorite.findMany({ where: { userId: user.id }, select: { vehicleId: true }, orderBy: { createdAt: 'desc' } })).map((item) => item.vehicleId)
  return NextResponse.json({ data: { ids, synchronized: vehicles.length } })
}
