import { createHash, randomBytes } from 'node:crypto'

export function createOneTimeToken() {
  const token = randomBytes(32).toString('base64url')
  return { token, tokenHash: hashOneTimeToken(token) }
}

export function hashOneTimeToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function expiresInMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60_000)
}
