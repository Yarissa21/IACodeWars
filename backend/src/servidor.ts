import { serve } from '@hono/node-server'
import { entorno } from './config'
import { cerrarConexion, verificarConexion } from './db/conexion'
import app from './index'

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
