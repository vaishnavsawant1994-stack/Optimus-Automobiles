'use client'

import { LoaderCircle, Plus, Save } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { AdminStatus } from './AdminPrimitives'

type Item = Record<string, unknown> & {
  id: string
  name?: string
  title?: string
  quote?: string
  imageUrl?: string
  published: boolean
  featured: boolean
  sortOrder: number
}

const galleryCategories = [
  'SHOWROOM',
  'DELIVERY',
  'CUSTOMER',
  'VEHICLE',
  'EVENT',
  'INSTAGRAM',
  'OTHER',
]

export function MediaContentManager({
  mode,
  items,
  initialId,
}: {
  mode: 'testimonials' | 'gallery'
  items: Item[]
  initialId?: string
}) {
  const router = useRouter()
  const initial = items.find((item) => item.id === initialId) ?? null
  const [editing, setEditing] = useState<Item | null>(initial)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const payload = mode === 'testimonials'
      ? {
          ...values,
          rating: Number(values.rating),
          sortOrder: Number(values.sortOrder),
          verifiedBuyer: values.verifiedBuyer === 'on',
          featured: values.featured === 'on',
          published: values.published === 'on',
          archived: false,
          vehicleId: null,
        }
      : {
          ...values,
          sortOrder: Number(values.sortOrder),
          featured: values.featured === 'on',
          published: values.published === 'on',
        }
    const response = await fetch(`/api/admin/${mode}${editing ? `/${editing.id}` : ''}`, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await response.json()
    setBusy(false)
    setMessage(body.message ?? body.error?.message ?? 'Operation failed.')
    if (response.ok) {
      setEditing(null)
      router.push(`/admin/${mode}`)
      router.refresh()
    }
  }

  return (
    <div className="admin-detail-layout">
      <div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <caption>{items.length} content records</caption>
            <thead><tr><th>{mode === 'gallery' ? 'Image' : 'Customer'}</th><th>Content</th><th>Order</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{mode === 'gallery' && item.imageUrl ? <Image src={String(item.imageUrl)} alt="" width={80} height={54} style={{ objectFit: 'cover' }} unoptimized /> : String(item.name ?? item.title)}</td>
                  <td>{String(item.quote ?? item.title)}</td>
                  <td>{item.sortOrder}</td>
                  <td><AdminStatus value={item.published ? 'Published' : 'Draft'} /></td>
                  <td><button className="admin-button admin-button--secondary" type="button" onClick={() => setEditing(item)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-mobile-cards">
          {items.map((item) => (
            <article className="admin-mobile-card" key={item.id}>
              <header><h2>{String(item.name ?? item.title)}</h2><AdminStatus value={item.published ? 'Published' : 'Draft'} /></header>
              <p>{String(item.quote ?? item.title)}</p>
              <footer><span>Order {item.sortOrder}</span><button className="admin-button admin-button--secondary" onClick={() => setEditing(item)}>Edit</button></footer>
            </article>
          ))}
        </div>
      </div>
      <aside className="admin-panel">
        <header><h2>{editing ? 'Edit record' : `New ${mode === 'gallery' ? 'gallery item' : 'testimonial'}`}</h2></header>
        <div className="admin-panel__body">
          <form className="admin-form" key={editing?.id ?? 'new'} onSubmit={submit}>
            {mode === 'testimonials' ? (
              <>
                <label>Customer name<input name="name" required defaultValue={String(editing?.name ?? '')} /></label>
                <label>Rating<input name="rating" type="number" min="1" max="5" defaultValue={String(editing?.rating ?? 5)} /></label>
                <label>Quote<textarea name="quote" required defaultValue={String(editing?.quote ?? '')} /></label>
                <label>Avatar URL<input name="avatarUrl" defaultValue={String(editing?.avatarUrl ?? '')} /></label>
                <label>Vehicle purchased<input name="purchase" defaultValue={String(editing?.purchase ?? '')} /></label>
                <label>Location<input name="location" defaultValue={String(editing?.location ?? '')} /></label>
                <label className="admin-checkbox"><input name="verifiedBuyer" type="checkbox" defaultChecked={Boolean(editing?.verifiedBuyer)} /><span>Verified buyer</span></label>
              </>
            ) : (
              <>
                <label>Title<input name="title" required defaultValue={String(editing?.title ?? '')} /></label>
                <label>Image URL<input name="imageUrl" required defaultValue={String(editing?.imageUrl ?? '')} /></label>
                <label>Alt text<input name="alt" required defaultValue={String(editing?.alt ?? '')} /></label>
                <label>Caption<textarea name="caption" defaultValue={String(editing?.caption ?? '')} /></label>
                <label>Category<select name="category" defaultValue={String(editing?.category ?? 'OTHER')}>{galleryCategories.map((value) => <option key={value}>{value}</option>)}</select></label>
                <label>Destination URL<input name="href" defaultValue={String(editing?.href ?? '')} /></label>
              </>
            )}
            <label>Display order<input name="sortOrder" type="number" min="0" defaultValue={editing?.sortOrder ?? 0} /></label>
            <label className="admin-checkbox"><input name="featured" type="checkbox" defaultChecked={Boolean(editing?.featured)} /><span>Featured</span></label>
            <label className="admin-checkbox"><input name="published" type="checkbox" defaultChecked={Boolean(editing?.published)} /><span>Published publicly</span></label>
            {message ? <p className="admin-form-message" role="status">{message}</p> : null}
            <button className="admin-button" disabled={busy}>{busy ? <LoaderCircle /> : editing ? <Save /> : <Plus />}{editing ? 'Save changes' : 'Create record'}</button>
            {editing ? <button className="admin-button admin-button--secondary" type="button" onClick={() => setEditing(null)}>Cancel</button> : null}
          </form>
        </div>
      </aside>
    </div>
  )
}
