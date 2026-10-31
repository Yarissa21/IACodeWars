interface PropiedadesLogo {
  claro?: boolean
  compacto?: boolean
}

export function IconoBalanza({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3v17M8 20h8M5 7h14M12 3l-1.5 1.5M12 3l1.5 1.5" />
      <path d="M2 14l3-7 3 7a3 3 0 0 1-6 0z" />
      <path d="M16 14l3-7 3 7a3 3 0 0 1-6 0z" />
    </svg>
  )
}

export function Logo({ claro = false, compacto = false }: PropiedadesLogo) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
          claro ? 'bg-white/10 text-acento-400 ring-1 ring-white/15' : 'bg-marca-900 text-acento-400'
        }`}
      >
        <IconoBalanza />
      </span>
      {compacto ? null : (
        <div className="leading-tight">
          <p className={`font-serif text-lg font-semibold ${claro ? 'text-white' : 'text-marca-950'}`}>
            Bufete Popular
          </p>
          <p className={`text-[11px] font-medium uppercase tracking-[0.14em] ${claro ? 'text-marca-300' : 'text-slate-500'}`}>
            Gestión de expedientes
          </p>
        </div>
      )}
    </div>
  )
}
