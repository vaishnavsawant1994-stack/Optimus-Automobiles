import { z } from 'zod'

const phone = z.string().trim().regex(/^\+?[0-9 ]{10,15}$/, 'Enter a valid phone number.')
const consent = z.union([z.boolean(), z.literal('true'), z.literal('on')]).transform((value) => value === true || value === 'true' || value === 'on')

export const inquirySchema = z.object({
  vehicleId: z.string().cuid(),
  name: z.string().trim().min(2).max(80),
  phone,
  email: z.email().max(160),
  message: z.string().trim().min(5).max(1000),
  consent: consent.refine(Boolean, 'Consent is required.'),
})

export const testDriveSchema = z.object({
  vehicleId: z.string().cuid(),
  name: z.string().trim().min(2).max(80),
  phone,
  email: z.email().max(160),
  preferredDate: z.coerce.date().refine((date) => date >= new Date(new Date().toDateString()), 'Choose a future date.'),
  preferredTime: z.string().trim().min(3).max(60),
  message: z.string().trim().max(1000).optional().catch(undefined),
  consent: consent.refine(Boolean, 'Consent is required.'),
})
