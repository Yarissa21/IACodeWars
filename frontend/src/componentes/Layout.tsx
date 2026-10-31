import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useCerrarSesion } from '../hooks/useAuth'
import { useSesion } from '../store/sesion'
import { Icono, type NombreIcono } from './Icono'
import { Logo } from './Logo'

interface Enlace {
  ruta: string
  texto: string
  icono: NombreIcono
}

const ENLACES: Enlace[] = [
  { ruta: '/expedientes', texto: 'Expedientes', icono: 'carpeta' },
  { ruta: '/expedientes/nuevo', texto: 'Abrir expediente', icono: 'mas' },
]

function iniciales(nombre: string): string {
  const partes = nombre.split(' ').filter((parte) => parte !== '')
  const primera = partes[0]?.[0] ?? ''
  const segunda = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : ''
  return `${primera}${segunda}`.toUpperCase()
}

function claseEnlace({ isActive }: { isActive: boolean }): string {
  return `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/10 text-white' : 'text-marca-200 hover:bg-white/5 hover:text-white'
  }`
}

function Navegacion() {
  return (
    <nav aria-label="Principal" className="space-y-1">
      {ENLACES.map((enlace) => (
        <NavLink key={enlace.ruta} to={enlace.ruta} end className={claseEnlace}>
          {({ isActive }) => (
            <>
              <Icono
                nombre={enlace.icono}
                className={`size-5 ${isActive ? 'text-acento-400' : 'text-marca-400 group-hover:text-marca-200'}`}
              />
              {enlace.texto}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function PanelUsuario() {
  const usuario = useSesion((estado) => estado.usuario)
  const cerrarSesion = useCerrarSesion()
  const navegar = useNavigate()

  async function salir() {
    await cerrarSesion.mutateAsync().catch(() => undefined)
    toast.success('Cerraste sesión.')
    void navegar('/ingresar', { replace: true })
  }

  if (!usuario) {
    return null
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-acento-500 text-xs font-bold text-marca-950">
        {iniciales(usuario.nombre)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{usuario.nombre}</p>
        <p className="text-xs text-marca-300">Sesión activa</p>
      </div>
      <button
        type="button"
        onClick={() => void salir()}
        disabled={cerrarSesion.isPending}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className="rounded-lg p-2 text-marca-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento-400"
      >
        <Icono nombre="salir" className="size-5" />
      </button>
    </div>
  )
}

function ContenidoLateral() {
  return (
    <div className="flex h-full flex-col gap-8 px-4 py-6">
      <div className="px-2">
        <Logo claro />
      </div>
      <div className="flex-1">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-marca-400">Menú</p>
        <Navegacion />
      </div>
      <PanelUsuario />
    </div>
  )
}

export function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const ubicacion = useLocation()

  useEffect(() => {
    setMenuAbierto(false)
  }, [ubicacion.pathname])

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 bg-marca-950 lg:block">
        <ContenidoLateral />
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between bg-marca-950 px-4 py-3 lg:hidden">
        <Logo claro compacto />
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          className="rounded-lg p-2 text-marca-200 hover:bg-white/10 hover:text-white"
        >
          <Icono nombre="menu" />
        </button>
      </header>

      {menuAbierto ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
            className="absolute inset-0 bg-marca-950/60 backdrop-blur-sm"
          />
          <div className="relative h-full w-72 max-w-[85vw] bg-marca-950 shadow-2xl">
            <button
              type="button"
              onClick={() => setMenuAbierto(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-5 rounded-lg p-2 text-marca-300 hover:bg-white/10 hover:text-white"
            >
              <Icono nombre="cerrar" />
            </button>
            <ContenidoLateral />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-68">
        <div role="note" className="border-b border-amber-200 bg-amber-50">
          <p className="mx-auto max-w-6xl px-4 py-2 text-sm text-amber-900 sm:px-6 lg:px-10">
            <strong className="font-semibold">Aviso:</strong> todos los datos son ficticios y se usan con fines
            académicos. Esta aplicación no ofrece asesoría jurídica.
          </p>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
