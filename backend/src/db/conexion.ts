import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { entorno } from '../config.js'
import * as esquema from './esquema.js'

const enServerless = process.env.VERCEL === '1'

export const clienteSql = postgres(entorno.DATABASE_URL, {
  max: enServerless ? 1 : 10,
  idle_timeout: enServerless ? 20 : 0,
  prepare: false,
  onnotice: () => undefined,
})

export const db = drizzle(clienteSql, { schema: esquema })

export type BaseDeDatos = typeof db

export async function verificarConexion(): Promise<void> {
  await clienteSql`select 1`
}

export async function cerrarConexion(): Promise<void> {
  await clienteSql.end({ timeout: 5 })
}
