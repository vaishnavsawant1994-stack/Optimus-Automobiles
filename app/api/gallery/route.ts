import { NextResponse } from 'next/server'
import { gallery } from '@/lib/constants/site'

export function GET() {
  return NextResponse.json({ data: gallery })
}
