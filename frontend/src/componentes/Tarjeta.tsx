import type { ReactNode } from 'react'

interface PropiedadesTarjeta {
  titulo: string
  descripcion?: string
  children: ReactNode
}

export function Tarjeta({ titulo, descripcion, children }: PropiedadesTarjeta) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-5 py-3">
        <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
        {descripcion ? <p className="text-xs text-slate-500">{descripcion}</p> : null}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}
