import { and, eq, gt, lte } from 'drizzle-orm'
import { generarHashContrasena, generarTokenSesion, hashToken, verificarContrasena } from '../auth/seguridad'
import type { BaseDeDatos } from '../db/conexion'
import { sesiones, usuarios } from '../db/esquema'
import { ErrorDominio } from '../domain/errores'
import {
  normalizarNombreUsuario,
  type DatosIngreso,
  type DatosRegistro,
  type UsuarioSesion,
} from '../domain/usuarios'

export const DURACION_SESION_MS = 7 * 24 * 60 * 60 * 1000

export interface SesionCreada {
  token: string
  usuario: UsuarioSesion
}

function esViolacionUnica(error: unknown): boolean {
  let actual: unknown = error
  for (let nivel = 0; nivel < 5 && actual; nivel += 1) {
    if (typeof actual === 'object' && actual !== null && 'code' in actual && actual.code === '23505') {
      return true
    }
    actual = actual instanceof Error ? actual.cause : null
  }
  return false
}

export function crearRepositorioUsuarios(db: BaseDeDatos) {
  async function abrirSesion(usuario: UsuarioSesion): Promise<SesionCreada> {
    const token = generarTokenSesion()
    await db.delete(sesiones).where(lte(sesiones.expiraEn, new Date()))
    await db.insert(sesiones).values({
      tokenHash: hashToken(token),
      usuarioId: usuario.id,
      expiraEn: new Date(Date.now() + DURACION_SESION_MS),
    })
    return { token, usuario }
  }

  return {
    async registrar(datos: DatosRegistro): Promise<SesionCreada> {
      const hashContrasena = await generarHashContrasena(datos.contrasena)
      try {
        const [creado] = await db
          .insert(usuarios)
          .values({
            nombre: datos.nombre,
            nombreNormalizado: normalizarNombreUsuario(datos.nombre),
            hashContrasena,
          })
          .returning({ id: usuarios.id, nombre: usuarios.nombre })
        if (!creado) {
          throw new Error('No se pudo crear la cuenta.')
        }
        return abrirSesion(creado)
      } catch (error) {
        if (esViolacionUnica(error)) {
          throw new ErrorDominio(
            'regla_negocio',
            `Ya existe una cuenta con el nombre «${datos.nombre}». Elige otro nombre o inicia sesión.`,
          )
        }
        throw error
      }
    },

    async ingresar(datos: DatosIngreso): Promise<SesionCreada> {
      const [usuario] = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.nombreNormalizado, normalizarNombreUsuario(datos.nombre)))
      const valida = usuario ? await verificarContrasena(datos.contrasena, usuario.hashContrasena) : false
      if (!usuario || !valida) {
        throw new ErrorDominio('no_autenticado', 'El nombre o la contraseña no son correctos.')
      }
      return abrirSesion({ id: usuario.id, nombre: usuario.nombre })
    },

    async buscarSesion(token: string): Promise<UsuarioSesion | null> {
      const [fila] = await db
        .select({ id: usuarios.id, nombre: usuarios.nombre })
        .from(sesiones)
        .innerJoin(usuarios, eq(sesiones.usuarioId, usuarios.id))
        .where(and(eq(sesiones.tokenHash, hashToken(token)), gt(sesiones.expiraEn, new Date())))
      return fila ?? null
    },

    async cerrarSesion(token: string): Promise<void> {
      await db.delete(sesiones).where(eq(sesiones.tokenHash, hashToken(token)))
    },
  }
}

export type RepositorioUsuarios = ReturnType<typeof crearRepositorioUsuarios>
