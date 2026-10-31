import type { ErrorHandler, NotFoundHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { ErrorDominio, type TipoErrorDominio } from '../domain/errores.js'

const ESTADOS_HTTP: Record<TipoErrorDominio, ContentfulStatusCode> = {
  validacion: 400,
  no_autenticado: 401,
  no_encontrado: 404,
  regla_negocio: 409,
}

const CODIGOS_SIN_CONEXION = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'CONNECT_TIMEOUT',
  'CONNECTION_CLOSED',
  'CONNECTION_ENDED',
  'CONNECTION_DESTROYED',
  '28P01',
  '3D000',
  '57P01',
])

function obtenerCodigo(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code
  }
  return null
}

function esErrorDeConexion(error: unknown): boolean {
  let actual: unknown = error
  for (let nivel = 0; nivel < 5 && actual; nivel += 1) {
    const codigo = obtenerCodigo(actual)
    if (codigo && CODIGOS_SIN_CONEXION.has(codigo)) {
      return true
    }
    actual = actual instanceof Error ? actual.cause : null
  }
  return false
}

export const manejarError: ErrorHandler = (error, c) => {
  if (error instanceof ErrorDominio) {
    return c.json({ mensaje: error.message }, ESTADOS_HTTP[error.tipo])
  }
  if (error instanceof HTTPException) {
    return c.json({ mensaje: 'La solicitud no se pudo procesar. Revisa los datos enviados.' }, error.status)
  }
  console.error(error)
  if (esErrorDeConexion(error)) {
    return c.json(
      { mensaje: 'No hay conexión con la base de datos. Intenta de nuevo en unos momentos.' },
      503,
    )
  }
  return c.json({ mensaje: 'Ocurrió un error inesperado en el servidor. Intenta de nuevo más tarde.' }, 500)
}

export const manejarRutaInexistente: NotFoundHandler = (c) =>
  c.json({ mensaje: `La ruta ${c.req.method} ${c.req.path} no existe.` }, 404)
