import { NextResponse } from 'next/server'
import { adminError, conflictError, validationError } from '@/lib/admin/api'
import { writeAuditLog } from '@/lib/admin/audit'
import { scheduleTestDrive } from '@/lib/admin/specialist-workflows'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { testDriveScheduleSchema } from '@/lib/validation/admin'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const actor = await authorizeAdminRequest('testDrive.confirm'); const parsed = testDriveScheduleSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors); const { id } = await context.params; const result = await scheduleTestDrive(id, actor, parsed.data, 'confirm'); if (result.type === 'not-found') return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Test drive not found.' } }, { status: 404 }); if (result.type === 'conflict') return conflictError(); if (result.type === 'slot-conflict') return conflictError('That vehicle already has a test drive at this date and time.'); if (result.type === 'invalid-transition') return NextResponse.json({ error: { code: 'INVALID_TRANSITION', message: 'This test drive cannot be confirmed from its current status.' } }, { status: 422 }); await writeAuditLog({ actorId: actor.id, action: 'TEST_DRIVE_CONFIRMED', resourceType: 'TestDrive', resourceId: id, summary: 'Test drive date and time confirmed.', request }); return NextResponse.json({ data: result.data, message: 'Test drive confirmed and customer notified.' }) } catch (error) { return adminError(error) }
}
