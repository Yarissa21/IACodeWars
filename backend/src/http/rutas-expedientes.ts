import { Hono, type Context } from 'hono'
import { ErrorDominio } from '../domain/errores'
import { esquemaActividad, esquemaApertura, esquemaCierre, validar } from '../domain/esquemas'
import { buscarExpedientes, normalizarIdExpediente } from '../domain/expedientes'
import type { RepositorioExpedientes } from '../repositorio/expedientes'

async function leerCuerpo(c: Context): Promise<unknown> {
  try {
    return await c.req.json<unknown>()
  } catch {
    throw new ErrorDominio('validacion', 'El cuerpo de la solicitud debe ser un JSON válido.')
  }
}

function leerId(c: Context): string {
  return normalizarIdExpediente(c.req.param('id') ?? '')
}

export function crearRutasExpedientes(repositorio: RepositorioExpedientes) {
  return new Hono()
    .get('/', async (c) => {
      const termino = c.req.query('q') ?? ''
      const resumenes = await repositorio.listar()
      return c.json(buscarExpedientes(resumenes, termino))
    })
    .get('/:id', async (c) => {
      return c.json(await repositorio.obtener(leerId(c)))
    })
    .post('/', async (c) => {
      const datos = validar(esquemaApertura, await leerCuerpo(c))
      return c.json(await repositorio.abrir(datos), 201)
    })
    .post('/:id/actividades', async (c) => {
      const id = leerId(c)
      const datos = validar(esquemaActividad, await leerCuerpo(c))
      return c.json(await repositorio.registrarActividad(id, datos), 201)
    })
    .post('/:id/seguimiento', async (c) => {
      return c.json(await repositorio.pasarASeguimiento(leerId(c)))
    })
    .post('/:id/cierre', async (c) => {
      const id = leerId(c)
      const datos = validar(esquemaCierre, await leerCuerpo(c))
      return c.json(await repositorio.cerrar(id, datos))
    })
}
