import { index, integer, pgEnum, pgSequence, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const estadoExpediente = pgEnum('estado_expediente', ['abierto', 'en_seguimiento', 'cerrado'])

export const categoriaExpediente = pgEnum('categoria_expediente', ['civil', 'familiar', 'laboral'])

export const tipoEntradaHistorial = pgEnum('tipo_entrada_historial', ['apertura', 'actividad', 'cambio_estado'])

export const secuenciaExpedientes = pgSequence('expedientes_numero_seq', { startWith: 1, increment: 1 })

export const expedientes = pgTable('expedientes', {
  id: text('id').primaryKey(),
  numero: integer('numero').notNull().unique(),
  solicitante: text('solicitante').notNull(),
  descripcion: text('descripcion').notNull(),
  responsable: text('responsable').notNull(),
  categoria: categoriaExpediente('categoria'),
  estado: estadoExpediente('estado').notNull().default('abierto'),
  abiertoEn: timestamp('abierto_en', { withTimezone: true, mode: 'date' }).notNull(),
  cerradoEn: timestamp('cerrado_en', { withTimezone: true, mode: 'date' }),
  motivoCierre: text('motivo_cierre'),
})

export const historial = pgTable(
  'historial',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    expedienteId: text('expediente_id')
      .notNull()
      .references(() => expedientes.id, { onDelete: 'cascade' }),
    tipo: tipoEntradaHistorial('tipo').notNull(),
    descripcion: text('descripcion').notNull(),
    tipoActividad: text('tipo_actividad'),
    estadoAnterior: estadoExpediente('estado_anterior'),
    estadoNuevo: estadoExpediente('estado_nuevo'),
    fecha: timestamp('fecha', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (tabla) => [index('historial_expediente_fecha_idx').on(tabla.expedienteId, tabla.fecha)],
)
