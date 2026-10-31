import type { ReactNode } from 'react'

interface PropiedadesEncabezado {
  titulo: ReactNode
  descripcion?: ReactNode
  superior?: ReactNode
  acciones?: ReactNode
}

export function EncabezadoPagina({ titulo, descripcion, superior, acciones }: PropiedadesEncabezado) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {superior ? <div className="mb-3">{superior}</div> : null}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">{titulo}</h1>
        {descripcion ? <div className="mt-1.5 text-sm text-slate-500">{descripcion}</div> : null}
      </div>
      {acciones ? <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div> : null}
    </header>
  )
}
