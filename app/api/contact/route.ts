import { NextResponse } from 'next/server'
import { contactSchema } from '@/lib/validation/forms'

export async function POST(request: Request) {
  const payload = await request.json()
  const result = contactSchema.safeParse(payload)

  if (!result.success) {
    return NextResponse.json(
      { message: 'Please correct the highlighted contact fields.', issues: result.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  return NextResponse.json({
    message: 'Thanks. Our showroom team will contact you shortly.',
    saved: true,
  })
}
