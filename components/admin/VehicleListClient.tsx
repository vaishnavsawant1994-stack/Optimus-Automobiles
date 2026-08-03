'use client'

import { Archive, BadgeCheck, CheckCircle2, ImageIcon, Sparkles, Star, XCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AdminStatus } from './AdminPrimitives'

type Row = { id: string; stockNumber: string; model: string; variant: string; year: number; price: number; mileage: number; status: string; published: boolean; featured: boolean; certified: boolean; newArrival: boolean; viewCount: number; favoriteCount: number; updatedAt: string; brand: { name: string }; images: Array<{ url: string; altText: string }>; _count: { images: number; favorites: number } }

const actions = [
  ['feature', 'Feature', Star], ['unfeature', 'Remove featured', XCircle], ['newArrival', 'Mark new arrival', Sparkles], ['certify', 'Certify', BadgeCheck], ['publish', 'Publish eligible', CheckCircle2], ['unpublish', 'Unpublish', XCircle], ['archive', 'Archive', Archive],
] as const

export function VehicleListClient({ rows, canUpdate, canPublish, canArchive }: { rows: Row[]; canUpdate: boolean; canPublish: boolean; canArchive: boolean }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const allowed = actions.filter(([action]) => action === 'publish' || action === 'unpublish' ? canPublish : action === 'archive' ? canArchive : canUpdate)
  async function apply(action: string) {
    if (!selected.length || ((action === 'archive' || action === 'unpublish') && !confirm(`Apply ${action} to ${selected.length} vehicle(s)?`))) return
    setBusy(true); setMessage('')
    const response = await fetch('/api/admin/vehicles/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selected, action }) })
    const payload = await response.json()
    setBusy(false); setMessage(response.ok ? `${payload.summary.succeeded} updated, ${payload.summary.failed} failed.` : payload.error?.message ?? 'Bulk update failed.')
    if (response.ok) { setSelected([]); router.refresh() }
  }
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  return <>
    {selected.length ? <div className="admin-filterbar"><strong>{selected.length} selected</strong>{allowed.map(([action, label, Icon]) => <button className="admin-button admin-button--secondary" disabled={busy} type="button" key={action} onClick={() => apply(action)}><Icon />{label}</button>)}{message ? <span role="status">{message}</span> : null}</div> : null}
    <div className="admin-table-wrap"><table className="admin-table"><caption>Server-paginated vehicle inventory</caption><thead><tr><th><input aria-label="Select all vehicles" type="checkbox" checked={rows.length > 0 && selected.length === rows.length} onChange={(event) => setSelected(event.target.checked ? rows.map((row) => row.id) : [])} /></th><th>Vehicle</th><th>Year</th><th>Price</th><th>Mileage</th><th>Status</th><th>Published</th><th>Flags</th><th>Views</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><input aria-label={`Select ${row.stockNumber}`} type="checkbox" checked={selected.includes(row.id)} onChange={() => toggle(row.id)} /></td><td><Link className="admin-record" href={`/admin/vehicles/${row.id}`}>{row.images[0] ? <Image src={row.images[0].url} alt={row.images[0].altText} width={54} height={40} /> : <span><ImageIcon /></span>}<span><strong>{row.brand.name} {row.model}</strong><small>{row.stockNumber} · {row.variant}</small></span></Link></td><td>{row.year}</td><td>₹{row.price.toLocaleString('en-IN')}</td><td>{row.mileage.toLocaleString('en-IN')} km</td><td><AdminStatus value={row.status} /></td><td><AdminStatus value={row.published ? 'Published' : 'Draft'} /></td><td>{row.featured ? 'Featured ' : ''}{row.certified ? 'Certified ' : ''}{row.newArrival ? 'New' : ''}</td><td>{row.viewCount} / {row._count.favorites}</td><td>{new Date(row.updatedAt).toLocaleDateString('en-IN')}</td><td><Link href={`/admin/vehicles/${row.id}/edit`}>Edit</Link></td></tr>)}</tbody></table></div>
    <div className="admin-mobile-cards">{rows.map((row) => <article className="admin-mobile-card" key={row.id}><header><div><h2>{row.brand.name} {row.model}</h2><p>{row.stockNumber} · {row.variant}</p></div><input aria-label={`Select ${row.stockNumber}`} type="checkbox" checked={selected.includes(row.id)} onChange={() => toggle(row.id)} /></header><p>{row.year} · {row.mileage.toLocaleString('en-IN')} km · ₹{row.price.toLocaleString('en-IN')}</p><footer><AdminStatus value={row.status} /><Link href={`/admin/vehicles/${row.id}`}>Open vehicle</Link></footer></article>)}</div>
  </>
}
