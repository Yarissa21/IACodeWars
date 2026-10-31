import type { ReactNode } from 'react'
import { Icono, type NombreIcono } from './Icono'

type Tono = 'info' | 'error' | 'neutro' | 'advertencia'

const ESTILOS: Record<Tono, { caja: string; icono: string; nombre: NombreIcono }> = {
  info: { caja: 'border-marca-200 bg-marca-50 text-marca-900', icono: 'text-marca-600', nombre: 'info' },
  error: { caja: 'border-rose-200 bg-rose-50 text-rose-900', icono: 'text-rose-600', nombre: 'info' },
  neutro: { caja: 'border-slate-200 bg-white text-slate-700', icono: 'text-slate-400', nombre: 'carpeta' },
  advertencia: { caja: 'border-amber-200 bg-amber-50 text-amber-900', icono: 'text-amber-600', nombre: 'candado' },
}

interface PropiedadesAviso {
  titulo: string
  tono?: Tono
  children?: ReactNode
}

export function Aviso({ titulo, tono = 'neutro', children }: PropiedadesAviso) {
  const estilo = ESTILOS[tono]
  return (
    <div role={tono === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border p-5 ${estilo.caja}`}>
      <Icono nombre={estilo.nombre} className={`mt-0.5 size-5 shrink-0 ${estilo.icono}`} />
      <div className="min-w-0">
        <p className="font-semibold">{titulo}</p>
        {children ? <div className="mt-1.5 text-sm opacity-90">{children}</div> : null}
      </div>
    </div>
  )
}
