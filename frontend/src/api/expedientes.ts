import { http } from '../lib/http'
import type { DatosApertura, Expediente, ResumenExpediente } from '../tipos/expediente'

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
