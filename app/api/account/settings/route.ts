import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

const schema = z.object({
  enquiryUpdates: z.boolean(), testDriveReminders: z.boolean(), priceChangeAlerts: z.boolean(), soldVehicleAlerts: z.boolean(), marketingEmails: z.boolean(), whatsAppUpdates: z.boolean(),
})

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in again to update preferences.' } }, { status: 401 })
  const input = schema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Notification settings are invalid.' } }, { status: 400 })
  const existing = await prisma.customerNotificationSettings.findUnique({ where: { userId: user.id } })
  const consent = {
    marketingConsentedAt: input.data.marketingEmails ? existing?.marketingConsentedAt ?? new Date() : null,
    whatsAppConsentedAt: input.data.whatsAppUpdates ? existing?.whatsAppConsentedAt ?? new Date() : null,
  }
  const settings = await prisma.customerNotificationSettings.upsert({ where: { userId: user.id }, update: { ...input.data, ...consent }, create: { userId: user.id, ...input.data, ...consent } })
  await prisma.auditLog.create({ data: { actorId: user.id, action: 'NOTIFICATION_SETTINGS_UPDATED', entity: 'User', entityId: user.id } })
  return NextResponse.json({ data: settings, message: 'Notification preferences updated.' })
}
