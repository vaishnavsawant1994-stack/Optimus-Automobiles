import 'dotenv/config'

import { createScriptPrismaClient } from './script-prisma'

const prisma = createScriptPrismaClient()
const startedAt = performance.now()

try {
  await prisma.$queryRaw`SELECT 1`
  console.log(`PostgreSQL is healthy (${Math.round(performance.now() - startedAt)} ms).`)
} catch (error) {
  console.error('PostgreSQL health check failed.', error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}

