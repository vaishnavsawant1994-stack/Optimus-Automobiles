import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { createVehicleVariant } from './image-transform'
import { validatePublicImage } from './image-validation'

function jpegFile(buffer: Buffer) {
  return new File([Uint8Array.from(buffer)], 'WhatsApp Image_resized.jpeg', { type: 'image/jpeg' })
}

describe('public vehicle image uploads', () => {
  it('accepts a 533 × 400 resized JPEG like the reported photo', async () => {
    const buffer = await sharp({ create: { width: 533, height: 400, channels: 3, background: '#f2f2f2' } }).jpeg().toBuffer()
    const result = await validatePublicImage(jpegFile(buffer))
    expect(result).toMatchObject({ width: 533, height: 400 })
  })

  it('rejects photos below the minimum 480 × 320 dimensions', async () => {
    const buffer = await sharp({ create: { width: 479, height: 400, channels: 3, background: '#f2f2f2' } }).jpeg().toBuffer()
    await expect(validatePublicImage(jpegFile(buffer))).rejects.toThrow('IMAGE_DIMENSIONS_INVALID')
  })

  it('generates smaller display images without cropping or enlarging the original', async () => {
    const buffer = await sharp({ create: { width: 533, height: 400, channels: 3, background: '#f2f2f2' } }).jpeg().toBuffer()
    const card = await sharp(await createVehicleVariant(buffer, 720, 480, 84)).metadata()
    const thumbnail = await sharp(await createVehicleVariant(buffer, 320, 220, 78)).metadata()
    expect(card.width).toBeLessThanOrEqual(533)
    expect(card.height).toBeLessThanOrEqual(400)
    expect(card.width! / card.height!).toBeCloseTo(533 / 400, 2)
    expect(thumbnail.width).toBeLessThanOrEqual(320)
    expect(thumbnail.height).toBeLessThanOrEqual(220)
    expect(thumbnail.width! / thumbnail.height!).toBeCloseTo(533 / 400, 2)
  })
})
