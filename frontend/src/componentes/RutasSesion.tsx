import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useSesionServidor } from '../hooks/useAuth'
import { ErrorApi } from '../lib/http'
import { useSesion } from '../store/sesion'

interface EstadoNavegacion {
  desde?: string
}

function PantallaCarga() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="size-5 animate-spin rounded-full border-2 border-marca-600 border-r-transparent" />
        Verificando tu sesión…
      </div>
    </div>
  )
}

export function RutaProtegida() {
  const usuario = useSesion((estado) => estado.usuario)
  const establecerUsuario = useSesion((estado) => estado.establecerUsuario)
  const limpiarSesion = useSesion((estado) => estado.limpiarSesion)
  const consulta = useSesionServidor()
  const ubicacion = useLocation()

  useEffect(() => {
    if (consulta.data) {
      establecerUsuario(consulta.data)
    }
  }, [consulta.data, establecerUsuario])

  useEffect(() => {
    if (consulta.error instanceof ErrorApi && consulta.error.estado === 401) {
      limpiarSesion()
    }
  }, [consulta.error, limpiarSesion])

  if (!usuario && consulta.isPending) {
    return <PantallaCarga />
  }

  if (!usuario) {
    const estado: EstadoNavegacion = { desde: `${ubicacion.pathname}${ubicacion.search}` }
    return <Navigate to="/ingresar" replace state={estado} />
  }

  return <Outlet />
}

export function RutaPublica() {
  const usuario = useSesion((estado) => estado.usuario)
  const ubicacion = useLocation()
  if (usuario) {
    const estado: unknown = ubicacion.state
    const desde =
      typeof estado === 'object' && estado !== null && 'desde' in estado && typeof estado.desde === 'string'
        ? estado.desde
        : '/expedientes'
    return <Navigate to={desde} replace />
  }
  return <Outlet />
}
