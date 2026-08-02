export function formatInr(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatMileage(value: number) {
  return `${new Intl.NumberFormat('en-IN').format(value)} km`
}

export function toUrlSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(value)
}
