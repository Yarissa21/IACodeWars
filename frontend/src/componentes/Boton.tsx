import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'

const ESTILOS: Record<Variante, string> = {
  primario:
    'bg-marca-800 text-white shadow-sm hover:bg-marca-900 focus-visible:ring-marca-500',
  secundario:
    'border border-slate-300 bg-white text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-marca-400',
  peligro: 'bg-rose-700 text-white shadow-sm hover:bg-rose-800 focus-visible:ring-rose-500',
  fantasma: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-marca-400',
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
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${ESTILOS[variante]} ${className}`}
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
