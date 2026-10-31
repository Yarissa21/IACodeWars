import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  abrirExpediente,
  cerrarExpediente,
  listarExpedientes,
  obtenerExpediente,
  pasarASeguimiento,
  reabrirExpediente,
  registrarActividad,
} from '../api/expedientes'
import type { DatosActividad, DatosMotivo, Expediente } from '../tipos/expediente'

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

function useSincronizarCache() {
  const clienteQuery = useQueryClient()
  return {
    onSuccess: async (expediente: Expediente) => {
      clienteQuery.setQueryData(clavesExpedientes.detalle(expediente.id), expediente)
      await clienteQuery.invalidateQueries({ queryKey: clavesExpedientes.todas })
    },
    onError: async () => {
      await clienteQuery.invalidateQueries({ queryKey: clavesExpedientes.todas })
    },
  }
}

export function useAbrirExpediente() {
  return useMutation({ mutationFn: abrirExpediente, ...useSincronizarCache() })
}

export function useRegistrarActividad(codigo: string) {
  return useMutation({
    mutationFn: (datos: DatosActividad) => registrarActividad(codigo, datos),
    ...useSincronizarCache(),
  })
}

export function usePasarASeguimiento(codigo: string) {
  return useMutation({ mutationFn: () => pasarASeguimiento(codigo), ...useSincronizarCache() })
}

export function useCerrarExpediente(codigo: string) {
  return useMutation({
    mutationFn: (datos: DatosMotivo) => cerrarExpediente(codigo, datos),
    ...useSincronizarCache(),
  })
}

export function useReabrirExpediente(codigo: string) {
  return useMutation({
    mutationFn: (datos: DatosMotivo) => reabrirExpediente(codigo, datos),
    ...useSincronizarCache(),
  })
}
