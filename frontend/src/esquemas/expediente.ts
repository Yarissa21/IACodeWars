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
