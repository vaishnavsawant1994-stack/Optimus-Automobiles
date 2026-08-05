import { describe, expect, it } from 'vitest'
import { contactSchema, newsletterSchema, sellRequestSchema } from './forms'

describe('customer form validation', () => {
  it('accepts a valid contact enquiry', () => {
    expect(contactSchema.safeParse({ name: 'Aarav Sharma', phone: '9876543210', email: 'aarav@example.com', message: 'Please arrange a showroom consultation.' }).success).toBe(true)
  })

  it('rejects an invalid Indian phone number', () => {
    expect(contactSchema.safeParse({ name: 'Aarav Sharma', phone: '12345', email: 'aarav@example.com', message: 'Please arrange a showroom consultation.' }).success).toBe(false)
  })

  it('validates newsletter email addresses', () => {
    expect(newsletterSchema.safeParse({ email: 'owner@example.com' }).success).toBe(true)
    expect(newsletterSchema.safeParse({ email: 'invalid' }).success).toBe(false)
  })

  it('accepts a complete valuation request', () => {
    expect(sellRequestSchema.safeParse({ name: 'Aarav Sharma', phone: '9876543210', email: 'aarav@example.com', make: 'BMW', model: 'X5', year: '2022', mileage: '22000', city: 'Pune' }).success).toBe(true)
  })
})
