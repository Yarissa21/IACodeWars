import { z } from 'zod'
import { ErrorDominio } from './errores'
import { CATEGORIAS } from './tipos'

function textoObligatorio(mensajeVacio: string, nombreCampo: string, maximo: number) {
  return z
    .string({ error: mensajeVacio })
    .trim()
    .min(1, mensajeVacio)
    .max(maximo, `${nombreCampo} no puede tener más de ${maximo} caracteres.`)
}

function textoOpcional(nombreCampo: string, maximo: number) {
  return z
    .string({ error: `${nombreCampo} debe ser texto.` })
    .trim()
    .max(maximo, `${nombreCampo} no puede tener más de ${maximo} caracteres.`)
    .nullish()
    .transform((valor) => (valor ? valor : null))
}

const categoria = z
  .preprocess(
    (valor) => {
      if (typeof valor !== 'string') {
        return valor
      }
      const limpio = valor.trim().toLowerCase()
      return limpio === '' ? null : limpio
    },
    z.enum(CATEGORIAS, { error: 'La categoría debe ser civil, familiar o laboral.' }).nullish(),
  )
  .transform((valor) => valor ?? null)

const mensajeObjeto = 'Los datos enviados deben ser un objeto JSON.'

export const esquemaApertura = z.object(
  {
    solicitante: textoObligatorio(
      'El solicitante es obligatorio: escribe su nombre o alias.',
      'El solicitante',
      120,
    ),
    descripcion: textoObligatorio(
      'La descripción es obligatoria: resume brevemente el caso.',
      'La descripción',
      500,
    ),
    responsable: textoObligatorio(
      'El responsable es obligatorio: indica quién atiende el expediente.',
      'El responsable',
      120,
    ),
    categoria,
  },
  { error: mensajeObjeto },
)

export const esquemaActividad = z.object(
  {
    descripcion: textoObligatorio(
      'La descripción de la actividad es obligatoria: explica qué se hizo.',
      'La descripción de la actividad',
      1000,
    ),
    tipo: textoOpcional('El tipo de actividad', 60),
  },
  { error: mensajeObjeto },
)

export const esquemaCierre = z.object(
  {
    motivo: textoObligatorio(
      'El motivo de cierre es obligatorio: explica por qué se cierra el expediente.',
      'El motivo de cierre',
      500,
    ),
  },
  { error: mensajeObjeto },
)

export const esquemaReapertura = z.object(
  {
    motivo: textoObligatorio(
      'El motivo de reapertura es obligatorio: explica por qué se reabre el expediente.',
      'El motivo de reapertura',
      500,
    ),
  },
  { error: mensajeObjeto },
)

export type DatosApertura = z.output<typeof esquemaApertura>

export type DatosActividad = z.output<typeof esquemaActividad>

export type DatosCierre = z.output<typeof esquemaCierre>

export type DatosReapertura = z.output<typeof esquemaReapertura>

export function validar<T extends z.ZodType>(esquema: T, datos: unknown): z.output<T> {
  const resultado = esquema.safeParse(datos)
  if (!resultado.success) {
    const mensajes = [...new Set(resultado.error.issues.map((problema) => problema.message))]
    throw new ErrorDominio('validacion', mensajes.join(' '))
  }
  return resultado.data
}
