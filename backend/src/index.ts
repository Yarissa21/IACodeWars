import { serve } from '@hono/node-server'
import { crearApp } from './app'
import { entorno } from './config'
import { cerrarConexion, db, verificarConexion } from './db/conexion'
import { crearRepositorioExpedientes } from './repositorio/expedientes'
import { crearRepositorioUsuarios } from './repositorio/usuarios'

const app = crearApp({
  repositorio: crearRepositorioExpedientes(db),
  usuarios: crearRepositorioUsuarios(db),
  verificarConexion,
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
