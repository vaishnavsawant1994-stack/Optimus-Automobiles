import { NextResponse } from 'next/server'
import { newsletterSchema } from '@/lib/validation/forms'

const subscribers = new Set<string>()

export async function POST(request: Request) {
  const payload = await request.json()
  const result = newsletterSchema.safeParse(payload)

  if (!result.success) {
    return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 })
  }

  const email = result.data.email.toLowerCase()
  if (subscribers.has(email)) {
    return NextResponse.json({ message: 'You are already subscribed.' }, { status: 409 })
  }

  subscribers.add(email)

  return NextResponse.json({
    message: 'Subscribed. You will receive new-arrival updates.',
    subscribedAt: new Date().toISOString(),
  })
}
