import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { entorno } from '../config'
import * as esquema from './esquema'

export const clienteSql = postgres(entorno.DATABASE_URL, { max: 10, onnotice: () => undefined })

export const db = drizzle(clienteSql, { schema: esquema })

export type BaseDeDatos = typeof db

export async function verificarConexion(): Promise<void> {
  await clienteSql`select 1`
}

export async function cerrarConexion(): Promise<void> {
  await clienteSql.end({ timeout: 5 })
}
