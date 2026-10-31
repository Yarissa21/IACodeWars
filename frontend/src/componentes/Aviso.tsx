import type { ReactNode } from 'react'

type Tono = 'info' | 'error' | 'neutro' | 'advertencia'

const ESTILOS: Record<Tono, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  neutro: 'border-slate-200 bg-white text-slate-700',
  advertencia: 'border-amber-200 bg-amber-50 text-amber-900',
}

interface PropiedadesAviso {
  titulo: string
  tono?: Tono
  children?: ReactNode
}

export function Aviso({ titulo, tono = 'neutro', children }: PropiedadesAviso) {
  return (
    <div role={tono === 'error' ? 'alert' : 'status'} className={`rounded-lg border p-5 ${ESTILOS[tono]}`}>
      <p className="font-medium">{titulo}</p>
      {children ? <div className="mt-2 text-sm">{children}</div> : null}
    </div>
  )
}
