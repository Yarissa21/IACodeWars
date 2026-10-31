import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { entorno } from './config'
import { cerrarConexion, verificarConexion } from './db/conexion'

const app = new Hono()

app.get('/api/salud', async (c) => {
  await verificarConexion()
  return c.json({ estado: 'ok', baseDeDatos: 'conectada' })
})

try {
  await verificarConexion()
  console.log('Conexión con PostgreSQL establecida.')
} catch (error) {
  const detalle = error instanceof Error ? error.message : String(error)
  console.error(`No se pudo conectar con PostgreSQL: ${detalle}`)
  process.exit(1)
}

const servidor = serve({ fetch: app.fetch, port: entorno.PORT }, (info) => {
  console.log(`API escuchando en http://localhost:${info.port}`)
})

async function apagar(): Promise<void> {
  servidor.close()
  await cerrarConexion()
  process.exit(0)
}

process.on('SIGINT', () => {
  void apagar()
})

process.on('SIGTERM', () => {
  void apagar()
})
