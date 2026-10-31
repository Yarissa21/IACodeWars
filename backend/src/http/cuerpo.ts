import type { Context } from 'hono'
import { ErrorDominio } from '../domain/errores.js'

export async function leerCuerpo(c: Context): Promise<unknown> {
  try {
    return await c.req.json<unknown>()
  } catch {
    throw new ErrorDominio('validacion', 'El cuerpo de la solicitud debe ser un JSON válido.')
  }
}
