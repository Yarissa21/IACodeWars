import { Hono } from 'hono'
import { esquemaIngreso, esquemaRegistro } from '../domain/usuarios'
import { validar } from '../domain/esquemas'
import type { RepositorioUsuarios } from '../repositorio/usuarios'
import { leerCuerpo } from './cuerpo'
import { borrarCookieSesion, guardarCookieSesion, leerTokenSesion, requerirSesion } from './sesion'

export function crearRutasAuth(repositorio: RepositorioUsuarios) {
  return new Hono()
    .post('/registro', async (c) => {
      const datos = validar(esquemaRegistro, await leerCuerpo(c))
      const sesion = await repositorio.registrar(datos)
      guardarCookieSesion(c, sesion.token)
      return c.json({ usuario: sesion.usuario }, 201)
    })
    .post('/ingreso', async (c) => {
      const datos = validar(esquemaIngreso, await leerCuerpo(c))
      const sesion = await repositorio.ingresar(datos)
      guardarCookieSesion(c, sesion.token)
      return c.json({ usuario: sesion.usuario })
    })
    .post('/salida', async (c) => {
      const token = leerTokenSesion(c)
      if (token) {
        await repositorio.cerrarSesion(token)
      }
      borrarCookieSesion(c)
      return c.json({ mensaje: 'Sesión cerrada.' })
    })
    .get('/sesion', requerirSesion(repositorio), (c) => {
      return c.json({ usuario: c.get('usuario') })
    })
}
