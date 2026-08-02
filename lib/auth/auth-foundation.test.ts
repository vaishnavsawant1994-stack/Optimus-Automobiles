import { describe, expect, it } from 'vitest'
import { hashPassword, passwordSchema, verifyPassword } from './password'
import { createOneTimeToken, hashOneTimeToken } from './tokens'
import { indianPhoneSchema, normalizedEmailSchema, safeCallbackUrl, signUpSchema } from './validation'

describe('customer authentication foundation', () => {
  it('hashes passwords with Argon2id and verifies without exposing plaintext', async () => {
    const hash = await hashPassword('DriveLuxury!2026')
    expect(hash).toMatch(/^\$argon2id\$/)
    await expect(verifyPassword(hash, 'DriveLuxury!2026')).resolves.toBe(true)
    await expect(verifyPassword(hash, 'WrongPassword!2026')).resolves.toBe(false)
  })

  it('enforces the approved password policy', () => {
    expect(passwordSchema.safeParse('DriveLuxury!2026').success).toBe(true)
    expect(passwordSchema.safeParse('short').success).toBe(false)
    expect(passwordSchema.safeParse('alllowercase123!').success).toBe(false)
  })

  it('normalizes email and Indian mobile numbers', () => {
    expect(normalizedEmailSchema.parse(' Customer@Example.COM ')).toBe('customer@example.com')
    expect(indianPhoneSchema.parse('+91 98765 43210')).toBe('+919876543210')
    expect(signUpSchema.safeParse({ name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9876543210', password: 'DriveLuxury!2026', termsAccepted: true }).success).toBe(true)
  })

  it('only allows same-origin relative callback paths', () => {
    expect(safeCallbackUrl('/account/enquiries?open=1')).toBe('/account/enquiries?open=1')
    expect(safeCallbackUrl('//evil.example')).toBe('/account')
    expect(safeCallbackUrl('https://evil.example/steal')).toBe('/account')
  })

  it('creates opaque one-time tokens and deterministic hashes', () => {
    const first = createOneTimeToken()
    const second = createOneTimeToken()
    expect(first.token).not.toBe(second.token)
    expect(first.tokenHash).toBe(hashOneTimeToken(first.token))
    expect(first.tokenHash).toHaveLength(64)
  })
})
