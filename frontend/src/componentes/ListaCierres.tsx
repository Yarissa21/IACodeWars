import { formatearFecha, formatearHora } from '../lib/fechas'
import type { Cierre } from '../tipos/expediente'
import { Icono } from './Icono'

export function ListaCierres({ cierres }: { cierres: Cierre[] }) {
  if (cierres.length === 0) {
    return <p className="text-sm text-slate-500">Este expediente todavía no tiene cierres registrados.</p>
  }

  return (
    <ol className="space-y-3">
      {cierres.map((cierre, indice) => (
        <li key={cierre.id} className="flex gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
            <Icono nombre="candado" className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-sm font-semibold text-slate-900">Cierre {indice + 1}</p>
              <time dateTime={cierre.fecha} className="text-xs text-slate-500">
                {formatearFecha(cierre.fecha)} · {formatearHora(cierre.fecha)}
              </time>
            </div>
            <p className="mt-1 break-words text-sm text-slate-700">
              <span className="font-medium text-slate-900">Motivo:</span> {cierre.motivo}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
