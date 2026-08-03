import { NextResponse } from 'next/server'
import { NewsletterStatus } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { newsletterSchema } from '@/lib/validation/forms'

export async function POST(request: Request) {
  const result = newsletterSchema.safeParse(await request.json().catch(() => null))

  if (!result.success) {
    return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 })
  }

  const email = result.data.email.toLowerCase()
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
  if (existing?.status === NewsletterStatus.SUBSCRIBED && existing.active) {
    return NextResponse.json({ message: 'You are already subscribed.' }, { status: 409 })
  }

  const subscriber = await prisma.newsletterSubscriber.upsert({ where: { email }, create: { email, status: NewsletterStatus.SUBSCRIBED, source: 'website', active: true, confirmedAt: new Date() }, update: { status: NewsletterStatus.SUBSCRIBED, active: true, confirmedAt: new Date(), unsubscribedAt: null, suppressedAt: null } })

  return NextResponse.json({
    message: 'Subscribed. You will receive new-arrival updates.',
    subscribedAt: subscriber.consentedAt.toISOString(),
  }, { status: 201 })
}
