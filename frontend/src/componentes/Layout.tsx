import { NavLink, Outlet } from 'react-router'
import { ResponsableActivo } from './ResponsableActivo'

const ENLACES = [
  { ruta: '/expedientes', texto: 'Expedientes' },
  { ruta: '/expedientes/nuevo', texto: 'Abrir expediente' },
]

function claseEnlace({ isActive }: { isActive: boolean }): string {
  return `rounded-md px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-white/20 text-white' : 'text-teal-50 hover:bg-white/10'
  }`
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <header className="bg-teal-800 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-lg font-semibold tracking-tight">Bufete Popular</span>
            <nav className="flex gap-1" aria-label="Principal">
              {ENLACES.map((enlace) => (
                <NavLink key={enlace.ruta} to={enlace.ruta} end className={claseEnlace}>
                  {enlace.texto}
                </NavLink>
              ))}
            </nav>
          </div>
          <ResponsableActivo />
        </div>
      </header>

      <div role="note" className="border-b border-amber-200 bg-amber-50">
        <p className="mx-auto max-w-5xl px-4 py-2 text-sm text-amber-900">
          <strong className="font-semibold">Aviso:</strong> todos los datos son ficticios y se usan con
          fines académicos. Esta aplicación no ofrece asesoría jurídica.
        </p>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Bufete Popular · Proyecto universitario con datos ficticios · No es asesoría jurídica
      </footer>
    </div>
  )
}
