import type { Hono } from 'hono'
import { manejarError, manejarRutaInexistente } from './http/errores'
import { crearRutasAuth } from './http/rutas-auth'
import { crearRutasExpedientes } from './http/rutas-expedientes'
import { requerirSesion } from './http/sesion'
import type { RepositorioExpedientes } from './repositorio/expedientes'
import type { RepositorioUsuarios } from './repositorio/usuarios'

export interface DependenciasApp {
  repositorio: RepositorioExpedientes
  usuarios: RepositorioUsuarios
  verificarConexion: () => Promise<void>
}

export function configurarApp(app: Hono, { repositorio, usuarios, verificarConexion }: DependenciasApp): Hono {
  app.get('/api/salud', async (c) => {
    await verificarConexion()
    return c.json({ estado: 'ok', baseDeDatos: 'conectada' })
  })

  app.route('/api/auth', crearRutasAuth(usuarios))

  app.use('/api/expedientes', requerirSesion(usuarios))
  app.use('/api/expedientes/*', requerirSesion(usuarios))
  app.route('/api/expedientes', crearRutasExpedientes(repositorio))

  app.onError(manejarError)
  app.notFound(manejarRutaInexistente)

  return app
}
