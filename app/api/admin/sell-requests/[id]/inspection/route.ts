import { NextResponse } from 'next/server'
import { adminError, validationError } from '@/lib/admin/api'
import { writeAuditLog } from '@/lib/admin/audit'
import { saveSellInspection } from '@/lib/admin/specialist-workflows'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { inspectionSchema } from '@/lib/validation/admin'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const actor = await authorizeAdminRequest('sellRequest.inspect'); const parsed = inspectionSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors); const { id } = await context.params; const data = await saveSellInspection(id, actor, parsed.data); if (!data) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Sell request not found.' } }, { status: 404 }); await writeAuditLog({ actorId: actor.id, action: 'SELL_INSPECTION_UPDATED', resourceType: 'SellRequest', resourceId: id, summary: 'Inspection record updated.', request }); return NextResponse.json({ data, message: 'Inspection saved.' }) } catch (error) { return adminError(error) }
}
