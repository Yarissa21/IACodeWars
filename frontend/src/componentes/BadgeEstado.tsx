import { ETIQUETAS_ESTADO, type Estado } from '../tipos/expediente'

const COLORES: Record<Estado, string> = {
  abierto: 'bg-sky-100 text-sky-800 ring-sky-600/20',
  en_seguimiento: 'bg-amber-100 text-amber-900 ring-amber-600/25',
  cerrado: 'bg-slate-200 text-slate-700 ring-slate-500/20',
}

const PUNTOS: Record<Estado, string> = {
  abierto: 'bg-sky-500',
  en_seguimiento: 'bg-amber-500',
  cerrado: 'bg-slate-500',
}

export function BadgeEstado({ estado }: { estado: Estado }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${COLORES[estado]}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${PUNTOS[estado]}`} />
      {ETIQUETAS_ESTADO[estado]}
    </span>
  )
}
