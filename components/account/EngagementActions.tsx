'use client'

import { CalendarClock, LoaderCircle, MessageSquare, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export function EngagementActions({ kind, reference, canChange }: { kind: 'enquiries' | 'test-drives'; reference: string; canChange: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const endpoint = `/api/account/${kind}/${reference}`

  async function sendFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy('message'); setMessage('')
    const form = event.currentTarget
    const data = new FormData(form)
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: data.get('message') }) })
    const payload = await response.json() as { message?: string; error?: { message?: string } }
    setMessage(payload.message ?? payload.error?.message ?? 'Message could not be sent.'); setBusy('')
    if (response.ok) { form.reset(); router.refresh() }
  }

  async function cancel() {
    if (!window.confirm(`Cancel this ${kind === 'enquiries' ? 'enquiry' : 'test drive'}?`)) return
    setBusy('cancel'); setMessage('')
    const response = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel', reason: 'Cancelled by customer' }) })
    const payload = await response.json() as { message?: string; error?: { message?: string } }
    setMessage(payload.message ?? payload.error?.message ?? 'Request could not be changed.'); setBusy('')
    if (response.ok) router.refresh()
  }

  async function reschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy('reschedule'); setMessage('')
    const form = event.currentTarget
    const data = new FormData(form)
    const response = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reschedule', preferredDate: data.get('preferredDate'), preferredTime: data.get('preferredTime') }) })
    const payload = await response.json() as { message?: string; error?: { message?: string } }
    setMessage(payload.message ?? payload.error?.message ?? 'Reschedule request could not be sent.'); setBusy('')
    if (response.ok) { form.reset(); router.refresh() }
  }

  return <section className="engagement-actions">
    <header><MessageSquare /><div><h2>Contact the team</h2><p>Messages stay attached to this reference.</p></div></header>
    {canChange ? <form className="follow-up-form" onSubmit={sendFollowUp}><label>Follow-up message<textarea name="message" minLength={5} maxLength={1000} required placeholder="Ask a question or share an update" /></label><button className="gold-button" disabled={Boolean(busy)}>{busy === 'message' ? <LoaderCircle className="spin" /> : <MessageSquare />}Send message</button></form> : null}
    {kind === 'test-drives' && canChange ? <form className="reschedule-form" onSubmit={reschedule}><label>Preferred date<input name="preferredDate" type="date" min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)} required /></label><label>Preferred time<select name="preferredTime" defaultValue="11:00 AM"><option>10:00 AM</option><option>11:00 AM</option><option>12:00 PM</option><option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option><option>5:00 PM</option></select></label><button className="dark-button" disabled={Boolean(busy)}>{busy === 'reschedule' ? <LoaderCircle className="spin" /> : <CalendarClock />}Request new time</button></form> : null}
    {canChange ? <button className="danger-button" type="button" disabled={Boolean(busy)} onClick={cancel}>{busy === 'cancel' ? <LoaderCircle className="spin" /> : <XCircle />}Cancel {kind === 'enquiries' ? 'enquiry' : 'test drive'}</button> : null}
    {message ? <p className="form-status" role="status">{message}</p> : null}
  </section>
}
