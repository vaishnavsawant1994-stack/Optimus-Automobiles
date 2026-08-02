import { NextResponse } from 'next/server'
import { sellRequestSchema } from '@/lib/validation/forms'
import { getAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { createReferenceNumber } from '@/lib/references'
import { checkRateLimit, requestFingerprint } from '@/lib/security/rate-limit'

export async function POST(request: Request) {
  const limit = checkRateLimit(requestFingerprint(request, 'sell-request'), 4, 15 * 60_000)
  if (!limit.allowed) return NextResponse.json({ message: 'Too many valuation requests were submitted. Please try again later.' }, { status: 429 })
  const payload = await request.json().catch(() => null)
  const result = sellRequestSchema.safeParse(payload)

  if (!result.success) {
    return NextResponse.json(
      { message: 'Please review the valuation details and try again.', issues: result.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  try {
    const user = await getAuthenticatedUser()
    const reference = await createReferenceNumber('SELL')
    await prisma.sellRequest.create({
      data: {
        referenceNumber: reference,
        userId: user?.id,
        status: 'SUBMITTED',
        name: user?.name ?? result.data.name,
        phone: user?.phone ?? result.data.phone,
        email: user?.email ?? result.data.email.toLowerCase(),
        make: result.data.make,
        model: result.data.model,
        year: result.data.year,
        mileage: result.data.mileage,
        fuelType: result.data.fuel,
        transmission: result.data.transmission,
        city: result.data.city,
        message: result.data.message,
      },
    })
    return NextResponse.json({ success: true, reference, message: `Valuation request ${reference} received. Our buying team will call you shortly.` }, { status: 201 })
  } catch (error) {
    console.error('sell_request_create_failed', { error })
    return NextResponse.json({ message: 'The valuation request could not be submitted. Please try again.' }, { status: 503 })
  }
}
