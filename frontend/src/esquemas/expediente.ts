import { z } from 'zod'

function textoObligatorio(mensajeVacio: string, nombreCampo: string, maximo: number) {
  return z
    .string({ error: mensajeVacio })
    .trim()
    .min(1, mensajeVacio)
    .max(maximo, `${nombreCampo} no puede tener más de ${maximo} caracteres.`)
}

export const esquemaApertura = z.object({
  solicitante: textoObligatorio(
    'Escribe el nombre o alias del solicitante; no puede quedar vacío ni con solo espacios.',
    'El solicitante',
    120,
  ),
  descripcion: textoObligatorio(
    'Escribe una descripción breve del caso; no puede quedar vacía ni con solo espacios.',
    'La descripción',
    500,
  ),
  responsable: textoObligatorio(
    'Indica quién atiende el expediente; no puede quedar vacío ni con solo espacios.',
    'El responsable',
    120,
  ),
  categoria: z
    .enum(['', 'civil', 'familiar', 'laboral'], {
      error: 'Elige una categoría válida o deja "Sin categoría".',
    })
    .transform((valor) => (valor === '' ? null : valor)),
})

export type FormularioApertura = z.input<typeof esquemaApertura>

export type DatosFormularioApertura = z.output<typeof esquemaApertura>

export const esquemaActividad = z.object({
  descripcion: textoObligatorio(
    'Describe la actividad realizada; no puede quedar vacía ni con solo espacios.',
    'La descripción de la actividad',
    1000,
  ),
  tipo: z
    .string()
    .trim()
    .max(60, 'El tipo de actividad no puede tener más de 60 caracteres.')
    .transform((valor) => (valor === '' ? null : valor)),
})

export type FormularioActividad = z.input<typeof esquemaActividad>

export type DatosFormularioActividad = z.output<typeof esquemaActividad>

export function esquemaMotivo(mensajeVacio: string, nombreCampo: string) {
  return z.object({ motivo: textoObligatorio(mensajeVacio, nombreCampo, 500) })
}

export const esquemaCierre = esquemaMotivo(
  'Falta el motivo de cierre: explica por qué se cierra; no puede quedar vacío ni con solo espacios.',
  'El motivo de cierre',
)

export const esquemaReapertura = esquemaMotivo(
  'Falta el motivo de reapertura: explica por qué se reabre; no puede quedar vacío ni con solo espacios.',
  'El motivo de reapertura',
)

export type FormularioMotivo = z.input<typeof esquemaCierre>

export type DatosFormularioMotivo = z.output<typeof esquemaCierre>
