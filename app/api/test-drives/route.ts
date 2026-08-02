import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { testDriveSchema } from '@/lib/validation/leads'

export async function POST(request: Request) {
  const parsed = testDriveSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Please check the test-drive details.', fields: parsed.error.flatten().fieldErrors } }, { status: 400 })
  try {
    const testDrive = await prisma.testDrive.create({ data: parsed.data, select: { id: true, status: true, createdAt: true } })
    return NextResponse.json({ data: testDrive, message: 'Test-drive request received.' }, { status: 201 })
  } catch (error) {
    console.error('test_drive_create_failed', { error })
    return NextResponse.json({ error: { code: 'SUBMISSION_FAILED', message: 'The test-drive request could not be submitted.' } }, { status: 503 })
  }
}
