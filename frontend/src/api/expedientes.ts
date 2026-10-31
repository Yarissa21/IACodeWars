import { http } from '../lib/http'
import type { DatosApertura, Expediente } from '../tipos/expediente'

export async function abrirExpediente(datos: DatosApertura): Promise<Expediente> {
  const { data } = await http.post<Expediente>('/expedientes', datos)
  return data
}
