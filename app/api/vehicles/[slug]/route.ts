import { NextResponse } from 'next/server'
import { getVehicleDetail } from '@/lib/services/vehicle-detail-service'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const result = await getVehicleDetail(slug)
    if (!result) return NextResponse.json({ error: { code: 'VEHICLE_NOT_FOUND', message: 'Vehicle not found.' } }, { status: 404 })
    return NextResponse.json(result)
  } catch (error) {
    console.error('vehicle_api_failed', { error })
    return NextResponse.json({ error: { code: 'VEHICLE_UNAVAILABLE', message: 'Vehicle details are temporarily unavailable.' } }, { status: 503 })
  }
}
