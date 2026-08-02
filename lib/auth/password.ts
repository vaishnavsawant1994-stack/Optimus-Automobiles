import { hash, verify } from '@node-rs/argon2'
import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(12, 'Use at least 12 characters.')
  .max(128, 'Password is too long.')
  .regex(/[a-z]/, 'Add a lowercase letter.')
  .regex(/[A-Z]/, 'Add an uppercase letter.')
  .regex(/[0-9]/, 'Add a number.')
  .regex(/[^A-Za-z0-9]/, 'Add a symbol.')

const argonOptions = {
  algorithm: 2,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const

export function hashPassword(password: string) {
  return hash(password, argonOptions)
}

export function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password)
}
