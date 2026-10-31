import { asc, eq, sql } from 'drizzle-orm'
import type { BaseDeDatos } from '../db/conexion.js'
import { cierres, expedientes, historial } from '../db/esquema.js'
import { ErrorDominio } from '../domain/errores.js'
import type {
  DatosActividad,
  DatosApertura,
  DatosCierre,
  DatosReapertura,
} from '../domain/esquemas.js'
import {
  agregarActividad,
  cerrarExpediente,
  crearExpediente,
  pasarASeguimiento,
  reabrirExpediente,
  type ContextoAccion,
} from '../domain/expedientes.js'
import type {
  CambioExpediente,
  Cierre,
  DatosExpediente,
  EntradaHistorial,
  Expediente,
  ResumenExpediente,
} from '../domain/tipos.js'

type Transaccion = Parameters<Parameters<BaseDeDatos['transaction']>[0]>[0]

type Lector = Pick<BaseDeDatos, 'select'>

type OperacionExpediente = (expediente: Expediente, contexto: ContextoAccion) => CambioExpediente

async function leerHistorial(lector: Lector, expedienteId: string): Promise<EntradaHistorial[]> {
  return lector
    .select({
      id: historial.id,
      tipo: historial.tipo,
      descripcion: historial.descripcion,
      tipoActividad: historial.tipoActividad,
      estadoAnterior: historial.estadoAnterior,
      estadoNuevo: historial.estadoNuevo,
      motivo: historial.motivo,
      autor: historial.autor,
      fecha: historial.fecha,
    })
    .from(historial)
    .where(eq(historial.expedienteId, expedienteId))
    .orderBy(asc(historial.fecha), asc(historial.id))
}

async function leerCierres(lector: Lector, numero: number): Promise<Cierre[]> {
  return lector
    .select({ id: cierres.id, fecha: cierres.fecha, motivo: cierres.motivo })
    .from(cierres)
    .where(eq(cierres.expedienteNumero, numero))
    .orderBy(asc(cierres.fecha), asc(cierres.id))
}

async function completar(lector: Lector, datos: DatosExpediente): Promise<Expediente> {
  const [listaCierres, entradas] = await Promise.all([
    leerCierres(lector, datos.numero),
    leerHistorial(lector, datos.id),
  ])
  return { ...datos, cierres: listaCierres, historial: entradas }
}

async function leerExpediente(lector: Lector, id: string): Promise<Expediente | null> {
  const [datos] = await lector.select().from(expedientes).where(eq(expedientes.id, id))
  return datos ? completar(lector, datos) : null
}

async function bloquearExpediente(tx: Transaccion, id: string): Promise<Expediente> {
  const [datos] = await tx.select().from(expedientes).where(eq(expedientes.id, id)).for('update')
  if (!datos) {
    throw new ErrorDominio('no_encontrado', `No existe el expediente ${id}.`)
  }
  return completar(tx, datos)
}

async function guardarCambio(tx: Transaccion, cambio: CambioExpediente): Promise<void> {
  if (cambio.nuevasEntradas.length > 0) {
    await tx
      .insert(historial)
      .values(cambio.nuevasEntradas.map((entrada) => ({ ...entrada, expedienteId: cambio.expediente.id })))
  }
  if (cambio.nuevoCierre) {
    await tx.insert(cierres).values({ ...cambio.nuevoCierre, expedienteNumero: cambio.expediente.numero })
  }
}

async function releer(tx: Transaccion, id: string): Promise<Expediente> {
  const expediente = await leerExpediente(tx, id)
  if (!expediente) {
    throw new ErrorDominio('no_encontrado', `No existe el expediente ${id}.`)
  }
  return expediente
}

function datosPersistibles(expediente: DatosExpediente): DatosExpediente {
  return {
    id: expediente.id,
    numero: expediente.numero,
    solicitante: expediente.solicitante,
    descripcion: expediente.descripcion,
    responsable: expediente.responsable,
    categoria: expediente.categoria,
    estado: expediente.estado,
    abiertoEn: expediente.abiertoEn,
  }
}

export function crearRepositorioExpedientes(db: BaseDeDatos) {
  async function aplicar(id: string, autor: string, operacion: OperacionExpediente): Promise<Expediente> {
    return db.transaction(async (tx) => {
      const actual = await bloquearExpediente(tx, id)
      const cambio = operacion(actual, { ahora: new Date(), autor })
      if (cambio.expediente.estado !== actual.estado) {
        await tx
          .update(expedientes)
          .set({ estado: cambio.expediente.estado })
          .where(eq(expedientes.id, id))
      }
      await guardarCambio(tx, cambio)
      return releer(tx, id)
    })
  }

  return {
    async listar(): Promise<ResumenExpediente[]> {
      return db
        .select({
          id: expedientes.id,
          solicitante: expedientes.solicitante,
          responsable: expedientes.responsable,
          estado: expedientes.estado,
          categoria: expedientes.categoria,
          abiertoEn: expedientes.abiertoEn,
        })
        .from(expedientes)
        .orderBy(asc(expedientes.numero))
    },

    async obtener(id: string): Promise<Expediente> {
      const expediente = await leerExpediente(db, id)
      if (!expediente) {
        throw new ErrorDominio('no_encontrado', `No existe el expediente ${id}.`)
      }
      return expediente
    },

    async abrir(datos: DatosApertura, autor: string): Promise<Expediente> {
      return db.transaction(async (tx) => {
        const [fila] = await tx.execute<{ valor: string }>(
          sql`select nextval('expedientes_numero_seq') as valor`,
        )
        if (!fila) {
          throw new Error('No se pudo generar el número del expediente.')
        }
        const cambio = crearExpediente(datos, Number(fila.valor), { ahora: new Date(), autor })
        await tx.insert(expedientes).values(datosPersistibles(cambio.expediente))
        await guardarCambio(tx, cambio)
        return releer(tx, cambio.expediente.id)
      })
    },

    async registrarActividad(id: string, datos: DatosActividad, autor: string): Promise<Expediente> {
      return aplicar(id, autor, (expediente, contexto) => agregarActividad(expediente, datos, contexto))
    },

    async pasarASeguimiento(id: string, autor: string): Promise<Expediente> {
      return aplicar(id, autor, (expediente, contexto) => pasarASeguimiento(expediente, contexto))
    },

    async cerrar(id: string, datos: DatosCierre, autor: string): Promise<Expediente> {
      return aplicar(id, autor, (expediente, contexto) => cerrarExpediente(expediente, datos, contexto))
    },

    async reabrir(id: string, datos: DatosReapertura, autor: string): Promise<Expediente> {
      return aplicar(id, autor, (expediente, contexto) => reabrirExpediente(expediente, datos, contexto))
    },
  }
}

export type RepositorioExpedientes = ReturnType<typeof crearRepositorioExpedientes>
