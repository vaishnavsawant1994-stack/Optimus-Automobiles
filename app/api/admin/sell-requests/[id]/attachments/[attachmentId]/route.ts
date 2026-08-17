import { NextResponse } from 'next/server'
import { adminError } from '@/lib/admin/api'
import { requireAccessibleLead } from '@/lib/admin/lead-service'
import { mayViewPrivateDocuments } from '@/lib/auth/admin-resource-policy'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
import { readSellAttachment } from '@/lib/storage/sell-request-storage'

export async function GET(_: Request, context: { params: Promise<{ id: string; attachmentId: string }> }) {
  try {
    const actor = await authorizeAdminRequest('sellRequest.view')
    if (!mayViewPrivateDocuments(actor.role)) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Your role cannot access customer documents.' } }, { status: 403 })
    const { id, attachmentId } = await context.params
    if (!(await requireAccessibleLead('sell-requests', id, actor))) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })
    const attachment = await prisma.sellRequestAttachment.findFirst({ where: { id: attachmentId, sellRequestId: id } })
    if (!attachment) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })
    const data = await readSellAttachment(attachment.storageKey)
    const safeName = attachment.originalName.replace(/["\r\n]/g, '_')
    return new NextResponse(data, {
      headers: {
        'Content-Type': attachment.mimeType,
        'Content-Length': String(data.byteLength),
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    return adminError(error)
  }
}
