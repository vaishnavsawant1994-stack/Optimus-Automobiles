import { NextResponse } from 'next/server'
import { adminError, validationError } from '@/lib/admin/api'
import { writeAuditLog } from '@/lib/admin/audit'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
import { testimonialSchema } from '@/lib/validation/admin'

export async function GET() { try { await authorizeAdminRequest('testimonial.manage'); return NextResponse.json({ data: await prisma.testimonial.findMany({ orderBy: [{ published: 'desc' }, { sortOrder: 'asc' }] }) }) } catch (error) { return adminError(error) } }
export async function POST(request: Request) { try { const actor = await authorizeAdminRequest('testimonial.manage'); const parsed = testimonialSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors); const data = await prisma.testimonial.create({ data: parsed.data }); await writeAuditLog({ actorId: actor.id, action: data.published ? 'TESTIMONIAL_PUBLISHED' : 'TESTIMONIAL_CREATED', resourceType: 'Testimonial', resourceId: data.id, summary: `Created testimonial for ${data.name}.`, request }); return NextResponse.json({ data, message: 'Testimonial created.' }, { status: 201 }) } catch (error) { return adminError(error) } }
