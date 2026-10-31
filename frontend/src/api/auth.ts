import { http } from '../lib/http'
import type { DatosIngreso, RespuestaSesion, Usuario } from '../tipos/usuario'

export async function registrarUsuario(datos: DatosIngreso): Promise<Usuario> {
  const { data } = await http.post<RespuestaSesion>('/auth/registro', datos)
  return data.usuario
}

export async function ingresar(datos: DatosIngreso): Promise<Usuario> {
  const { data } = await http.post<RespuestaSesion>('/auth/ingreso', datos)
  return data.usuario
}

export async function obtenerSesion(): Promise<Usuario> {
  const { data } = await http.get<RespuestaSesion>('/auth/sesion')
  return data.usuario
}

export async function salir(): Promise<void> {
  await http.post('/auth/salida')
}
