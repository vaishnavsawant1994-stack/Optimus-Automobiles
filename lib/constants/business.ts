type BusinessIdentity = {
  name: string
  displayName: string
  tagline: string
  phone: string
  phoneNumber: string
  primaryEmail: string
  secondaryEmail: string
  whatsappNumber: string
  whatsappMessage: string
  logoUrl: string
}

export const businessIdentity: BusinessIdentity = {
  name: 'Optimum Automobiles',
  displayName: 'OPTIMUM AUTOMOBILES',
  tagline: 'Premium pre-loved cars',
  phone: '+91 93737 78780',
  phoneNumber: '+919373778780',
  primaryEmail: 'admin@optimumautomobiles.com',
  secondaryEmail: 'adminoptimumautomobiles@gmail.com',
  whatsappNumber: '919373778780',
  whatsappMessage: 'Hello, I saw a car on your website and I would like more information.',
  logoUrl: '/images/brand/optimum-automobiles-logo.png',
}

export function buildWhatsAppUrl(message: string = businessIdentity.whatsappMessage, number: string = businessIdentity.whatsappNumber) {
  const normalizedNumber = number.replace(/\D/g, '') || businessIdentity.whatsappNumber
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`
}

export function buildVehicleWhatsAppUrl(vehicle: { year: number; make: string; model: string; variant?: string; stockNumber?: string }) {
  const description = [vehicle.year, vehicle.make, vehicle.model, vehicle.variant].filter(Boolean).join(' ')
  const stock = vehicle.stockNumber ? ` (Stock ${vehicle.stockNumber})` : ''
  return buildWhatsAppUrl(`Hello, I saw the ${description}${stock} on your website and I would like more information.`)
}
