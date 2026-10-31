import { Hono } from 'hono'
import { configurarApp } from './crear-app.js'
import { db, verificarConexion } from './db/conexion.js'
import { crearRepositorioExpedientes } from './repositorio/expedientes.js'
import { crearRepositorioUsuarios } from './repositorio/usuarios.js'

const app = configurarApp(new Hono(), {
  repositorio: crearRepositorioExpedientes(db),
  usuarios: crearRepositorioUsuarios(db),
  verificarConexion,
})

export default app
