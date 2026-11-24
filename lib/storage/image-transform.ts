import sharp from 'sharp'

/**
 * Scale an image down to fit within the target bounds without cropping
 * any part of the vehicle or enlarging small source photos.
 */
export function createVehicleVariant(buffer: Buffer, width: number, height: number, quality: number): Promise<Buffer> {
  return sharp(buffer)
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer()
}
