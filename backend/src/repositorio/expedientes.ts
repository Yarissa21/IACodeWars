import { asc, eq, sql } from 'drizzle-orm'
import type { BaseDeDatos } from '../db/conexion'
import { expedientes, historial } from '../db/esquema'
import { ErrorDominio } from '../domain/errores'
import type { DatosActividad, DatosApertura, DatosCierre } from '../domain/esquemas'
import {
  agregarActividad,
  cerrarExpediente,
  crearExpediente,
  pasarASeguimiento,
} from '../domain/expedientes'
import type {
  CambioExpediente,
  DatosExpediente,
  EntradaHistorial,
  Expediente,
  ResumenExpediente,
} from '../domain/tipos'

type Transaccion = Parameters<Parameters<BaseDeDatos['transaction']>[0]>[0]

type Lector = Pick<BaseDeDatos, 'select'>

type OperacionExpediente = (expediente: Expediente, ahora: Date) => CambioExpediente

async function leerHistorial(lector: Lector, expedienteId: string): Promise<EntradaHistorial[]> {
  return lector
    .select({
      id: historial.id,
      tipo: historial.tipo,
      descripcion: historial.descripcion,
      tipoActividad: historial.tipoActividad,
      estadoAnterior: historial.estadoAnterior,
      estadoNuevo: historial.estadoNuevo,
      fecha: historial.fecha,
    })
    .from(historial)
    .where(eq(historial.expedienteId, expedienteId))
    .orderBy(asc(historial.fecha), asc(historial.id))
}

async function leerExpediente(lector: Lector, id: string): Promise<Expediente | null> {
  const [datos] = await lector.select().from(expedientes).where(eq(expedientes.id, id))
  if (!datos) {
    return null
  }
  return { ...datos, historial: await leerHistorial(lector, id) }
}

async function bloquearExpediente(tx: Transaccion, id: string): Promise<Expediente> {
  const [datos] = await tx.select().from(expedientes).where(eq(expedientes.id, id)).for('update')
  if (!datos) {
    throw new ErrorDominio('no_encontrado', `No existe el expediente ${id}.`)
  }
  return { ...datos, historial: await leerHistorial(tx, id) }
}

async function guardarEntradas(tx: Transaccion, cambio: CambioExpediente): Promise<void> {
  if (cambio.nuevasEntradas.length === 0) {
    return
  }
  await tx
    .insert(historial)
    .values(cambio.nuevasEntradas.map((entrada) => ({ ...entrada, expedienteId: cambio.expediente.id })))
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
    cerradoEn: expediente.cerradoEn,
    motivoCierre: expediente.motivoCierre,
  }
}

export function crearRepositorioExpedientes(db: BaseDeDatos) {
  async function aplicar(id: string, operacion: OperacionExpediente): Promise<Expediente> {
    return db.transaction(async (tx) => {
      const actual = await bloquearExpediente(tx, id)
      const cambio = operacion(actual, new Date())
      await tx
        .update(expedientes)
        .set({
          estado: cambio.expediente.estado,
          cerradoEn: cambio.expediente.cerradoEn,
          motivoCierre: cambio.expediente.motivoCierre,
        })
        .where(eq(expedientes.id, id))
      await guardarEntradas(tx, cambio)
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

    async abrir(datos: DatosApertura): Promise<Expediente> {
      return db.transaction(async (tx) => {
        const [fila] = await tx.execute<{ valor: string }>(
          sql`select nextval('expedientes_numero_seq') as valor`,
        )
        if (!fila) {
          throw new Error('No se pudo generar el número del expediente.')
        }
        const cambio = crearExpediente(datos, Number(fila.valor), new Date())
        await tx.insert(expedientes).values(datosPersistibles(cambio.expediente))
        await guardarEntradas(tx, cambio)
        return releer(tx, cambio.expediente.id)
      })
    },

    async registrarActividad(id: string, datos: DatosActividad): Promise<Expediente> {
      return aplicar(id, (expediente, ahora) => agregarActividad(expediente, datos, ahora))
    },

    async pasarASeguimiento(id: string): Promise<Expediente> {
      return aplicar(id, (expediente, ahora) => pasarASeguimiento(expediente, ahora))
    },

    async cerrar(id: string, datos: DatosCierre): Promise<Expediente> {
      return aplicar(id, (expediente, ahora) => cerrarExpediente(expediente, datos, ahora))
    },
  }
}

export type RepositorioExpedientes = ReturnType<typeof crearRepositorioExpedientes>
