import { Prisma, PreferredContactMethod } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { indianPhoneSchema } from '@/lib/auth/validation'
import { getAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: indianPhoneSchema,
  city: z.string().trim().min(2).max(80),
  preferredContactMethod: z.enum(PreferredContactMethod),
})

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in again to update your profile.' } }, { status: 401 })
  const input = schema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Please check your profile details.', fields: input.error.flatten().fieldErrors } }, { status: 400 })
  try {
    const updated = await prisma.user.update({ where: { id: user.id }, data: input.data, select: { name: true, email: true, phone: true, city: true, preferredContactMethod: true } })
    await prisma.auditLog.create({ data: { actorId: user.id, action: 'PROFILE_UPDATED', entity: 'User', entityId: user.id } })
    return NextResponse.json({ data: updated, message: 'Profile updated.' })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: { code: 'PHONE_IN_USE', message: 'That mobile number is already linked to another account.' } }, { status: 409 })
    throw error
  }
}
