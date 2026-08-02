import { z } from 'zod'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { mapVehicleCard, vehicleCardInclude } from '@/lib/mappers/vehicle-mapper'

const schema = z.object({ vehicleIds: z.array(z.string().cuid()).max(100) })

export async function POST(request: Request) {
  const input = schema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Saved vehicle data is invalid.' } }, { status: 400 })
  const order = new Map(input.data.vehicleIds.map((id, index) => [id, index]))
  const records = await prisma.vehicle.findMany({ where: { id: { in: input.data.vehicleIds }, published: true, status: { notIn: ['DRAFT', 'ARCHIVED'] } }, include: vehicleCardInclude })
  records.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
  return NextResponse.json({ data: records.map(mapVehicleCard) })
}
