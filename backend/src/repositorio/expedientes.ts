import { asc, eq, sql } from 'drizzle-orm'
import type { BaseDeDatos } from '../db/conexion'
import { cierres, expedientes, historial } from '../db/esquema'
import { ErrorDominio } from '../domain/errores'
import type {
  DatosActividad,
  DatosApertura,
  DatosCierre,
  DatosReapertura,
} from '../domain/esquemas'
import {
  agregarActividad,
  cerrarExpediente,
  crearExpediente,
  pasarASeguimiento,
  reabrirExpediente,
} from '../domain/expedientes'
import type {
  CambioExpediente,
  Cierre,
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
      motivo: historial.motivo,
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
  async function aplicar(id: string, operacion: OperacionExpediente): Promise<Expediente> {
    return db.transaction(async (tx) => {
      const actual = await bloquearExpediente(tx, id)
      const cambio = operacion(actual, new Date())
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
        await guardarCambio(tx, cambio)
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

    async reabrir(id: string, datos: DatosReapertura): Promise<Expediente> {
      return aplicar(id, (expediente, ahora) => reabrirExpediente(expediente, datos, ahora))
    },
  }
}

export type RepositorioExpedientes = ReturnType<typeof crearRepositorioExpedientes>
