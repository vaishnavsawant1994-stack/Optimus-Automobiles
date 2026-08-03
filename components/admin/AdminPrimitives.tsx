import { Inbox, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

export function AdminPageHeader({ title, text, breadcrumb, actions }: { title: string; text?: string; breadcrumb?: string; actions?: ReactNode }) {
  return <header className="admin-page-header"><div><nav className="admin-breadcrumb" aria-label="Breadcrumb"><Link href="/admin">Admin</Link>{breadcrumb ? <span>{breadcrumb}</span> : null}</nav><h1>{title}</h1>{text ? <p>{text}</p> : null}</div>{actions ? <div className="admin-page-actions">{actions}</div> : null}</header>
}

export function AdminMetric({ label, value, helper, icon: Icon }: { label: string; value: string | number; helper: string; icon: LucideIcon }) {
  return <article className="admin-metric"><div><small>{label}</small><strong>{value}</strong></div><Icon /><span>{helper}</span></article>
}

export function AdminStatus({ value }: { value: string }) {
  const normalized = value.toUpperCase()
  const tone = ['ACTIVE', 'AVAILABLE', 'PUBLISHED', 'CONFIRMED', 'COMPLETED', 'RESOLVED', 'SUBSCRIBED'].includes(normalized) ? 'success' : ['URGENT', 'SOLD', 'CANCELLED', 'DISABLED', 'SPAM', 'REJECTED'].includes(normalized) ? 'danger' : ['DRAFT', 'PENDING', 'NEW', 'REQUESTED', 'IN_REVIEW', 'RESERVED', 'WAITING_FOR_CUSTOMER'].includes(normalized) ? 'warning' : 'info'
  return <span className={`admin-status admin-status--${tone}`}>{value.replaceAll('_', ' ')}</span>
}

export function AdminEmpty({ title, text, action }: { title: string; text: string; action?: { label: string; href: string } }) {
  return <div className="admin-empty"><Inbox /><h2>{title}</h2><p>{text}</p>{action ? <Link className="admin-button admin-button--secondary" href={action.href}>{action.label}</Link> : null}</div>
}

export function AdminPagination({ page, totalPages, basePath, params }: { page: number; totalPages: number; basePath: string; params?: Record<string, string | undefined> }) {
  if (totalPages <= 1) return null
  const href = (target: number) => { const query = new URLSearchParams(); Object.entries(params ?? {}).forEach(([key, value]) => { if (value) query.set(key, value) }); query.set('page', String(target)); return `${basePath}?${query}` }
  return <nav className="admin-pagination" aria-label="Pagination">{page > 1 ? <Link href={href(page - 1)}>Prev</Link> : null}<span>{page}</span>{page < totalPages ? <Link href={href(page + 1)}>Next</Link> : null}</nav>
}
