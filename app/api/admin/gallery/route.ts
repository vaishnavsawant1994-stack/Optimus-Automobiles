import { NextResponse } from 'next/server'
import { adminError, validationError } from '@/lib/admin/api'
import { writeAuditLog } from '@/lib/admin/audit'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
import { gallerySchema } from '@/lib/validation/admin'

export async function GET() { try { await authorizeAdminRequest('gallery.manage'); return NextResponse.json({ data: await prisma.galleryItem.findMany({ orderBy: [{ published: 'desc' }, { sortOrder: 'asc' }] }) }) } catch (error) { return adminError(error) } }
export async function POST(request: Request) { try { const actor = await authorizeAdminRequest('gallery.manage'); const parsed = gallerySchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors); const data = await prisma.galleryItem.create({ data: parsed.data }); await writeAuditLog({ actorId: actor.id, action: data.published ? 'GALLERY_ITEM_PUBLISHED' : 'GALLERY_ITEM_CREATED', resourceType: 'GalleryItem', resourceId: data.id, summary: `Created gallery item ${data.title}.`, request }); return NextResponse.json({ data, message: 'Gallery item created.' }, { status: 201 }) } catch (error) { return adminError(error) } }
