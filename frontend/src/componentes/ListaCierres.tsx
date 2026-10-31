import { formatearFecha, formatearHora } from '../lib/fechas'
import type { Cierre } from '../tipos/expediente'

export function ListaCierres({ cierres }: { cierres: Cierre[] }) {
  if (cierres.length === 0) {
    return <p className="text-sm text-slate-600">Este expediente todavía no tiene cierres registrados.</p>
  }

  return (
    <ol className="divide-y divide-slate-100">
      {cierres.map((cierre, indice) => (
        <li key={cierre.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-4">
          <div className="shrink-0 sm:w-48">
            <p className="text-sm font-medium text-slate-900">Cierre {indice + 1}</p>
            <p className="text-xs text-slate-500">
              <time dateTime={cierre.fecha}>
                {formatearFecha(cierre.fecha)} · {formatearHora(cierre.fecha)}
              </time>
            </p>
          </div>
          <p className="min-w-0 break-words text-sm text-slate-700">
            <span className="font-medium">Motivo:</span> {cierre.motivo}
          </p>
        </li>
      ))}
    </ol>
  )
}
