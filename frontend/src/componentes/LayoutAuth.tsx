import type { ReactNode } from 'react'
import { Logo } from './Logo'

const PUNTOS = [
  'Expedientes con identificador único y estado siempre visible.',
  'Historial cronológico con quién hizo cada acción.',
  'Cierres y reaperturas trazables con fecha, hora y motivo.',
]

interface PropiedadesLayoutAuth {
  titulo: string
  subtitulo: string
  children: ReactNode
  pie: ReactNode
}

export function LayoutAuth({ titulo, subtitulo, children, pie }: PropiedadesLayoutAuth) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-marca-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full border border-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-24 size-[32rem] rounded-full border border-white/5"
        />
        <Logo claro />
        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acento-400">Asesoría gratuita</p>
          <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-white">
            Cada caso, ordenado y con su historia completa.
          </h2>
          <ul className="mt-8 space-y-4">
            {PUNTOS.map((punto) => (
              <li key={punto} className="flex gap-3 text-sm text-marca-200">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-acento-400" />
                {punto}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-marca-400">© {new Date().getFullYear()} Bufete Popular</p>
      </aside>

      <main className="flex items-center justify-center bg-white px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{titulo}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{subtitulo}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">{pie}</div>
        </div>
      </main>
    </div>
  )
}
