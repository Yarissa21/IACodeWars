import { Hono } from 'hono'
import { configurarApp } from './crear-app'
import { db, verificarConexion } from './db/conexion'
import { crearRepositorioExpedientes } from './repositorio/expedientes'
import { crearRepositorioUsuarios } from './repositorio/usuarios'

const app = configurarApp(new Hono(), {
  repositorio: crearRepositorioExpedientes(db),
  usuarios: crearRepositorioUsuarios(db),
  verificarConexion,
})

export default app
