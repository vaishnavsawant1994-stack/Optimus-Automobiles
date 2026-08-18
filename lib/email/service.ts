import 'server-only'
import { businessIdentity } from '@/lib/constants/business'

type EmailMessage = {
  to: string
  subject: string
  html: string
  previewUrl?: string
}

export type EmailResult = { delivered: boolean; preview: boolean; providerId?: string }

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'

function shell(title: string, body: string, action?: { label: string; url: string }) {
  const button = action
    ? `<p style="margin:28px 0"><a href="${action.url}" style="background:#d3a23e;color:#080706;padding:13px 20px;text-decoration:none;font-weight:700;border-radius:4px">${action.label}</a></p>`
    : ''
  return `<div style="background:#070909;color:#f5f1e8;font-family:Arial,sans-serif;padding:32px;line-height:1.6"><div style="max-width:620px;margin:auto"><p style="color:#d3a23e;font-weight:700">OPTIMUM AUTOMOBILES</p><h1 style="font-family:Georgia,serif;font-weight:500">${title}</h1>${body}${button}<p style="color:#8d8981;font-size:12px;margin-top:32px">Optimum Automobiles, Geras Imperium Rise, Pune, Maharashtra 411057</p></div></div>`
}

export async function sendTransactionalEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = `Optimum Automobiles <${businessIdentity.primaryEmail}>`
  if (!apiKey) {
    const previewAllowed = process.env.NODE_ENV !== 'production' || process.env.ALLOW_EMAIL_PREVIEW === 'true'
    if (!previewAllowed) throw new Error('RESEND_API_KEY is required for transactional email in production.')
    console.info('email_preview', { to: message.to, subject: message.subject, previewUrl: message.previewUrl ?? null })
    return { delivered: false, preview: true }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [message.to], subject: message.subject, html: message.html }),
  })
  const payload = await response.json().catch(() => null) as { id?: string; message?: string } | null
  if (!response.ok) throw new Error(payload?.message ?? `Email provider returned ${response.status}.`)
  return { delivered: true, preview: false, providerId: payload?.id }
}

export function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${siteUrl()}/verify-email?token=${encodeURIComponent(token)}`
  return sendTransactionalEmail({
    to,
    subject: 'Verify your Optimum Automobiles account',
    previewUrl: url,
    html: shell('Verify your email', `<p>Hello ${name},</p><p>Confirm your email address to activate your customer account. This link expires in 24 hours.</p>`, { label: 'Verify email', url }),
  })
}

export function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${siteUrl()}/reset-password?token=${encodeURIComponent(token)}`
  return sendTransactionalEmail({
    to,
    subject: 'Reset your Optimum Automobiles password',
    previewUrl: url,
    html: shell('Reset your password', `<p>Hello ${name},</p><p>Use the secure link below to choose a new password. It expires in 30 minutes. Ignore this email if you did not request a reset.</p>`, { label: 'Reset password', url }),
  })
}

export function sendEngagementConfirmation(to: string, name: string, reference: string, kind: 'enquiry' | 'test drive') {
  const url = `${siteUrl()}/account/${kind === 'enquiry' ? 'enquiries' : 'test-drives'}/${reference}`
  return sendTransactionalEmail({
    to,
    subject: `Your Optimum Automobiles ${kind} request ${reference}`,
    previewUrl: url,
    html: shell('Request received', `<p>Hello ${name},</p><p>We received your ${kind} request. Keep this reference for your records: <strong>${reference}</strong>.</p>`, { label: 'Track request', url }),
  })
}

export function sendStaffInvitationEmail(to: string, token: string, role: string) {
  const url = `${siteUrl()}/staff-invitation?token=${encodeURIComponent(token)}`
  return sendTransactionalEmail({
    to,
    subject: 'Your Optimum Automobiles staff invitation',
    previewUrl: url,
    html: shell('Join the staff workspace', `<p>You have been invited to the Optimum Automobiles staff workspace as <strong>${role.replaceAll('_', ' ')}</strong>.</p><p>This single-use invitation expires in 48 hours.</p>`, { label: 'Accept invitation', url }),
  })
}
