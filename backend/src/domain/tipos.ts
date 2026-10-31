export const ESTADOS = ['abierto', 'en_seguimiento', 'cerrado'] as const

export type Estado = (typeof ESTADOS)[number]

export const CATEGORIAS = ['civil', 'familiar', 'laboral'] as const

export type Categoria = (typeof CATEGORIAS)[number]

export const TIPOS_ENTRADA = ['apertura', 'actividad', 'cambio_estado'] as const

export type TipoEntrada = (typeof TIPOS_ENTRADA)[number]

export const ETIQUETAS_ESTADO: Record<Estado, string> = {
  abierto: 'Abierto',
  en_seguimiento: 'En seguimiento',
  cerrado: 'Cerrado',
}

export interface EntradaHistorial {
  id: number
  tipo: TipoEntrada
  descripcion: string
  tipoActividad: string | null
  estadoAnterior: Estado | null
  estadoNuevo: Estado | null
  fecha: Date
}

export type NuevaEntradaHistorial = Omit<EntradaHistorial, 'id'>

export interface DatosExpediente {
  id: string
  numero: number
  solicitante: string
  descripcion: string
  responsable: string
  categoria: Categoria | null
  estado: Estado
  abiertoEn: Date
  cerradoEn: Date | null
  motivoCierre: string | null
}

export interface Expediente extends DatosExpediente {
  historial: EntradaHistorial[]
}

export type ResumenExpediente = Pick<
  DatosExpediente,
  'id' | 'solicitante' | 'responsable' | 'estado' | 'categoria' | 'abiertoEn'
>

export interface CambioExpediente {
  expediente: DatosExpediente
  nuevasEntradas: NuevaEntradaHistorial[]
}
