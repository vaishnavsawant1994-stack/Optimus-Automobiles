export const inventorySorts = [
  'latest',
  'price-asc',
  'price-desc',
  'year-desc',
  'year-asc',
  'mileage-asc',
  'popular',
] as const

export type InventorySort = (typeof inventorySorts)[number]

export type InventoryFilters = {
  brand?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  fromYear?: number
  toYear?: number
  minMileage?: number
  maxMileage?: number
  bodyType?: string
  fuelType?: string
  transmission?: string
  ownership?: number
  certified?: boolean
  newArrival?: boolean
  status?: 'AVAILABLE' | 'RESERVED' | 'SOLD'
  search?: string
  page: number
  pageSize: 12 | 24 | 48
  sort: InventorySort
}

export type InventoryPagination = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type VehicleCardData = {
  id: string
  slug: string
  make: string
  brandSlug: string
  model: string
  variant: string
  year: number
  mileage: string
  mileageValue: number
  fuel: string
  transmission: string
  price: string
  priceValue: number
  image: string
  imageAlt: string
  badge: string
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD'
  certified: boolean
  newArrival: boolean
  bodyType: string
  bodyTypeSlug: string
}

export type VehicleImageData = {
  id: string
  url: string
  thumbnailUrl: string
  altText: string
  category: string
}

export type VehicleFeatureGroup = {
  category: string
  items: Array<{ name: string; value?: string }>
}

export type VehicleDetailData = VehicleCardData & {
  stockNumber: string
  shortTitle: string
  shortDescription: string
  description: string
  originalPrice?: string
  location: string
  images: VehicleImageData[]
  featureGroups: VehicleFeatureGroup[]
  specifications: Array<{ label: string; value: string }>
  viewCount: number
  favoriteCount: number
  publishedAt?: string
}

export type BrandSummary = {
  id: string
  name: string
  slug: string
  logoUrl: string
  logoAlt: string
  description: string
  country: string
  vehicleCount: number
  accent: string
}

export type BodyTypeSummary = {
  id: string
  name: string
  slug: string
  description: string
  icon?: string
  imageUrl?: string
  vehicleCount: number
}

export type AvailableInventoryFilters = {
  brands: BrandSummary[]
  bodyTypes: BodyTypeSummary[]
  models: string[]
  fuelTypes: string[]
  transmissions: string[]
  yearRange: { min: number; max: number }
  priceRange: { min: number; max: number }
  mileageRange: { min: number; max: number }
}

export type InventoryResult = {
  items: VehicleCardData[]
  pagination: InventoryPagination
  appliedFilters: InventoryFilters
  availableFilters: AvailableInventoryFilters
}

export type SearchSuggestion = {
  id: string
  title: string
  subtitle: string
  image: string
  year: number
  price: string
  status: string
  href: string
}
