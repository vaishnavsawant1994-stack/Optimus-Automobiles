'use client'

import { Archive, CheckCircle2, LoaderCircle, LockOpen, Tag, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function VehicleAdminActions({ id, version, status, published, permissions }: { id: string; version: number; status: string; published: boolean; permissions: { publish: boolean; reserve: boolean; sold: boolean; archive: boolean } }) {
  const router = useRouter(); const [busy, setBusy] = useState(''); const [message, setMessage] = useState('')
  async function action(path: string, body?: unknown, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return
    setBusy(path); setMessage('')
    const response = await fetch(`/api/admin/vehicles/${id}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) })
    const payload = await response.json(); setBusy(''); setMessage(payload.message ?? payload.error?.message ?? 'Operation failed.'); if (response.ok) router.refresh()
  }
  const statusAction = (next: string, reason?: string) => action('status', { status: next, version, reason }, `Change vehicle status from ${status} to ${next}?`)
  return <div className="admin-detail-stack">{message ? <p className="admin-form-message" role="status">{message}</p> : null}<div className="admin-page-actions">
    {permissions.publish && !published ? <button className="admin-button" disabled={Boolean(busy)} onClick={() => action('publish')} type="button">{busy === 'publish' ? <LoaderCircle /> : <CheckCircle2 />}Publish</button> : null}
    {permissions.publish && published ? <button className="admin-button admin-button--secondary" disabled={Boolean(busy)} onClick={() => action('unpublish', { reason: 'Manual admin unpublish' }, 'Unpublish this vehicle?')} type="button"><XCircle />Unpublish</button> : null}
    {status === 'DRAFT' ? <button className="admin-button admin-button--secondary" disabled={Boolean(busy)} onClick={() => statusAction('AVAILABLE')} type="button"><LockOpen />Make available</button> : null}
    {permissions.reserve && status === 'AVAILABLE' ? <button className="admin-button admin-button--secondary" disabled={Boolean(busy)} onClick={() => statusAction('RESERVED')} type="button"><Tag />Reserve</button> : null}
    {permissions.reserve && status === 'RESERVED' ? <button className="admin-button admin-button--secondary" disabled={Boolean(busy)} onClick={() => statusAction('AVAILABLE', 'Reservation released by staff')} type="button"><LockOpen />Release</button> : null}
    {permissions.sold && ['AVAILABLE', 'RESERVED'].includes(status) ? <button className="admin-button admin-button--secondary" disabled={Boolean(busy)} onClick={() => statusAction('SOLD', 'Sale completed and verified')} type="button"><CheckCircle2 />Mark sold</button> : null}
    {permissions.archive && status !== 'ARCHIVED' ? <button className="admin-button admin-button--danger" disabled={Boolean(busy)} onClick={() => statusAction('ARCHIVED', 'Archived by staff')} type="button"><Archive />Archive</button> : null}
  </div></div>
}
