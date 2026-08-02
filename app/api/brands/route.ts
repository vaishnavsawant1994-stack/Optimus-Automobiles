import { NextResponse } from 'next/server'
import { getActiveBrands } from '@/lib/repositories/brand-repository'
import { mapBrandSummary } from '@/lib/services/inventory-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const brands = await getActiveBrands()
    return NextResponse.json({ data: brands.map(mapBrandSummary) })
  } catch (error) {
    console.error('brands_api_failed', { error })
    return NextResponse.json({ error: { code: 'BRANDS_UNAVAILABLE', message: 'Brands are temporarily unavailable.' } }, { status: 503 })
  }
}
