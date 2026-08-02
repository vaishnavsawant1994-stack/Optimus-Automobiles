'use client'

import { Check, LoaderCircle, LogOut, Save, ShieldCheck } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState, type FormEvent } from 'react'

type Profile = { name: string; email: string; phone: string; city: string; preferredContactMethod: string }
type Settings = { enquiryUpdates: boolean; testDriveReminders: boolean; priceChangeAlerts: boolean; soldVehicleAlerts: boolean; marketingEmails: boolean; whatsAppUpdates: boolean }

async function send(url: string, method: 'PATCH' | 'POST', body?: unknown) {
  const response = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
  const payload = await response.json().catch(() => ({})) as { message?: string; error?: { message?: string } }
  return { response, message: payload.message ?? payload.error?.message ?? 'The change could not be saved.' }
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('')
    const data = new FormData(event.currentTarget)
    const result = await send('/api/account/profile', 'PATCH', Object.fromEntries(data.entries()))
    setMessage(result.message); setBusy(false)
  }
  return <form className="account-form" onSubmit={submit}><div className="account-form__row"><label>Full name<input name="name" defaultValue={profile.name} autoComplete="name" required /></label><label>Verified email<input value={profile.email} readOnly disabled /></label></div><div className="account-form__row"><label>Mobile number<input name="phone" defaultValue={profile.phone} autoComplete="tel" required /></label><label>City<input name="city" defaultValue={profile.city} autoComplete="address-level2" required /></label></div><label>Preferred contact method<select name="preferredContactMethod" defaultValue={profile.preferredContactMethod}><option value="EMAIL">Email</option><option value="PHONE">Phone</option><option value="WHATSAPP">WhatsApp</option></select></label>{message ? <p className="form-status" role="status">{message}</p> : null}<button className="gold-button" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <Save />}Save profile</button></form>
}

const settingCopy: Array<[keyof Settings, string, string]> = [
  ['enquiryUpdates', 'Enquiry updates', 'Status changes and replies from our sales team.'], ['testDriveReminders', 'Test-drive reminders', 'Appointment confirmations and timely reminders.'],
  ['priceChangeAlerts', 'Price-change alerts', 'Updates when a saved vehicle price changes.'], ['soldVehicleAlerts', 'Availability alerts', 'Know when a saved vehicle is reserved or sold.'],
  ['marketingEmails', 'New arrivals by email', 'Optional curated inventory and dealership updates.'], ['whatsAppUpdates', 'WhatsApp updates', 'Optional request and inventory updates on WhatsApp.'],
]

export function NotificationSettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState(initial); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setMessage(''); const result = await send('/api/account/settings', 'PATCH', values); setMessage(result.message); setBusy(false) }
  return <form className="account-form settings-form" onSubmit={submit}><div className="settings-list">{settingCopy.map(([key, title, text]) => <label key={key}><span><strong>{title}</strong><small>{text}</small></span><input type="checkbox" checked={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.checked }))} /><i aria-hidden="true"><Check /></i></label>)}</div>{message ? <p className="form-status" role="status">{message}</p> : null}<button className="gold-button" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <Save />}Save preferences</button></form>
}

export function SecurityForm({ hasPassword }: { hasPassword: boolean }) {
  const [busy, setBusy] = useState(''); const [message, setMessage] = useState('')
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy('password'); setMessage('')
    const form = event.currentTarget; const data = new FormData(form)
    if (data.get('newPassword') !== data.get('confirmPassword')) { setMessage('New passwords do not match.'); setBusy(''); return }
    const result = await send('/api/account/security/change-password', 'POST', { currentPassword: data.get('currentPassword'), newPassword: data.get('newPassword') })
    setMessage(result.message); setBusy('')
    if (result.response.ok) await signOut({ callbackUrl: '/login?reason=password-changed' })
  }
  async function logoutAll() { if (!window.confirm('Sign out every device connected to this account?')) return; setBusy('logout'); const result = await send('/api/account/security/logout-all', 'POST'); setMessage(result.message); setBusy(''); if (result.response.ok) await signOut({ callbackUrl: '/login?reason=sessions-revoked' }) }
  return <div className="security-stack">{hasPassword ? <form className="account-form" onSubmit={changePassword}><header><ShieldCheck /><div><h2>Change password</h2><p>Changing it immediately revokes every active session.</p></div></header><label>Current password<input name="currentPassword" type="password" autoComplete="current-password" required /></label><div className="account-form__row"><label>New password<input name="newPassword" type="password" autoComplete="new-password" required /></label><label>Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" required /></label></div><small className="password-hint">Use 12+ characters with uppercase, lowercase, number and symbol.</small><button className="gold-button" disabled={Boolean(busy)}>{busy === 'password' ? <LoaderCircle className="spin" /> : <ShieldCheck />}Update password</button></form> : <section className="security-notice"><ShieldCheck /><div><h2>Google sign-in protected</h2><p>This account uses your Google identity. Password changes are managed by Google.</p></div></section>}<section className="security-session"><div><LogOut /><span><h2>Sign out all devices</h2><p>Revoke every browser session, including this one.</p></span></div><button className="danger-button" type="button" disabled={Boolean(busy)} onClick={logoutAll}>{busy === 'logout' ? <LoaderCircle className="spin" /> : <LogOut />}Sign out everywhere</button></section>{message ? <p className="form-status" role="status">{message}</p> : null}</div>
}
