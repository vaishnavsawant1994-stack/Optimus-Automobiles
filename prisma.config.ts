import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const datasourceUrl = [
  process.env.DIRECT_URL,
  process.env.DATABASE_URL_UNPOOLED,
  process.env.DATABASE_URL,
].find((value) => /^postgres(?:ql)?:\/\//.test(value ?? ''))

if (!datasourceUrl) {
  throw new Error('A valid PostgreSQL connection URL is required.')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: datasourceUrl,
  },
})
