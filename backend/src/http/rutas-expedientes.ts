import { Hono, type Context } from 'hono'
import { ErrorDominio } from '../domain/errores'
import {
  esquemaActividad,
  esquemaApertura,
  esquemaCierre,
  esquemaReapertura,
  validar,
} from '../domain/esquemas'
import { buscarExpedientes, normalizarIdExpediente } from '../domain/expedientes'
import type { RepositorioExpedientes } from '../repositorio/expedientes'

async function leerCuerpo(c: Context): Promise<unknown> {
  try {
    return await c.req.json<unknown>()
  } catch {
    throw new ErrorDominio('validacion', 'El cuerpo de la solicitud debe ser un JSON válido.')
  }
}

function leerCodigo(c: Context): string {
  return normalizarIdExpediente(c.req.param('codigo') ?? '')
}

export function crearRutasExpedientes(repositorio: RepositorioExpedientes) {
  return new Hono()
    .get('/', async (c) => {
      const termino = c.req.query('q') ?? ''
      const resumenes = await repositorio.listar()
      return c.json(buscarExpedientes(resumenes, termino))
    })
    .get('/:codigo', async (c) => {
      return c.json(await repositorio.obtener(leerCodigo(c)))
    })
    .post('/', async (c) => {
      const datos = validar(esquemaApertura, await leerCuerpo(c))
      return c.json(await repositorio.abrir(datos), 201)
    })
    .post('/:codigo/actividades', async (c) => {
      const codigo = leerCodigo(c)
      const datos = validar(esquemaActividad, await leerCuerpo(c))
      return c.json(await repositorio.registrarActividad(codigo, datos), 201)
    })
    .post('/:codigo/seguimiento', async (c) => {
      return c.json(await repositorio.pasarASeguimiento(leerCodigo(c)))
    })
    .post('/:codigo/cierre', async (c) => {
      const codigo = leerCodigo(c)
      const datos = validar(esquemaCierre, await leerCuerpo(c))
      return c.json(await repositorio.cerrar(codigo, datos))
    })
    .post('/:codigo/reapertura', async (c) => {
      const codigo = leerCodigo(c)
      const datos = validar(esquemaReapertura, await leerCuerpo(c))
      return c.json(await repositorio.reabrir(codigo, datos))
    })
}
