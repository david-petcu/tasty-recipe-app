const fs = require('node:fs')
const path = require('node:path')
const { createPrismaClient } = require('./prisma-client.cjs')

let prisma
const migrationName = process.argv[2] || '20260827235500_harden_constraints_and_indexes'
if (!/^\d{14}_[a-z0-9_]+$/.test(migrationName)) {
  throw new Error('Invalid migration directory name.')
}
const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', migrationName, 'migration.sql')

async function main() {
  prisma = await createPrismaClient()
  const sql = fs.readFileSync(migrationPath, 'utf8')
  await prisma.$executeRawUnsafe(sql)
  console.log(`Migration ${migrationName} applied successfully.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma?.$disconnect())
