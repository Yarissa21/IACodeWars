import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { ErrorDominio } from '../domain/errores'
import type { UsuarioSesion } from '../domain/usuarios'
import { DURACION_SESION_MS, type RepositorioUsuarios } from '../repositorio/usuarios'

export const NOMBRE_COOKIE_SESION = 'bufete_sesion'

export interface EntornoAutenticado {
  Variables: {
    usuario: UsuarioSesion
  }
}

export function guardarCookieSesion(c: Context, token: string): void {
  setCookie(c, NOMBRE_COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: Math.floor(DURACION_SESION_MS / 1000),
    secure: process.env.NODE_ENV === 'production',
  })
}

export function borrarCookieSesion(c: Context): void {
  deleteCookie(c, NOMBRE_COOKIE_SESION, { path: '/' })
}

export function leerTokenSesion(c: Context): string | null {
  const token = getCookie(c, NOMBRE_COOKIE_SESION)
  return token && token.length > 0 ? token : null
}

export function requerirSesion(repositorio: RepositorioUsuarios) {
  return createMiddleware<EntornoAutenticado>(async (c, siguiente) => {
    const token = leerTokenSesion(c)
    const usuario = token ? await repositorio.buscarSesion(token) : null
    if (!usuario) {
      if (token) {
        borrarCookieSesion(c)
      }
      throw new ErrorDominio(
        'no_autenticado',
        'Tu sesión expiró o no has iniciado sesión. Ingresa de nuevo para continuar.',
      )
    }
    c.set('usuario', usuario)
    await siguiente()
  })
}
