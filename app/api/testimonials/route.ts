import { NextResponse } from 'next/server'
import { testimonials } from '@/lib/constants/site'

export function GET() {
  return NextResponse.json({ data: testimonials })
}
