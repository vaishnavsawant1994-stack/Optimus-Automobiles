import { NextResponse } from 'next/server'
import { getActiveBodyTypes } from '@/lib/repositories/body-type-repository'
import { mapBodyTypeSummary } from '@/lib/services/inventory-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const bodyTypes = await getActiveBodyTypes()
    return NextResponse.json({ data: bodyTypes.map(mapBodyTypeSummary) })
  } catch (error) {
    console.error('body_types_api_failed', { error })
    return NextResponse.json({ error: { code: 'BODY_TYPES_UNAVAILABLE', message: 'Body types are temporarily unavailable.' } }, { status: 503 })
  }
}
