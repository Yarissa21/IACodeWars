import type { ReactNode } from 'react'

interface PropiedadesCampo {
  id: string
  etiqueta: string
  error?: string | undefined
  ayuda?: string
  opcional?: boolean
  children: ReactNode
}

export const estiloControl =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-xs transition placeholder:text-slate-400 focus:border-marca-500 focus:outline-none focus:ring-4 focus:ring-marca-500/15 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:focus:ring-rose-500/15'

export function Campo({ id, etiqueta, error, ayuda, opcional = false, children }: PropiedadesCampo) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {etiqueta}
        {opcional ? <span className="ml-1 font-normal text-slate-500">(opcional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-rose-700">
          {error}
        </p>
      ) : ayuda ? (
        <p className="text-xs text-slate-500">{ayuda}</p>
      ) : null}
    </div>
  )
}
