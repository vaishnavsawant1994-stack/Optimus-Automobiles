import { createHash } from 'node:crypto'
import sharp from 'sharp'

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const extensions: Record<string, string[]> = { 'image/jpeg': ['jpg', 'jpeg'], 'image/png': ['png'], 'image/webp': ['webp'], 'image/avif': ['avif'] }

function matchesSignature(buffer: Buffer, type: string): boolean {
  if (type === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  if (type === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  if (type === 'image/webp') return buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP'
  if (type === 'image/avif') return buffer.subarray(4, 12).toString().includes('ftyp') && buffer.subarray(8, 24).toString().includes('avif')
  return false
}

export async function validatePublicImage(file: File) {
  if (!allowed.has(file.type)) throw new Error('UNSUPPORTED_IMAGE_TYPE')
  if (file.size <= 0 || file.size > 12 * 1024 * 1024) throw new Error('IMAGE_SIZE_INVALID')
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!extensions[file.type]?.includes(extension)) throw new Error('IMAGE_EXTENSION_MISMATCH')
  const buffer = Buffer.from(await file.arrayBuffer())
  if (!matchesSignature(buffer, file.type)) throw new Error('IMAGE_SIGNATURE_MISMATCH')
  const metadata = await sharp(buffer).metadata()
  if (!metadata.width || !metadata.height || metadata.width < 640 || metadata.height < 400 || metadata.width > 12000 || metadata.height > 12000) throw new Error('IMAGE_DIMENSIONS_INVALID')
  return { buffer, width: metadata.width, height: metadata.height, checksum: createHash('sha256').update(buffer).digest('hex') }
}
