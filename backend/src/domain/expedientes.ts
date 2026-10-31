import type { DatosActividad, DatosApertura, DatosCierre, DatosReapertura } from './esquemas.js'
import { ErrorDominio } from './errores.js'
import {
  ETIQUETAS_ESTADO,
  type CambioExpediente,
  type Estado,
  type Expediente,
  type NuevaEntradaHistorial,
  type ResumenExpediente,
} from './tipos.js'

export interface ContextoAccion {
  ahora: Date
  autor: string
}

export function formatearIdExpediente(numero: number): string {
  return `EXP-${String(numero).padStart(4, '0')}`
}

export function normalizarIdExpediente(id: string): string {
  return id.trim().toUpperCase()
}

function entradaCambioEstado(
  anterior: Estado,
  nuevo: Estado,
  contexto: ContextoAccion,
  motivo: string | null,
  detalle?: string,
): NuevaEntradaHistorial {
  const base = `Estado cambiado de ${ETIQUETAS_ESTADO[anterior]} a ${ETIQUETAS_ESTADO[nuevo]}.`
  return {
    tipo: 'cambio_estado',
    descripcion: detalle ? `${base} ${detalle}` : base,
    tipoActividad: null,
    estadoAnterior: anterior,
    estadoNuevo: nuevo,
    motivo,
    autor: contexto.autor,
    fecha: contexto.ahora,
  }
}

function exigirMotivo(motivo: string, mensajeVacio: string): string {
  const limpio = motivo.trim()
  if (limpio === '') {
    throw new ErrorDominio('validacion', mensajeVacio)
  }
  return limpio
}

function rechazarSiCerrado(expediente: Expediente, mensaje: string): void {
  if (expediente.estado === 'cerrado') {
    throw new ErrorDominio('regla_negocio', `El expediente ${expediente.id} está Cerrado: ${mensaje}`)
  }
}

function contarActividades(expediente: Expediente): number {
  return expediente.historial.filter((entrada) => entrada.tipo === 'actividad').length
}

export function crearExpediente(
  datos: DatosApertura,
  numero: number,
  contexto: ContextoAccion,
): CambioExpediente {
  return {
    expediente: {
      id: formatearIdExpediente(numero),
      numero,
      solicitante: datos.solicitante,
      descripcion: datos.descripcion,
      responsable: datos.responsable,
      categoria: datos.categoria,
      estado: 'abierto',
      abiertoEn: contexto.ahora,
    },
    nuevasEntradas: [
      {
        tipo: 'apertura',
        descripcion: `Expediente abierto. Responsable: ${datos.responsable}.`,
        tipoActividad: null,
        estadoAnterior: null,
        estadoNuevo: 'abierto',
        motivo: null,
        autor: contexto.autor,
        fecha: contexto.ahora,
      },
    ],
    nuevoCierre: null,
  }
}

export function agregarActividad(
  expediente: Expediente,
  datos: DatosActividad,
  contexto: ContextoAccion,
): CambioExpediente {
  rechazarSiCerrado(expediente, 'no admite nuevas actividades. Reábrelo para registrar actividades.')
  return {
    expediente,
    nuevasEntradas: [
      {
        tipo: 'actividad',
        descripcion: datos.descripcion,
        tipoActividad: datos.tipo,
        estadoAnterior: null,
        estadoNuevo: null,
        motivo: null,
        autor: contexto.autor,
        fecha: contexto.ahora,
      },
    ],
    nuevoCierre: null,
  }
}

export function pasarASeguimiento(expediente: Expediente, contexto: ContextoAccion): CambioExpediente {
  rechazarSiCerrado(expediente, 'la única acción permitida es reabrirlo.')
  if (expediente.estado !== 'abierto') {
    throw new ErrorDominio('regla_negocio', `El expediente ${expediente.id} ya está En seguimiento.`)
  }
  return {
    expediente: { ...expediente, estado: 'en_seguimiento' },
    nuevasEntradas: [entradaCambioEstado('abierto', 'en_seguimiento', contexto, null)],
    nuevoCierre: null,
  }
}

export function cerrarExpediente(
  expediente: Expediente,
  datos: DatosCierre,
  contexto: ContextoAccion,
): CambioExpediente {
  const motivo = exigirMotivo(
    datos.motivo,
    'El motivo de cierre es obligatorio: explica por qué se cierra el expediente.',
  )
  rechazarSiCerrado(expediente, 'la única acción permitida es reabrirlo.')
  if (expediente.estado !== 'en_seguimiento') {
    throw new ErrorDominio(
      'regla_negocio',
      `El expediente ${expediente.id} está Abierto: primero debe pasar a En seguimiento para poder cerrarlo.`,
    )
  }
  if (contarActividades(expediente) === 0) {
    throw new ErrorDominio(
      'regla_negocio',
      `El expediente ${expediente.id} no se puede cerrar porque no tiene actividades registradas. Registra al menos una actividad antes de cerrarlo.`,
    )
  }
  return {
    expediente: { ...expediente, estado: 'cerrado' },
    nuevasEntradas: [entradaCambioEstado('en_seguimiento', 'cerrado', contexto, motivo)],
    nuevoCierre: { fecha: contexto.ahora, motivo },
  }
}

export function reabrirExpediente(
  expediente: Expediente,
  datos: DatosReapertura,
  contexto: ContextoAccion,
): CambioExpediente {
  const motivo = exigirMotivo(
    datos.motivo,
    'El motivo de reapertura es obligatorio: explica por qué se reabre el expediente.',
  )
  if (expediente.estado !== 'cerrado') {
    throw new ErrorDominio(
      'regla_negocio',
      `El expediente ${expediente.id} está ${ETIQUETAS_ESTADO[expediente.estado]}: solo se puede reabrir un expediente Cerrado.`,
    )
  }
  return {
    expediente: { ...expediente, estado: 'en_seguimiento' },
    nuevasEntradas: [entradaCambioEstado('cerrado', 'en_seguimiento', contexto, motivo, 'Expediente reabierto.')],
    nuevoCierre: null,
  }
}

function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es').trim()
}

export function buscarExpedientes<T extends Pick<ResumenExpediente, 'id' | 'solicitante'>>(
  expedientes: readonly T[],
  termino: string,
): T[] {
  const buscado = normalizarTexto(termino)
  if (buscado === '') {
    return [...expedientes]
  }
  return expedientes.filter(
    (expediente) =>
      normalizarTexto(expediente.id).includes(buscado) ||
      normalizarTexto(expediente.solicitante).includes(buscado),
  )
}
