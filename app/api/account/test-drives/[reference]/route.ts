import { TestDriveStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

const messageSchema = z.object({ message: z.string().trim().min(5).max(1000) })
const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel'), reason: z.string().trim().min(3).max(300).optional() }),
  z.object({ action: z.literal('reschedule'), preferredDate: z.coerce.date().refine((date) => date > new Date(), 'Choose a future date.'), preferredTime: z.string().trim().min(3).max(60) }),
])

const closedStatuses: TestDriveStatus[] = [TestDriveStatus.COMPLETED, TestDriveStatus.CANCELLED, TestDriveStatus.REJECTED, TestDriveStatus.NO_SHOW]

export async function POST(request: Request, context: { params: Promise<{ reference: string }> }) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in again to send a message.' } }, { status: 401 })
  const { reference } = await context.params
  const input = messageSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Enter a message between 5 and 1,000 characters.' } }, { status: 400 })
  const drive = await prisma.testDrive.findFirst({ where: { referenceNumber: reference, userId: user.id }, select: { id: true, status: true } })
  if (!drive) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Test drive not found.' } }, { status: 404 })
  if (closedStatuses.includes(drive.status)) return NextResponse.json({ error: { code: 'CLOSED', message: 'This test drive no longer accepts messages.' } }, { status: 409 })
  const message = await prisma.customerEngagementMessage.create({ data: { userId: user.id, testDriveId: drive.id, body: input.data.message }, select: { id: true, body: true, createdAt: true } })
  return NextResponse.json({ data: message, message: 'Message sent.' }, { status: 201 })
}

export async function PATCH(request: Request, context: { params: Promise<{ reference: string }> }) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in again to update this test drive.' } }, { status: 401 })
  const { reference } = await context.params
  const input = actionSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: input.error.issues[0]?.message ?? 'Check the requested change.' } }, { status: 400 })
  const drive = await prisma.testDrive.findFirst({ where: { referenceNumber: reference, userId: user.id }, select: { id: true, status: true } })
  if (!drive) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Test drive not found.' } }, { status: 404 })
  if (closedStatuses.includes(drive.status)) return NextResponse.json({ error: { code: 'INVALID_TRANSITION', message: 'This test drive can no longer be changed.' } }, { status: 409 })
  const data = input.data.action === 'cancel'
    ? { status: TestDriveStatus.CANCELLED, cancellationReason: input.data.reason ?? 'Cancelled by customer' }
    : { status: TestDriveStatus.RESCHEDULE_REQUESTED, preferredDate: input.data.preferredDate, preferredTime: input.data.preferredTime, confirmedDate: null, confirmedTime: null }
  const updated = await prisma.testDrive.update({ where: { id: drive.id }, data, select: { referenceNumber: true, status: true, preferredDate: true, preferredTime: true, updatedAt: true } })
  await prisma.auditLog.create({ data: { actorId: user.id, action: input.data.action === 'cancel' ? 'TEST_DRIVE_CANCELLED_BY_CUSTOMER' : 'TEST_DRIVE_RESCHEDULE_REQUESTED', entity: 'TestDrive', entityId: drive.id } })
  return NextResponse.json({ data: updated, message: input.data.action === 'cancel' ? 'Test drive cancelled.' : 'Reschedule request sent.' })
}
