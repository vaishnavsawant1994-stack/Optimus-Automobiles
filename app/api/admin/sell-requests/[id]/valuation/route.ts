import { NextResponse } from 'next/server'
import { adminError, validationError } from '@/lib/admin/api'
import { writeAuditLog } from '@/lib/admin/audit'
import { createSellValuation } from '@/lib/admin/specialist-workflows'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { valuationSchema } from '@/lib/validation/admin'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const actor = await authorizeAdminRequest('sellRequest.value'); const parsed = valuationSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors); const { id } = await context.params; const data = await createSellValuation(id, actor, parsed.data); if (!data) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Sell request not found.' } }, { status: 404 }); await writeAuditLog({ actorId: actor.id, action: parsed.data.finalOffer ? 'SELL_OFFER_CREATED' : 'SELL_VALUATION_CREATED', resourceType: 'SellRequest', resourceId: id, summary: parsed.data.finalOffer ? 'Customer offer created.' : 'Internal valuation created.', request }); return NextResponse.json({ data, message: parsed.data.finalOffer ? 'Offer recorded.' : 'Valuation recorded.' }, { status: 201 }) } catch (error) { return adminError(error) }
}
