import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { searchInventory } from '@/lib/services/search-service'

export const dynamic = 'force-dynamic'
const searchSchema = z.string().trim().max(120).catch('')

export async function GET(request: NextRequest) {
  try {
    const query = searchSchema.parse(request.nextUrl.searchParams.get('q') ?? '')
    return NextResponse.json({ data: await searchInventory(query, query ? 8 : 6) })
  } catch (error) {
    console.error('search_api_failed', { error })
    return NextResponse.json({ error: { code: 'SEARCH_UNAVAILABLE', message: 'Search is temporarily unavailable.' } }, { status: 503 })
  }
}
