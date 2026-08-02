import { z } from 'zod'
import { passwordSchema } from './password'

export const normalizedEmailSchema = z.string().trim().pipe(z.email('Enter a valid email address.').max(160)).transform((email) => email.toLowerCase())

export const indianPhoneSchema = z.string().trim().transform((value, context) => {
  const digits = value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '')
  if (!/^[6-9]\d{9}$/.test(digits)) {
    context.addIssue({ code: 'custom', message: 'Enter a valid 10-digit Indian mobile number.' })
    return z.NEVER
  }
  return `+91${digits}`
})

export const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(80),
  email: normalizedEmailSchema,
  phone: indianPhoneSchema,
  password: passwordSchema,
  termsAccepted: z.literal(true, 'Accept the terms to continue.'),
  marketingConsent: z.boolean().optional().default(false),
})

export const credentialsSchema = z.object({
  email: normalizedEmailSchema,
  password: z.string().min(1).max(128),
})

export function safeCallbackUrl(value: string | null | undefined, fallback = '/account') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  try {
    const parsed = new URL(value, 'http://local.test')
    return parsed.origin === 'http://local.test' ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback
  } catch {
    return fallback
  }
}
