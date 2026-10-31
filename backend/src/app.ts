import { Hono } from 'hono'
import { manejarError, manejarRutaInexistente } from './http/errores'
import { crearRutasExpedientes } from './http/rutas-expedientes'
import type { RepositorioExpedientes } from './repositorio/expedientes'

export interface DependenciasApp {
  repositorio: RepositorioExpedientes
  verificarConexion: () => Promise<void>
}

export function crearApp({ repositorio, verificarConexion }: DependenciasApp) {
  const app = new Hono()

  app.get('/api/salud', async (c) => {
    await verificarConexion()
    return c.json({ estado: 'ok', baseDeDatos: 'conectada' })
  })

  app.route('/api/expedientes', crearRutasExpedientes(repositorio))

  app.onError(manejarError)
  app.notFound(manejarRutaInexistente)

  return app
}
