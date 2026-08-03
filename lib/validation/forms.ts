import { z } from 'zod'

const indianPhone = /^[6-9]\d{9}$/

export const searchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  price: z.string().optional(),
  year: z.string().optional(),
  mileage: z.string().optional(),
})

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.'),
  phone: z
    .string()
    .trim()
    .regex(indianPhone, 'Enter a valid 10 digit Indian phone number.'),
  email: z.string().trim().email('Enter a valid email address.'),
  subject: z.string().trim().max(80, 'Subject is too long.').optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.'),
  company: z.string().max(0, 'Invalid submission.').optional(),
})

export const newsletterSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
})

export const sellRequestSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.'),
  phone: z.string().trim().regex(indianPhone, 'Enter a valid 10 digit Indian phone number.'),
  email: z.string().trim().email('Enter a valid email address.'),
  make: z.string().trim().min(1, 'Select the vehicle brand.'),
  model: z.string().trim().min(1, 'Enter the vehicle model.'),
  year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().int().min(0).max(1000000),
  fuel: z.string().optional(),
  transmission: z.string().optional(),
  city: z.string().trim().min(2, 'Enter your city.'),
  message: z.string().optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type SellRequestInput = z.infer<typeof sellRequestSchema>
