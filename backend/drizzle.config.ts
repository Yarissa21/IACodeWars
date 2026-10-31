import { existsSync } from 'node:fs'
import { defineConfig } from 'drizzle-kit'

if (existsSync('.env')) {
  process.loadEnvFile('.env')
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('Falta la variable DATABASE_URL. Copia .env.example a .env y ajústala.')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/esquema.ts',
  dbCredentials: { url: databaseUrl },
  verbose: true,
})
