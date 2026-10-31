import { z } from 'zod'

export interface UsuarioSesion {
  id: number
  nombre: string
}

const mensajeObjeto = 'Los datos enviados deben ser un objeto JSON.'

const nombre = z
  .string({ error: 'El nombre es obligatorio.' })
  .trim()
  .min(1, 'El nombre es obligatorio: no puede quedar vacío ni con solo espacios.')
  .transform((valor) => valor.replace(/\s+/g, ' '))

export const esquemaRegistro = z.object(
  {
    nombre: nombre
      .refine((valor) => valor.length >= 3, 'El nombre debe tener al menos 3 caracteres.')
      .refine((valor) => valor.length <= 60, 'El nombre no puede tener más de 60 caracteres.'),
    contrasena: z
      .string({ error: 'La contraseña es obligatoria.' })
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .max(100, 'La contraseña no puede tener más de 100 caracteres.')
      .refine((valor) => valor.trim() !== '', 'La contraseña no puede tener solo espacios.'),
  },
  { error: mensajeObjeto },
)

export const esquemaIngreso = z.object(
  {
    nombre,
    contrasena: z
      .string({ error: 'La contraseña es obligatoria.' })
      .min(1, 'La contraseña es obligatoria.'),
  },
  { error: mensajeObjeto },
)

export type DatosRegistro = z.output<typeof esquemaRegistro>

export type DatosIngreso = z.output<typeof esquemaIngreso>

export function normalizarNombreUsuario(nombreUsuario: string): string {
  return nombreUsuario.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
}
