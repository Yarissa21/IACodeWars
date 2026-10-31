import { z } from 'zod'

const nombre = z
  .string()
  .trim()
  .min(1, 'Escribe tu nombre; no puede quedar vacío ni con solo espacios.')
  .transform((valor) => valor.replace(/\s+/g, ' '))

export const esquemaIngreso = z.object({
  nombre,
  contrasena: z.string().min(1, 'Escribe tu contraseña.'),
})

export const esquemaRegistro = z
  .object({
    nombre: nombre
      .refine((valor) => valor.length >= 3, 'El nombre debe tener al menos 3 caracteres.')
      .refine((valor) => valor.length <= 60, 'El nombre no puede tener más de 60 caracteres.'),
    contrasena: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .max(100, 'La contraseña no puede tener más de 100 caracteres.')
      .refine((valor) => valor.trim() !== '', 'La contraseña no puede tener solo espacios.'),
    confirmacion: z.string().min(1, 'Repite la contraseña.'),
  })
  .refine((datos) => datos.contrasena === datos.confirmacion, {
    path: ['confirmacion'],
    message: 'Las contraseñas no coinciden.',
  })

export type FormularioIngreso = z.input<typeof esquemaIngreso>

export type DatosFormularioIngreso = z.output<typeof esquemaIngreso>

export type FormularioRegistro = z.input<typeof esquemaRegistro>

export type DatosFormularioRegistro = z.output<typeof esquemaRegistro>
