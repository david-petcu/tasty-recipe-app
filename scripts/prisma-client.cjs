require('dotenv').config({ quiet: true })

async function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required.')

  const [{ PrismaPg }, { PrismaClient }] = await Promise.all([
    import('@prisma/adapter-pg'),
    import('../app/generated/prisma/client.ts')
  ])

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString })
  })
}

module.exports = { createPrismaClient }
