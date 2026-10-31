import { existsSync } from 'node:fs'
import { z } from 'zod'

if (existsSync('.env')) {
  process.loadEnvFile('.env')
}

const esquemaEntorno = z.object({
  DATABASE_URL: z
    .string({ error: 'Falta la variable DATABASE_URL. Copia .env.example a .env y ajústala.' })
    .trim()
    .min(1, 'La variable DATABASE_URL está vacía.'),
  PORT: z.coerce
    .number({ error: 'La variable PORT debe ser un número.' })
    .int('La variable PORT debe ser un número entero.')
    .min(1, 'La variable PORT debe estar entre 1 y 65535.')
    .max(65535, 'La variable PORT debe estar entre 1 y 65535.')
    .default(3000),
})

const resultado = esquemaEntorno.safeParse(process.env)

if (!resultado.success) {
  const mensajes = resultado.error.issues.map((problema) => problema.message).join(' ')
  throw new Error(`Configuración inválida: ${mensajes}`)
}

export const entorno = resultado.data
