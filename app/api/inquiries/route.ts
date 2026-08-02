import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { inquirySchema } from '@/lib/validation/leads'

export async function POST(request: Request) {
  const parsed = inquirySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Please check the enquiry details.', fields: parsed.error.flatten().fieldErrors } }, { status: 400 })
  try {
    const inquiry = await prisma.inquiry.create({ data: parsed.data, select: { id: true, createdAt: true } })
    return NextResponse.json({ data: inquiry, message: 'Enquiry received.' }, { status: 201 })
  } catch (error) {
    console.error('inquiry_create_failed', { error })
    return NextResponse.json({ error: { code: 'SUBMISSION_FAILED', message: 'The enquiry could not be submitted.' } }, { status: 503 })
  }
}
