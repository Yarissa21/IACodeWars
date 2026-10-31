import { index, integer, pgEnum, pgSequence, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

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
    motivo: text('motivo'),
    fecha: timestamp('fecha', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (tabla) => [index('historial_expediente_fecha_idx').on(tabla.expedienteId, tabla.fecha)],
)

export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  nombreNormalizado: text('nombre_normalizado').notNull().unique(),
  hashContrasena: text('hash_contrasena').notNull(),
  creadoEn: timestamp('creado_en', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
})

export const sesiones = pgTable(
  'sesiones',
  {
    id: serial('id').primaryKey(),
    tokenHash: text('token_hash').notNull().unique(),
    usuarioId: integer('usuario_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    expiraEn: timestamp('expira_en', { withTimezone: true, mode: 'date' }).notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (tabla) => [index('sesiones_usuario_idx').on(tabla.usuarioId)],
)

export const cierres = pgTable(
  'cierres',
  {
    id: serial('id').primaryKey(),
    expedienteNumero: integer('expediente_numero')
      .notNull()
      .references(() => expedientes.numero, { onDelete: 'cascade' }),
    fecha: timestamp('fecha', { withTimezone: true, mode: 'date' }).notNull(),
    motivo: text('motivo').notNull(),
  },
  (tabla) => [index('cierres_expediente_fecha_idx').on(tabla.expedienteNumero, tabla.fecha)],
)
