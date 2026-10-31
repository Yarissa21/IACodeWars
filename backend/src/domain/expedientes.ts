import type { DatosActividad, DatosApertura, DatosCierre } from './esquemas'
import { ErrorDominio } from './errores'
import {
  ETIQUETAS_ESTADO,
  type CambioExpediente,
  type Estado,
  type Expediente,
  type NuevaEntradaHistorial,
  type ResumenExpediente,
} from './tipos'

export function formatearIdExpediente(numero: number): string {
  return `EXP-${String(numero).padStart(4, '0')}`
}

export function normalizarIdExpediente(id: string): string {
  return id.trim().toUpperCase()
}

function entradaCambioEstado(
  anterior: Estado,
  nuevo: Estado,
  fecha: Date,
  detalle?: string,
): NuevaEntradaHistorial {
  const base = `Estado cambiado de ${ETIQUETAS_ESTADO[anterior]} a ${ETIQUETAS_ESTADO[nuevo]}.`
  return {
    tipo: 'cambio_estado',
    descripcion: detalle ? `${base} ${detalle}` : base,
    tipoActividad: null,
    estadoAnterior: anterior,
    estadoNuevo: nuevo,
    fecha,
  }
}

function asegurarNoCerrado(expediente: Expediente, accion: string): void {
  if (expediente.estado === 'cerrado') {
    throw new ErrorDominio(
      'regla_negocio',
      `El expediente ${expediente.id} está cerrado: solo se puede consultar y no admite ${accion}.`,
    )
  }
}

function contarActividades(expediente: Expediente): number {
  return expediente.historial.filter((entrada) => entrada.tipo === 'actividad').length
}

export function crearExpediente(datos: DatosApertura, numero: number, ahora: Date): CambioExpediente {
  return {
    expediente: {
      id: formatearIdExpediente(numero),
      numero,
      solicitante: datos.solicitante,
      descripcion: datos.descripcion,
      responsable: datos.responsable,
      categoria: datos.categoria,
      estado: 'abierto',
      abiertoEn: ahora,
      cerradoEn: null,
      motivoCierre: null,
    },
    nuevasEntradas: [
      {
        tipo: 'apertura',
        descripcion: `Expediente abierto. Responsable: ${datos.responsable}.`,
        tipoActividad: null,
        estadoAnterior: null,
        estadoNuevo: 'abierto',
        fecha: ahora,
      },
    ],
  }
}

export function agregarActividad(
  expediente: Expediente,
  datos: DatosActividad,
  ahora: Date,
): CambioExpediente {
  asegurarNoCerrado(expediente, 'nuevas actividades')
  return {
    expediente,
    nuevasEntradas: [
      {
        tipo: 'actividad',
        descripcion: datos.descripcion,
        tipoActividad: datos.tipo,
        estadoAnterior: null,
        estadoNuevo: null,
        fecha: ahora,
      },
    ],
  }
}

export function pasarASeguimiento(expediente: Expediente, ahora: Date): CambioExpediente {
  asegurarNoCerrado(expediente, 'cambios de estado')
  if (expediente.estado !== 'abierto') {
    throw new ErrorDominio(
      'regla_negocio',
      `El expediente ${expediente.id} ya está En seguimiento.`,
    )
  }
  return {
    expediente: { ...expediente, estado: 'en_seguimiento' },
    nuevasEntradas: [entradaCambioEstado('abierto', 'en_seguimiento', ahora)],
  }
}

export function cerrarExpediente(
  expediente: Expediente,
  datos: DatosCierre,
  ahora: Date,
): CambioExpediente {
  asegurarNoCerrado(expediente, 'cambios de estado')
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
    expediente: {
      ...expediente,
      estado: 'cerrado',
      cerradoEn: ahora,
      motivoCierre: datos.motivo,
    },
    nuevasEntradas: [
      entradaCambioEstado('en_seguimiento', 'cerrado', ahora, `Motivo: ${datos.motivo}`),
    ],
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
