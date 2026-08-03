import { UserRole, type Prisma } from '@prisma/client'
import Link from 'next/link'
import { AdminEmpty, AdminPageHeader, AdminPagination, AdminStatus } from './AdminPrimitives'
import type { LeadKind } from '@/lib/admin/lead-service'
import type { AdminPermission } from '@/lib/auth/admin-permissions'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'

type Search = Promise<{ page?: string; search?: string; status?: string; assigned?: string }>
type Row = { id: string; reference: string; customer: string; subject: string; status: string; priority: string; assigned: string; createdAt: Date }

function assignmentFilter(actor: { id: string; role: UserRole }, requested?: string) {
  if (actor.role === UserRole.ADMIN || actor.role === UserRole.SUPER_ADMIN) {
    if (requested === 'mine') return { assignedToId: actor.id }
    if (requested === 'unassigned') return { assignedToId: null }
    return {}
  }
  if (requested === 'unassigned') return { assignedToId: null }
  if (requested === 'mine') return { assignedToId: actor.id }
  return { OR: [{ assignedToId: null }, { assignedToId: actor.id }] }
}

export async function LeadListPage({ kind, title, description, permission, searchParams }: { kind: LeadKind; title: string; description: string; permission: AdminPermission; searchParams: Search }) {
  const actor = await requirePermission(permission)
  const query = await searchParams
  const page = Math.max(1, Number(query.page) || 1); const take = 20; const skip = (page - 1) * take
  const assignment = assignmentFilter(actor, query.assigned)
  let rows: Row[] = []; let total = 0

  if (kind === 'enquiries') {
    const where: Prisma.InquiryWhereInput = { ...assignment, ...(query.status ? { status: query.status as never } : {}), ...(query.search ? { OR: [{ referenceNumber: { contains: query.search, mode: 'insensitive' } }, { fullName: { contains: query.search, mode: 'insensitive' } }, { email: { contains: query.search, mode: 'insensitive' } }] } : {}) }
    const [data, count] = await Promise.all([prisma.inquiry.findMany({ where, take, skip, orderBy: { submittedAt: 'desc' }, include: { vehicle: { select: { shortTitle: true } }, assignedTo: { select: { name: true } } } }), prisma.inquiry.count({ where })])
    rows = data.map((item) => ({ id: item.id, reference: item.referenceNumber, customer: item.fullName, subject: item.vehicle?.shortTitle ?? 'General vehicle enquiry', status: item.status, priority: item.priority, assigned: item.assignedTo?.name ?? 'Unassigned', createdAt: item.submittedAt })); total = count
  } else if (kind === 'test-drives') {
    const where: Prisma.TestDriveWhereInput = { ...assignment, ...(query.status ? { status: query.status as never } : {}), ...(query.search ? { OR: [{ referenceNumber: { contains: query.search, mode: 'insensitive' } }, { fullName: { contains: query.search, mode: 'insensitive' } }] } : {}) }
    const [data, count] = await Promise.all([prisma.testDrive.findMany({ where, take, skip, orderBy: { submittedAt: 'desc' }, include: { vehicle: { select: { shortTitle: true } }, assignedTo: { select: { name: true } } } }), prisma.testDrive.count({ where })])
    rows = data.map((item) => ({ id: item.id, reference: item.referenceNumber, customer: item.fullName, subject: item.vehicle.shortTitle, status: item.status, priority: item.priority, assigned: item.assignedTo?.name ?? 'Unassigned', createdAt: item.submittedAt })); total = count
  } else if (kind === 'sell-requests') {
    const where: Prisma.SellRequestWhereInput = { ...assignment, ...(query.status ? { status: query.status as never } : {}), ...(query.search ? { OR: [{ referenceNumber: { contains: query.search, mode: 'insensitive' } }, { name: { contains: query.search, mode: 'insensitive' } }, { make: { contains: query.search, mode: 'insensitive' } }, { model: { contains: query.search, mode: 'insensitive' } }] } : {}) }
    const [data, count] = await Promise.all([prisma.sellRequest.findMany({ where, take, skip, orderBy: { createdAt: 'desc' }, include: { assignedTo: { select: { name: true } } } }), prisma.sellRequest.count({ where })])
    rows = data.map((item) => ({ id: item.id, reference: item.referenceNumber, customer: item.name ?? 'Customer', subject: [item.year, item.make, item.model].filter(Boolean).join(' '), status: item.status, priority: item.priority, assigned: item.assignedTo?.name ?? 'Unassigned', createdAt: item.createdAt })); total = count
  } else {
    const where: Prisma.ContactMessageWhereInput = { ...assignment, ...(query.status ? { status: query.status as never } : {}), ...(query.search ? { OR: [{ referenceNumber: { contains: query.search, mode: 'insensitive' } }, { name: { contains: query.search, mode: 'insensitive' } }, { email: { contains: query.search, mode: 'insensitive' } }] } : {}) }
    const [data, count] = await Promise.all([prisma.contactMessage.findMany({ where, take, skip, orderBy: { createdAt: 'desc' }, include: { assignedTo: { select: { name: true } } } }), prisma.contactMessage.count({ where })])
    rows = data.map((item) => ({ id: item.id, reference: item.referenceNumber, customer: item.name, subject: item.subject || item.message.slice(0, 70), status: item.status, priority: item.priority, assigned: item.assignedTo?.name ?? 'Unassigned', createdAt: item.createdAt })); total = count
  }

  const basePath = `/admin/${kind}`
  return <><AdminPageHeader title={title} text={description} breadcrumb={title} /><form className="admin-filterbar"><label className="admin-filterbar__search">Search<input name="search" defaultValue={query.search} placeholder="Reference, customer or vehicle" /></label><label>Status<input name="status" defaultValue={query.status} placeholder="All statuses" /></label><label>Assignment<select name="assigned" defaultValue={query.assigned ?? 'all'}><option value="all">Accessible records</option><option value="mine">Assigned to me</option><option value="unassigned">Unassigned</option></select></label><button className="admin-button">Apply</button></form>{rows.length ? <><div className="admin-table-wrap"><table className="admin-table"><caption>{total} operational records</caption><thead><tr><th>Reference</th><th>Customer</th><th>Vehicle / subject</th><th>Status</th><th>Priority</th><th>Assigned</th><th>Received</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><Link href={`${basePath}/${row.id}`}><strong>{row.reference}</strong></Link></td><td>{row.customer}</td><td>{row.subject}</td><td><AdminStatus value={row.status} /></td><td><AdminStatus value={row.priority} /></td><td>{row.assigned}</td><td>{row.createdAt.toLocaleDateString('en-IN')}</td></tr>)}</tbody></table></div><div className="admin-mobile-cards">{rows.map((row) => <article className="admin-mobile-card" key={row.id}><header><h2>{row.reference}</h2><AdminStatus value={row.status} /></header><p>{row.customer}<br />{row.subject}</p><footer><span>{row.assigned}</span><Link href={`${basePath}/${row.id}`}>Open record</Link></footer></article>)}</div><AdminPagination page={page} totalPages={Math.max(1, Math.ceil(total / take))} basePath={basePath} params={{ search: query.search, status: query.status, assigned: query.assigned }} /></> : <AdminEmpty title={`No ${title.toLowerCase()}`} text="No records match these filters or your current assignment access." />}</>
}
