import type { Hono } from 'hono'
import { manejarError, manejarRutaInexistente } from './http/errores.js'
import { crearRutasAuth } from './http/rutas-auth.js'
import { crearRutasExpedientes } from './http/rutas-expedientes.js'
import { requerirSesion } from './http/sesion.js'
import type { RepositorioExpedientes } from './repositorio/expedientes.js'
import type { RepositorioUsuarios } from './repositorio/usuarios.js'

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
