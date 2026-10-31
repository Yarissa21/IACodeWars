import type { ReactNode } from 'react'

interface PropiedadesTarjeta {
  titulo?: string
  descripcion?: string
  acciones?: ReactNode
  sinRelleno?: boolean
  children: ReactNode
}

export function Tarjeta({ titulo, descripcion, acciones, sinRelleno = false, children }: PropiedadesTarjeta) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {titulo ? (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">{titulo}</h2>
            {descripcion ? <p className="mt-0.5 text-xs text-slate-500">{descripcion}</p> : null}
          </div>
          {acciones}
        </header>
      ) : null}
      <div className={sinRelleno ? '' : 'px-6 py-5'}>{children}</div>
    </section>
  )
}
