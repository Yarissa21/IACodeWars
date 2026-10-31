import { describe, expect, it } from 'vitest'
import { ErrorDominio, type TipoErrorDominio } from './errores'
import { esquemaApertura, validar } from './esquemas'
import {
  agregarActividad,
  buscarExpedientes,
  cerrarExpediente,
  crearExpediente,
  pasarASeguimiento,
  reabrirExpediente,
} from './expedientes'
import type { CambioExpediente, Expediente } from './tipos'

const T0 = new Date('2026-10-31T14:00:00Z')

function minutos(cantidad: number): Date {
  return new Date(T0.getTime() + cantidad * 60_000)
}

function aplicar(actual: Expediente | null, cambio: CambioExpediente): Expediente {
  const historialPrevio = actual?.historial ?? []
  const cierresPrevios = actual?.cierres ?? []
  return {
    ...cambio.expediente,
    historial: [
      ...historialPrevio,
      ...cambio.nuevasEntradas.map((entrada, indice) => ({ ...entrada, id: historialPrevio.length + indice + 1 })),
    ],
    cierres: cambio.nuevoCierre
      ? [...cierresPrevios, { ...cambio.nuevoCierre, id: cierresPrevios.length + 1 }]
      : cierresPrevios,
  }
}

function nuevoExpediente(numero = 1): Expediente {
  return aplicar(
    null,
    crearExpediente(
      { solicitante: 'María López', descripcion: 'Pensión alimenticia', responsable: 'Lic. Ana', categoria: 'familiar' },
      numero,
      T0,
    ),
  )
}

function enSeguimiento(): Expediente {
  return aplicar(nuevoExpediente(), pasarASeguimiento(nuevoExpediente(), minutos(1)))
}

function conActividad(): Expediente {
  const base = enSeguimiento()
  return aplicar(base, agregarActividad(base, { descripcion: 'Entrevista inicial', tipo: 'Entrevista' }, minutos(2)))
}

function cerrado(): Expediente {
  const base = conActividad()
  return aplicar(base, cerrarExpediente(base, { motivo: 'Acuerdo firmado' }, minutos(3)))
}

function reabierto(): Expediente {
  const base = cerrado()
  return aplicar(base, reabrirExpediente(base, { motivo: 'Incumplimiento del acuerdo' }, minutos(4)))
}

function capturarError(accion: () => unknown): ErrorDominio {
  try {
    accion()
  } catch (error) {
    if (error instanceof ErrorDominio) {
      return error
    }
    throw error
  }
  throw new Error('Se esperaba un ErrorDominio y no se lanzó ninguno.')
}

function esperarRechazo(accion: () => unknown, tipo: TipoErrorDominio, fragmento: string): void {
  const error = capturarError(accion)
  expect(error.tipo).toBe(tipo)
  expect(error.message).toContain(fragmento)
}

describe('apertura', () => {
  it('crea un expediente Abierto con identificador autogenerado y entrada de apertura', () => {
    const expediente = nuevoExpediente(7)
    expect(expediente.id).toBe('EXP-0007')
    expect(expediente.estado).toBe('abierto')
    expect(expediente.abiertoEn).toEqual(T0)
    expect(expediente.cierres).toEqual([])
    expect(expediente.historial).toHaveLength(1)
    expect(expediente.historial[0]).toMatchObject({ tipo: 'apertura', estadoNuevo: 'abierto', fecha: T0 })
  })

  it('aplica trim y acepta la categoría opcional', () => {
    const datos = validar(esquemaApertura, {
      solicitante: '  Juan  ',
      descripcion: ' Despido ',
      responsable: ' Carlos ',
      categoria: '',
    })
    expect(datos).toEqual({ solicitante: 'Juan', descripcion: 'Despido', responsable: 'Carlos', categoria: null })
  })

  it('rechaza campos vacíos y con solo espacios indicando cada campo', () => {
    const error = capturarError(() =>
      validar(esquemaApertura, { solicitante: '   ', descripcion: '', responsable: '\t ' }),
    )
    expect(error.tipo).toBe('validacion')
    expect(error.message).toContain('El solicitante es obligatorio')
    expect(error.message).toContain('La descripción es obligatoria')
    expect(error.message).toContain('El responsable es obligatorio')
  })
})

describe('búsqueda', () => {
  const lista = [
    { id: 'EXP-0001', solicitante: 'María López' },
    { id: 'EXP-0002', solicitante: 'Alias Toño' },
    { id: 'EXP-0010', solicitante: 'Juan Pérez' },
  ]

  it('encuentra por identificador sin distinguir mayúsculas', () => {
    expect(buscarExpedientes(lista, 'exp-0002').map((e) => e.id)).toEqual(['EXP-0002'])
  })

  it('encuentra por nombre o alias sin distinguir mayúsculas ni tildes', () => {
    expect(buscarExpedientes(lista, 'MARIA lopez').map((e) => e.id)).toEqual(['EXP-0001'])
    expect(buscarExpedientes(lista, 'toño').map((e) => e.id)).toEqual(['EXP-0002'])
  })

  it('devuelve una lista vacía cuando no hay resultados', () => {
    expect(buscarExpedientes(lista, 'zzz')).toEqual([])
  })

  it('devuelve todos cuando el término está vacío', () => {
    expect(buscarExpedientes(lista, '   ')).toHaveLength(3)
  })
})

describe('actividades', () => {
  it('se agregan en Abierto', () => {
    const base = nuevoExpediente()
    const cambio = agregarActividad(base, { descripcion: 'Llamada', tipo: null }, minutos(1))
    expect(cambio.expediente.estado).toBe('abierto')
    expect(cambio.nuevasEntradas).toEqual([
      {
        tipo: 'actividad',
        descripcion: 'Llamada',
        tipoActividad: null,
        estadoAnterior: null,
        estadoNuevo: null,
        motivo: null,
        fecha: minutos(1),
      },
    ])
    expect(cambio.nuevoCierre).toBeNull()
  })

  it('se agregan en En seguimiento', () => {
    const cambio = agregarActividad(enSeguimiento(), { descripcion: 'Documento', tipo: 'Documento' }, minutos(2))
    expect(cambio.nuevasEntradas[0]).toMatchObject({ tipo: 'actividad', tipoActividad: 'Documento' })
  })

  it('se rechazan en Cerrado', () => {
    esperarRechazo(
      () => agregarActividad(cerrado(), { descripcion: 'Otra', tipo: null }, minutos(5)),
      'regla_negocio',
      'no admite nuevas actividades',
    )
  })
})

describe('seguimiento y cierre', () => {
  it('pasa de Abierto a En seguimiento con su entrada de historial', () => {
    const cambio = pasarASeguimiento(nuevoExpediente(), minutos(1))
    expect(cambio.expediente.estado).toBe('en_seguimiento')
    expect(cambio.nuevasEntradas[0]).toMatchObject({
      tipo: 'cambio_estado',
      estadoAnterior: 'abierto',
      estadoNuevo: 'en_seguimiento',
    })
  })

  it('rechaza el cierre desde Abierto', () => {
    esperarRechazo(
      () => cerrarExpediente(nuevoExpediente(), { motivo: 'Fin' }, minutos(1)),
      'regla_negocio',
      'primero debe pasar a En seguimiento',
    )
  })

  it('rechaza el cierre sin actividades', () => {
    esperarRechazo(
      () => cerrarExpediente(enSeguimiento(), { motivo: 'Fin' }, minutos(2)),
      'regla_negocio',
      'no tiene actividades registradas',
    )
  })

  it('rechaza el cierre con motivo vacío o solo espacios', () => {
    esperarRechazo(
      () => cerrarExpediente(conActividad(), { motivo: '   ' }, minutos(3)),
      'validacion',
      'El motivo de cierre es obligatorio',
    )
  })

  it('cierra con motivo, registra el cierre y la entrada de historial', () => {
    const cambio = cerrarExpediente(conActividad(), { motivo: '  Acuerdo firmado  ' }, minutos(3))
    expect(cambio.expediente.estado).toBe('cerrado')
    expect(cambio.nuevoCierre).toEqual({ fecha: minutos(3), motivo: 'Acuerdo firmado' })
    expect(cambio.nuevasEntradas[0]).toMatchObject({
      tipo: 'cambio_estado',
      estadoAnterior: 'en_seguimiento',
      estadoNuevo: 'cerrado',
      motivo: 'Acuerdo firmado',
    })
  })
})

describe('reapertura', () => {
  it('pasa de Cerrado a En seguimiento conservando datos, actividades y cierres', () => {
    const antes = cerrado()
    const despues = reabierto()
    expect(despues.estado).toBe('en_seguimiento')
    expect(despues.id).toBe(antes.id)
    expect(despues.solicitante).toBe(antes.solicitante)
    expect(despues.cierres).toEqual(antes.cierres)
    expect(despues.historial.filter((e) => e.tipo === 'actividad')).toHaveLength(1)
  })

  it('devuelve la entrada de historial con transición, motivo y fecha', () => {
    const cambio = reabrirExpediente(cerrado(), { motivo: '  Incumplimiento  ' }, minutos(4))
    expect(cambio.nuevoCierre).toBeNull()
    expect(cambio.nuevasEntradas).toEqual([
      {
        tipo: 'cambio_estado',
        descripcion: 'Estado cambiado de Cerrado a En seguimiento. Expediente reabierto.',
        tipoActividad: null,
        estadoAnterior: 'cerrado',
        estadoNuevo: 'en_seguimiento',
        motivo: 'Incumplimiento',
        fecha: minutos(4),
      },
    ])
  })

  it('rechaza el motivo vacío o con solo espacios', () => {
    for (const motivo of ['', '    ', '\t\n']) {
      esperarRechazo(
        () => reabrirExpediente(cerrado(), { motivo }, minutos(4)),
        'validacion',
        'El motivo de reapertura es obligatorio',
      )
    }
  })

  it('rechaza la reapertura en Abierto', () => {
    esperarRechazo(
      () => reabrirExpediente(nuevoExpediente(), { motivo: 'X' }, minutos(1)),
      'regla_negocio',
      'está Abierto: solo se puede reabrir un expediente Cerrado',
    )
  })

  it('rechaza la reapertura en En seguimiento', () => {
    esperarRechazo(
      () => reabrirExpediente(enSeguimiento(), { motivo: 'X' }, minutos(2)),
      'regla_negocio',
      'está En seguimiento: solo se puede reabrir un expediente Cerrado',
    )
  })

  it('rechaza pasar a seguimiento desde Cerrado: la única salida es reabrir', () => {
    esperarRechazo(() => pasarASeguimiento(cerrado(), minutos(4)), 'regla_negocio', 'reabrirlo')
  })

  it('permite actividades después de reabrir', () => {
    const cambio = agregarActividad(reabierto(), { descripcion: 'Nueva demanda', tipo: null }, minutos(5))
    expect(cambio.nuevasEntradas[0]).toMatchObject({ tipo: 'actividad', descripcion: 'Nueva demanda' })
  })

  it('permite un nuevo cierre que se suma al anterior sin reemplazarlo', () => {
    const base = reabierto()
    const conNueva = aplicar(base, agregarActividad(base, { descripcion: 'Nueva demanda', tipo: null }, minutos(5)))
    const final = aplicar(conNueva, cerrarExpediente(conNueva, { motivo: 'Pago completo' }, minutos(6)))
    expect(final.estado).toBe('cerrado')
    expect(final.cierres.map((c) => ({ fecha: c.fecha, motivo: c.motivo }))).toEqual([
      { fecha: minutos(3), motivo: 'Acuerdo firmado' },
      { fecha: minutos(6), motivo: 'Pago completo' },
    ])
    expect(final.historial.filter((e) => e.tipo === 'actividad')).toHaveLength(2)
  })

  it('permite el nuevo cierre con una actividad anterior a la reapertura', () => {
    const cambio = cerrarExpediente(reabierto(), { motivo: 'Cierre definitivo' }, minutos(6))
    expect(cambio.expediente.estado).toBe('cerrado')
    expect(cambio.nuevoCierre).toEqual({ fecha: minutos(6), motivo: 'Cierre definitivo' })
  })
})
