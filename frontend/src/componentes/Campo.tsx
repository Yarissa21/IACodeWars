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
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:ring-rose-500/20'

export function Campo({ id, etiqueta, error, ayuda, opcional = false, children }: PropiedadesCampo) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
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
