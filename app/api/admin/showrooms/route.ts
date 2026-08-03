import { NextResponse } from 'next/server'
import { adminError, validationError } from '@/lib/admin/api'
import { writeAuditLog } from '@/lib/admin/audit'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
import { showroomSchema } from '@/lib/validation/admin'
export async function GET() { try { await authorizeAdminRequest('showroom.manage'); return NextResponse.json({ data: await prisma.showroom.findMany({ orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }] }) }) } catch (error) { return adminError(error) } }
export async function POST(request: Request) { try { const actor = await authorizeAdminRequest('showroom.manage'); const parsed = showroomSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors); const data = await prisma.$transaction(async (tx) => { if (parsed.data.isPrimary) await tx.showroom.updateMany({ data: { isPrimary: false } }); return tx.showroom.create({ data: parsed.data }) }); await writeAuditLog({ actorId: actor.id, action: 'SHOWROOM_CREATED', resourceType: 'Showroom', resourceId: data.id, summary: `Created ${data.name}.`, request }); return NextResponse.json({ data, message: 'Showroom created.' }, { status: 201 }) } catch (error) { return adminError(error) } }
