'use client'

import { LoaderCircle, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState, type FormEvent } from 'react'

type Revision = { id: string; version: number; status: string; createdAt: string; author: { name: string | null; email: string } }
const commonFields = ['heroEyebrow', 'headline', 'heading', 'description', 'supportingCopy', 'primaryCtaLabel', 'primaryCtaHref'] as const

export function ContentEditor({ pageKey, value, version, status, revisions }: { pageKey: string; value: unknown; version: number; status: string; revisions: Revision[] }) {
  const router = useRouter(); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
  const initial = useMemo(() => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}, [value])
  const extras = Object.fromEntries(Object.entries(initial).filter(([key]) => !commonFields.includes(key as typeof commonFields[number])))
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); let advanced: Record<string, unknown> = {}
    try { advanced = JSON.parse(String(form.get('advanced') || '{}')) as Record<string, unknown> } catch { setMessage('Advanced fields must contain a valid JSON object.'); return }
    const content: Record<string, unknown> = { ...advanced }
    for (const field of commonFields) { const fieldValue = String(form.get(field) ?? '').trim(); if (fieldValue) content[field] = fieldValue }
    setBusy(true); setMessage('')
    try {
      const response = await fetch(`/api/admin/content/${pageKey}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: content, status: form.get('status'), version }) })
      const body = await response.json().catch(() => ({ error: { message: 'The response could not be read.' } }))
      setMessage(body.message ?? body.error?.message ?? 'Save failed.'); if (response.ok) router.refresh()
    } catch { setMessage('Could not connect to the content service. Try again.') } finally { setBusy(false) }
  }
  return <div className="admin-detail-layout"><section className="admin-panel admin-panel--full"><header><h2>Page content</h2></header><div className="admin-panel__body"><form className="admin-form" onSubmit={submit}><div className="admin-form-grid"><label>Eyebrow / section label<input name="heroEyebrow" defaultValue={String(initial.heroEyebrow ?? '')} /></label><label>Page heading<input name="heading" defaultValue={String(initial.heading ?? '')} /></label></div><label>Hero headline<input name="headline" defaultValue={String(initial.headline ?? '')} /></label><label>Short description<textarea name="description" defaultValue={String(initial.description ?? '')} /></label><label>Supporting copy<textarea name="supportingCopy" defaultValue={String(initial.supportingCopy ?? '')} /></label><div className="admin-form-grid"><label>Primary button label<input name="primaryCtaLabel" defaultValue={String(initial.primaryCtaLabel ?? '')} /></label><label>Primary button link<input name="primaryCtaHref" defaultValue={String(initial.primaryCtaHref ?? '')} placeholder="/inventory" /></label></div><details><summary>Advanced structured fields</summary><p>Keep only page-specific data that is not covered above.</p><label>Additional JSON<textarea name="advanced" defaultValue={JSON.stringify(extras, null, 2)} style={{ minHeight: 180, fontFamily: 'monospace' }} spellCheck={false} /></label></details><label>Publication status<select name="status" defaultValue={status}><option>DRAFT</option><option>IN_REVIEW</option><option>PUBLISHED</option><option>ARCHIVED</option></select></label><div className="admin-content-preview"><small>Preview</small><h3>{String(initial.headline || initial.heading || 'Page heading')}</h3><p>{String(initial.supportingCopy || initial.description || 'Page description will appear here.')}</p></div>{message ? <p className="admin-form-message" role="status">{message}</p> : null}<button className="admin-button" disabled={busy}>{busy ? <LoaderCircle /> : <Save />}Save content</button></form></div></section><aside className="admin-panel"><header><h2>Revision history</h2></header><div className="admin-panel__body admin-timeline">{revisions.length ? revisions.map((item) => <article key={item.id}><strong>Version {item.version} - {item.status}</strong><p>{item.author.name ?? item.author.email}</p><time>{new Date(item.createdAt).toLocaleString('en-IN')}</time></article>) : <p>No revisions yet.</p>}</div></aside></div>
}
