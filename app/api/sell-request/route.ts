import { NextResponse } from 'next/server'
import { sellRequestSchema } from '@/lib/validation/forms'

export async function POST(request: Request) {
  const payload = await request.json()
  const result = sellRequestSchema.safeParse(payload)

  if (!result.success) {
    return NextResponse.json(
      { message: 'Please review the valuation details and try again.', issues: result.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const reference = `DWV-${Date.now().toString(36).toUpperCase()}`
  return NextResponse.json({ success: true, reference, message: `Valuation request ${reference} received. Our buying team will call you shortly.` })
}
