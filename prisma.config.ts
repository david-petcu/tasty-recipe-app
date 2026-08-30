import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const migrationUrl = process.env.DIRECT_URL
  || process.env.DATABASE_URL
  || 'postgresql://user:password@localhost:5432/tasty'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    // Supabase migrations prefer the direct connection. The local placeholder
    // lets dependency installation and Docker builds generate the client
    // without embedding a real credential or opening a database connection.
    url: migrationUrl
  }
})
