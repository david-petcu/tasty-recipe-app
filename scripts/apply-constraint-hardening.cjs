require('dotenv').config()

const fs = require('node:fs')
const path = require('node:path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const migrationName = process.argv[2] || '20260827235500_harden_constraints_and_indexes'
if (!/^\d{14}_[a-z0-9_]+$/.test(migrationName)) {
  throw new Error('Invalid migration directory name.')
}
const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', migrationName, 'migration.sql')

async function main() {
  const sql = fs.readFileSync(migrationPath, 'utf8')
  await prisma.$executeRawUnsafe(sql)
  console.log(`Migration ${migrationName} applied successfully.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
