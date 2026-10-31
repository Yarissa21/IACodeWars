import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ingresar, obtenerSesion, registrarUsuario, salir } from '../api/auth'
import { useSesion } from '../store/sesion'
import type { Usuario } from '../tipos/usuario'

export const claveSesion = ['sesion'] as const

export function useSesionServidor() {
  return useQuery({
    queryKey: claveSesion,
    queryFn: obtenerSesion,
    retry: false,
    staleTime: 5 * 60_000,
  })
}

function useAlAutenticar() {
  const clienteQuery = useQueryClient()
  const establecerUsuario = useSesion((estado) => estado.establecerUsuario)
  return (usuario: Usuario) => {
    clienteQuery.clear()
    clienteQuery.setQueryData(claveSesion, usuario)
    establecerUsuario(usuario)
  }
}

export function useIngresar() {
  return useMutation({ mutationFn: ingresar, onSuccess: useAlAutenticar() })
}

export function useRegistrar() {
  return useMutation({ mutationFn: registrarUsuario, onSuccess: useAlAutenticar() })
}

export function useCerrarSesion() {
  const clienteQuery = useQueryClient()
  const limpiarSesion = useSesion((estado) => estado.limpiarSesion)
  return useMutation({
    mutationFn: salir,
    onSettled: () => {
      limpiarSesion()
      clienteQuery.clear()
    },
  })
}
