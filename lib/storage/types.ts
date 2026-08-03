export type ImageVariant = 'thumbnail' | 'card' | 'gallery' | 'openGraph'

export type StoredImage = {
  storageKey: string
  publicUrl: string
  variants: Partial<Record<ImageVariant, string>>
  width: number
  height: number
  sizeBytes: number
  mimeType: string
  checksum: string
}

export interface ImageStorageAdapter {
  createUploadUrl(input: { vehicleId: string; filename: string; contentType: string }): Promise<{ uploadUrl: string; storageKey: string; method: 'POST' | 'PUT' }>
  completeUpload(input: { vehicleId: string; storageKey: string; buffer?: Buffer; contentType: string }): Promise<StoredImage>
  deleteObject(storageKey: string): Promise<void>
  getPublicUrl(storageKey: string): string
  generateVariants(input: { storageKey: string; buffer: Buffer }): Promise<StoredImage['variants']>
  validateOwnership(vehicleId: string, storageKey: string): boolean
}
