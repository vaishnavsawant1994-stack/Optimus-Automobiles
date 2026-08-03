'use client'

import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, RefreshCw, Star, Trash2, UploadCloud } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

type ManagedImage = { id: string; url: string; thumbnailUrl: string | null; altText: string; category: string; sortOrder: number; isPrimary: boolean; width: number | null; height: number | null; sizeBytes: number | null }

export function VehicleImageManager({ vehicleId, initialImages, canEdit }: { vehicleId: string; initialImages: ManagedImage[]; canEdit: boolean }) {
  const router = useRouter(); const input = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState(initialImages)
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [failed, setFailed] = useState<File[]>([])
  async function upload(files: File[]) {
    if (!files.length || !canEdit) return
    setBusy(true); setFailed([]); const failures: File[] = []
    for (const file of files.slice(0, Math.max(0, 40 - images.length))) {
      const form = new FormData(); form.set('file', file); form.set('category', 'EXTERIOR'); form.set('altText', file.name.replace(/\.[^.]+$/, '').replaceAll('-', ' ')); form.set('isPrimary', String(images.length === 0))
      const response = await fetch(`/api/admin/vehicles/${vehicleId}/images`, { method: 'POST', body: form })
      if (!response.ok) failures.push(file)
    }
    setFailed(failures); setBusy(false); setMessage(failures.length ? `${failures.length} image(s) failed secure validation. Retry or choose another file.` : 'Images uploaded and responsive variants generated.'); router.refresh()
  }
  async function saveOrder(next: ManagedImage[]) {
    setImages(next); setBusy(true)
    const response = await fetch(`/api/admin/vehicles/${vehicleId}/images`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ images: next.map((item, index) => ({ id: item.id, sortOrder: index, isPrimary: item.isPrimary })) }) })
    setBusy(false); setMessage(response.ok ? 'Image order saved.' : 'Image order could not be saved.'); if (response.ok) router.refresh()
  }
  function move(index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= images.length) return; const next = [...images]; [next[index], next[target]] = [next[target]!, next[index]!]; void saveOrder(next) }
  function primary(id: string) { void saveOrder(images.map((item) => ({ ...item, isPrimary: item.id === id }))) }
  async function remove(id: string) { if (!confirm('Remove this image and its generated variants?')) return; setBusy(true); const response = await fetch(`/api/admin/vehicles/${vehicleId}/images/${id}`, { method: 'DELETE' }); setBusy(false); if (response.ok) { setImages((current) => current.filter((item) => item.id !== id)); router.refresh() } else setMessage('Image could not be removed.') }
  return <section className="admin-form-section"><header><h2>Vehicle Images</h2><p>JPEG, PNG, WebP or AVIF · 12 MB maximum · minimum 640 × 400 · metadata stripped.</p></header>
    {canEdit ? <div className="admin-upload-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void upload(Array.from(event.dataTransfer.files)) }}><UploadCloud /><strong>Drop multiple vehicle images here</strong><span>or use the accessible file picker</span><button className="admin-button admin-button--secondary" type="button" onClick={() => input.current?.click()}><ImagePlus />Choose images</button><input ref={input} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void upload(Array.from(event.target.files ?? []))} /></div> : null}
    {busy ? <p className="admin-form-message"><LoaderCircle /> Processing images…</p> : null}{message ? <p className="admin-form-message" role="status">{message}</p> : null}{failed.length ? <button className="admin-button admin-button--secondary" type="button" onClick={() => upload(failed)}><RefreshCw />Retry failed uploads</button> : null}
    <div className="admin-image-grid">{images.map((item, index) => <article key={item.id}><div><Image src={item.thumbnailUrl ?? item.url} alt={item.altText} fill sizes="240px" /></div><header><span>{item.category}</span>{item.isPrimary ? <strong><Star />Primary</strong> : null}</header><p>{item.altText}</p><small>{item.width} × {item.height}{item.sizeBytes ? ` · ${(item.sizeBytes / 1024).toFixed(0)} KB` : ''}</small>{canEdit ? <footer><button type="button" aria-label="Move image up" disabled={index === 0 || busy} onClick={() => move(index, -1)}><ArrowUp /></button><button type="button" aria-label="Move image down" disabled={index === images.length - 1 || busy} onClick={() => move(index, 1)}><ArrowDown /></button><button type="button" aria-label="Set as primary image" disabled={item.isPrimary || busy} onClick={() => primary(item.id)}><Star /></button><button type="button" aria-label="Delete image" disabled={busy} onClick={() => remove(item.id)}><Trash2 /></button></footer> : null}</article>)}</div>
  </section>
}
