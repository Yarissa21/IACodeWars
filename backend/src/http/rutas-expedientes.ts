import { Hono, type Context } from 'hono'
import {
  esquemaActividad,
  esquemaApertura,
  esquemaCierre,
  esquemaReapertura,
  validar,
} from '../domain/esquemas'
import { buscarExpedientes, normalizarIdExpediente } from '../domain/expedientes'
import type { RepositorioExpedientes } from '../repositorio/expedientes'
import { leerCuerpo } from './cuerpo'
import type { EntornoAutenticado } from './sesion'

function leerCodigo(c: Context): string {
  return normalizarIdExpediente(c.req.param('codigo') ?? '')
}

export function crearRutasExpedientes(repositorio: RepositorioExpedientes) {
  return new Hono<EntornoAutenticado>()
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
      return c.json(await repositorio.abrir(datos, c.get('usuario').nombre), 201)
    })
    .post('/:codigo/actividades', async (c) => {
      const codigo = leerCodigo(c)
      const datos = validar(esquemaActividad, await leerCuerpo(c))
      return c.json(await repositorio.registrarActividad(codigo, datos, c.get('usuario').nombre), 201)
    })
    .post('/:codigo/seguimiento', async (c) => {
      return c.json(await repositorio.pasarASeguimiento(leerCodigo(c), c.get('usuario').nombre))
    })
    .post('/:codigo/cierre', async (c) => {
      const codigo = leerCodigo(c)
      const datos = validar(esquemaCierre, await leerCuerpo(c))
      return c.json(await repositorio.cerrar(codigo, datos, c.get('usuario').nombre))
    })
    .post('/:codigo/reapertura', async (c) => {
      const codigo = leerCodigo(c)
      const datos = validar(esquemaReapertura, await leerCuerpo(c))
      return c.json(await repositorio.reabrir(codigo, datos, c.get('usuario').nombre))
    })
}
