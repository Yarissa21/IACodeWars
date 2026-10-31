import { useMutation, useQueryClient } from '@tanstack/react-query'
import { abrirExpediente } from '../api/expedientes'
import type { Expediente } from '../tipos/expediente'

export const clavesExpedientes = {
  todas: ['expedientes'] as const,
  detalle: (codigo: string) => ['expedientes', 'detalle', codigo] as const,
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
