import 'dotenv/config'

import { spawnSync } from 'node:child_process'

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DIRECT_URL or DATABASE_URL is required.')
if (process.env.NODE_ENV === 'production') throw new Error('Development database reset is disabled in production.')

const parsed = new URL(databaseUrl)
const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)
const isDevelopmentDatabase = parsed.pathname.replace(/^\//, '') === 'deccan_wheels'

if (!isLocalHost || !isDevelopmentDatabase) {
  throw new Error('Refusing to reset a database that is not the local deccan_wheels development database.')
}

const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const result = spawnSync(executable, ['prisma', 'migrate', 'reset', '--force'], {
  stdio: 'inherit',
  env: process.env,
})

if (result.status !== 0) process.exitCode = result.status ?? 1

