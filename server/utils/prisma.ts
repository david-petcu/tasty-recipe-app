import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '~~/app/generated/prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to connect to PostgreSQL.')
}

const prismaGlobal = globalThis as unknown as { prisma?: PrismaClient }
const adapter = new PrismaPg({ connectionString })
const prisma = prismaGlobal.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.prisma = prisma
}

export default prisma
