export type Estado = 'abierto' | 'en_seguimiento' | 'cerrado'

export type Categoria = 'civil' | 'familiar' | 'laboral'

export type TipoEntrada = 'apertura' | 'actividad' | 'cambio_estado'

export const ETIQUETAS_ESTADO: Record<Estado, string> = {
  abierto: 'Abierto',
  en_seguimiento: 'En seguimiento',
  cerrado: 'Cerrado',
}

export const CATEGORIAS: readonly Categoria[] = ['civil', 'familiar', 'laboral']

export const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  civil: 'Civil',
  familiar: 'Familiar',
  laboral: 'Laboral',
}

export interface EntradaHistorial {
  id: number
  tipo: TipoEntrada
  descripcion: string
  tipoActividad: string | null
  estadoAnterior: Estado | null
  estadoNuevo: Estado | null
  motivo: string | null
  fecha: string
}

export interface Cierre {
  id: number
  fecha: string
  motivo: string
}

export interface ResumenExpediente {
  id: string
  solicitante: string
  responsable: string
  estado: Estado
  categoria: Categoria | null
  abiertoEn: string
}

export interface Expediente extends ResumenExpediente {
  numero: number
  descripcion: string
  cierres: Cierre[]
  historial: EntradaHistorial[]
}

export interface DatosApertura {
  solicitante: string
  descripcion: string
  responsable: string
  categoria: Categoria | null
}
