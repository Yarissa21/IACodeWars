import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro'

const ESTILOS: Record<Variante, string> = {
  primario: 'bg-teal-700 text-white hover:bg-teal-800 focus-visible:ring-teal-600',
  secundario:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
  peligro: 'bg-rose-700 text-white hover:bg-rose-800 focus-visible:ring-rose-600',
}

interface PropiedadesBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  cargando?: boolean
}

export function Boton({
  variante = 'primario',
  cargando = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...resto
}: PropiedadesBoton) {
  return (
    <button
      type={type}
      disabled={disabled === true || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${ESTILOS[variante]} ${className}`}
      {...resto}
    >
      {cargando ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : null}
      {children}
    </button>
  )
}
