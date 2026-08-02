import { ArrowRight, Inbox } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

export function AccountHeading({ eyebrow, title, text, action }: { eyebrow?: string; title: string; text?: string; action?: { label: string; href: string } }) {
  return <header className="account-heading"><div>{eyebrow ? <span>{eyebrow}</span> : null}<h1>{title}</h1>{text ? <p>{text}</p> : null}</div>{action ? <Link className="dark-button" href={action.href}>{action.label}<ArrowRight /></Link> : null}</header>
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`account-status account-status--${status.toLowerCase().replaceAll('_', '-')}`}>{status.replaceAll('_', ' ')}</span>
}

export function AccountEmpty({ title, text, action }: { title: string; text: string; action?: { label: string; href: string } }) {
  return <div className="account-empty"><Inbox /><h2>{title}</h2><p>{text}</p>{action ? <Link className="gold-button" href={action.href}>{action.label}</Link> : null}</div>
}

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return <div className="detail-row"><span>{label}</span><strong>{children}</strong></div>
}
