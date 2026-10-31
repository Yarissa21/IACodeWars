import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { abrirExpediente, listarExpedientes, obtenerExpediente } from '../api/expedientes'
import type { Expediente } from '../tipos/expediente'

export const clavesExpedientes = {
  todas: ['expedientes'] as const,
  lista: (termino: string) => ['expedientes', 'lista', termino] as const,
  detalle: (codigo: string) => ['expedientes', 'detalle', codigo] as const,
}

export function useListaExpedientes(termino: string) {
  return useQuery({
    queryKey: clavesExpedientes.lista(termino),
    queryFn: () => listarExpedientes(termino),
    placeholderData: keepPreviousData,
  })
}

export function useExpediente(codigo: string) {
  return useQuery({
    queryKey: clavesExpedientes.detalle(codigo),
    queryFn: () => obtenerExpediente(codigo),
  })
}

function useAlGuardar() {
  const clienteQuery = useQueryClient()
  return async (expediente: Expediente) => {
    clienteQuery.setQueryData(clavesExpedientes.detalle(expediente.id), expediente)
    await clienteQuery.invalidateQueries({ queryKey: clavesExpedientes.todas })
  }
}

export function useAbrirExpediente() {
  const alGuardar = useAlGuardar()
  return useMutation({ mutationFn: abrirExpediente, onSuccess: alGuardar })
}
