import { describe, expect, it } from 'vitest'
import { buildVehicleWhatsAppUrl, buildWhatsAppUrl, businessIdentity } from './business'

describe('business contact links', () => {
  it('uses the verified Optimum Automobiles WhatsApp number and default message', () => {
    const url = new URL(buildWhatsAppUrl())
    expect(`${url.host}${url.pathname}`).toBe(`wa.me/${businessIdentity.whatsappNumber}`)
    expect(url.searchParams.get('text')).toBe(businessIdentity.whatsappMessage)
  })

  it('normalizes a formatted WhatsApp number', () => {
    expect(buildWhatsAppUrl('Hello', '+91 93737 78780')).toBe('https://wa.me/919373778780?text=Hello')
  })

  it('builds a vehicle-specific enquiry message', () => {
    const url = new URL(buildVehicleWhatsAppUrl({ year: 2023, make: 'Hyundai', model: 'Creta', variant: 'SX', stockNumber: 'OA-123' }))
    expect(url.searchParams.get('text')).toBe('Hello, I saw the 2023 Hyundai Creta SX (Stock OA-123) on your website and I would like more information.')
  })
})
