import { http } from '../lib/http'
import type {
  DatosActividad,
  DatosApertura,
  DatosMotivo,
  Expediente,
  ResumenExpediente,
} from '../tipos/expediente'

function rutaExpediente(codigo: string): string {
  return `/expedientes/${encodeURIComponent(codigo)}`
}

export async function listarExpedientes(termino: string): Promise<ResumenExpediente[]> {
  const params = termino ? { q: termino } : undefined
  const { data } = await http.get<ResumenExpediente[]>('/expedientes', { params })
  return data
}

export async function obtenerExpediente(codigo: string): Promise<Expediente> {
  const { data } = await http.get<Expediente>(rutaExpediente(codigo))
  return data
}

export async function abrirExpediente(datos: DatosApertura): Promise<Expediente> {
  const { data } = await http.post<Expediente>('/expedientes', datos)
  return data
}

export async function registrarActividad(codigo: string, datos: DatosActividad): Promise<Expediente> {
  const { data } = await http.post<Expediente>(`${rutaExpediente(codigo)}/actividades`, datos)
  return data
}

export async function pasarASeguimiento(codigo: string): Promise<Expediente> {
  const { data } = await http.post<Expediente>(`${rutaExpediente(codigo)}/seguimiento`)
  return data
}

export async function cerrarExpediente(codigo: string, datos: DatosMotivo): Promise<Expediente> {
  const { data } = await http.post<Expediente>(`${rutaExpediente(codigo)}/cierre`, datos)
  return data
}
