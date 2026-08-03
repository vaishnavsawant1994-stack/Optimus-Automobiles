import 'server-only'

import { LocalImageStorage } from './local-storage'
import { S3ImageStorage } from './s3-storage'

export function getImageStorage() {
  const driver = process.env.IMAGE_STORAGE_DRIVER ?? (process.env.NODE_ENV === 'production' ? '' : 'local')
  if (driver === 's3') return new S3ImageStorage()
  const localPreviewAllowed = process.env.NODE_ENV !== 'production' || process.env.ALLOW_LOCAL_IMAGE_STORAGE === 'true'
  if (driver === 'local' && localPreviewAllowed) return new LocalImageStorage()
  throw new Error('Image storage is not configured. Set IMAGE_STORAGE_DRIVER=s3 with explicit S3_* settings in production.')
}

export type { ImageStorageAdapter, StoredImage } from './types'
