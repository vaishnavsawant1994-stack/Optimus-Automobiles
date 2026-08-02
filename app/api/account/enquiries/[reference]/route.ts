import { InquiryStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

const messageSchema = z.object({ message: z.string().trim().min(5).max(1000) })
const actionSchema = z.object({ action: z.literal('cancel') })

export async function POST(request: Request, context: { params: Promise<{ reference: string }> }) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in again to send a message.' } }, { status: 401 })
  const { reference } = await context.params
  const input = messageSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Enter a message between 5 and 1,000 characters.' } }, { status: 400 })
  const inquiry = await prisma.inquiry.findFirst({ where: { referenceNumber: reference, userId: user.id }, select: { id: true, status: true } })
  if (!inquiry) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Enquiry not found.' } }, { status: 404 })
  if (([InquiryStatus.CLOSED, InquiryStatus.CANCELLED, InquiryStatus.SPAM] as InquiryStatus[]).includes(inquiry.status)) return NextResponse.json({ error: { code: 'CLOSED', message: 'This enquiry no longer accepts messages.' } }, { status: 409 })
  const message = await prisma.customerEngagementMessage.create({ data: { userId: user.id, inquiryId: inquiry.id, body: input.data.message }, select: { id: true, body: true, createdAt: true } })
  return NextResponse.json({ data: message, message: 'Message sent.' }, { status: 201 })
}

export async function PATCH(request: Request, context: { params: Promise<{ reference: string }> }) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in again to update this enquiry.' } }, { status: 401 })
  const { reference } = await context.params
  const input = actionSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Unsupported enquiry action.' } }, { status: 400 })
  const inquiry = await prisma.inquiry.findFirst({ where: { referenceNumber: reference, userId: user.id }, select: { id: true, status: true } })
  if (!inquiry) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Enquiry not found.' } }, { status: 404 })
  if (([InquiryStatus.RESOLVED, InquiryStatus.CLOSED, InquiryStatus.CANCELLED, InquiryStatus.SPAM] as InquiryStatus[]).includes(inquiry.status)) return NextResponse.json({ error: { code: 'INVALID_TRANSITION', message: 'This enquiry can no longer be cancelled.' } }, { status: 409 })
  const updated = await prisma.inquiry.update({ where: { id: inquiry.id }, data: { status: InquiryStatus.CANCELLED }, select: { referenceNumber: true, status: true, updatedAt: true } })
  await prisma.auditLog.create({ data: { actorId: user.id, action: 'INQUIRY_CANCELLED_BY_CUSTOMER', entity: 'Inquiry', entityId: inquiry.id } })
  return NextResponse.json({ data: updated, message: 'Enquiry cancelled.' })
}
