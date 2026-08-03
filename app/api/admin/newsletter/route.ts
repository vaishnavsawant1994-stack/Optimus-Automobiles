import { NextResponse } from 'next/server'
import { adminError } from '@/lib/admin/api'
import { authorizeAdminRequest } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: Request) { try { await authorizeAdminRequest('newsletter.view'); const query = new URL(request.url).searchParams; const search = query.get('search')?.trim(); const data = await prisma.newsletterSubscriber.findMany({ where: search ? { email: { contains: search, mode: 'insensitive' } } : {}, take: 100, orderBy: { createdAt: 'desc' } }); return NextResponse.json({ data }) } catch (error) { return adminError(error) } }
