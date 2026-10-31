import { formatearFecha, formatearHora } from '../lib/fechas'
import type { EntradaHistorial } from '../tipos/expediente'
import { BadgeEstado } from './BadgeEstado'

type ClaseEntrada = 'apertura' | 'actividad' | 'cambio_estado' | 'cierre' | 'reapertura'

interface Apariencia {
  etiqueta: string
  icono: string
  circulo: string
  chip: string
}

const APARIENCIAS: Record<ClaseEntrada, Apariencia> = {
  apertura: {
    etiqueta: 'Apertura',
    icono: 'M12 5v14M5 12h14',
    circulo: 'bg-marca-700 text-white',
    chip: 'bg-marca-50 text-marca-800 ring-marca-600/20',
  },
  actividad: {
    etiqueta: 'Actividad',
    icono: 'M5 7h14M5 12h14M5 17h9',
    circulo: 'bg-sky-600 text-white',
    chip: 'bg-sky-50 text-sky-800 ring-sky-600/20',
  },
  cambio_estado: {
    etiqueta: 'Cambio de estado',
    icono: 'M5 12h14M13 6l6 6-6 6',
    circulo: 'bg-amber-500 text-white',
    chip: 'bg-amber-50 text-amber-900 ring-amber-600/25',
  },
  cierre: {
    etiqueta: 'Cierre',
    icono: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z',
    circulo: 'bg-slate-700 text-white',
    chip: 'bg-slate-100 text-slate-800 ring-slate-500/25',
  },
  reapertura: {
    etiqueta: 'Reapertura',
    icono: 'M7 11V8a5 5 0 0 1 9.6-1.9M6 11h12v9H6z',
    circulo: 'bg-violet-600 text-white',
    chip: 'bg-violet-50 text-violet-800 ring-violet-600/20',
  },
}

function clasificar(entrada: EntradaHistorial): ClaseEntrada {
  if (entrada.tipo === 'cambio_estado') {
    if (entrada.estadoAnterior === 'cerrado') {
      return 'reapertura'
    }
    if (entrada.estadoNuevo === 'cerrado') {
      return 'cierre'
    }
  }
  return entrada.tipo
}

function Icono({ trazo }: { trazo: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d={trazo} />
    </svg>
  )
}

function Entrada({ entrada, ultima }: { entrada: EntradaHistorial; ultima: boolean }) {
  const clase = clasificar(entrada)
  const apariencia = APARIENCIAS[clase]
  const esTransicion = entrada.tipo === 'cambio_estado'

  return (
    <li className="relative flex gap-4 pb-7 last:pb-0">
      {ultima ? null : (
        <span aria-hidden="true" className="absolute bottom-0 left-4 top-9 -ml-px w-px bg-slate-200" />
      )}
      <span
        className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${apariencia.circulo}`}
      >
        <Icono trazo={apariencia.icono} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${apariencia.chip}`}
          >
            {apariencia.etiqueta}
          </span>
          {entrada.autor ? (
            <span className="text-sm text-slate-600">
              por <span className="font-semibold text-slate-900">{entrada.autor}</span>
            </span>
          ) : (
            <span className="text-sm italic text-slate-400">Autor no registrado</span>
          )}
          <time dateTime={entrada.fecha} className="text-xs text-slate-500 sm:ml-auto">
            {formatearFecha(entrada.fecha)} · {formatearHora(entrada.fecha)}
          </time>
        </div>

        {esTransicion && entrada.estadoAnterior && entrada.estadoNuevo ? (
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <BadgeEstado estado={entrada.estadoAnterior} />
            <span aria-label="pasa a" className="text-slate-400">
              →
            </span>
            <BadgeEstado estado={entrada.estadoNuevo} />
          </p>
        ) : (
          <p className="mt-1.5 whitespace-pre-line break-words text-sm text-slate-800">{entrada.descripcion}</p>
        )}

        {entrada.tipoActividad ? (
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-medium text-slate-600">Tipo:</span> {entrada.tipoActividad}
          </p>
        ) : null}

        {entrada.motivo ? (
          <p className="mt-2 break-words rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span className="font-medium text-slate-900">Motivo:</span> {entrada.motivo}
          </p>
        ) : null}
      </div>
    </li>
  )
}

export function Historial({ entradas }: { entradas: EntradaHistorial[] }) {
  if (entradas.length === 0) {
    return <p className="text-sm text-slate-600">El historial está vacío.</p>
  }

  return (
    <ol>
      {entradas.map((entrada, indice) => (
        <Entrada key={entrada.id} entrada={entrada} ultima={indice === entradas.length - 1} />
      ))}
    </ol>
  )
}
