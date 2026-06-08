import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/shared/api/endpoints'
import { httpClient } from '@/shared/api/httpClient'
import { queryKeys } from '@/shared/api/queryKeys'
import { parseApiData, toArray } from '@/shared/api/response'
import type {
  Cotizacion,
  CrearCotizacionRequest,
  ModificarCotizacionRequest,
} from './types'

export function useCotizaciones(idUsuario: string, clienteId: string) {
  return useQuery({
    queryKey: queryKeys.cotizaciones.byCliente(idUsuario, clienteId),
    enabled: Boolean(idUsuario && clienteId),
    queryFn: async () => {
      const response = await httpClient.get(
        endpoints.cotizaciones.listarPorCliente(idUsuario, clienteId),
      )
      return toArray<Cotizacion>(parseApiData(response.data))
    },
  })
}

export function useCotizacionDetalle(
  idUsuario: string,
  clienteId: string,
  cotizacionId?: string,
) {
  return useQuery({
    queryKey: cotizacionId
      ? queryKeys.cotizaciones.detail(idUsuario, clienteId, cotizacionId)
      : ['cotizaciones', 'detail'],
    enabled: Boolean(idUsuario && clienteId && cotizacionId),
    queryFn: async () => {
      const response = await httpClient.get(
        endpoints.cotizaciones.detalle(idUsuario, clienteId, cotizacionId ?? ''),
      )
      const data = parseApiData<{ cotizacion?: Cotizacion } | Cotizacion>(response.data)
      return 'cotizacion' in Object(data)
        ? (data as { cotizacion: Cotizacion }).cotizacion
        : (data as Cotizacion)
    },
  })
}

export async function getCotizacionDetalle(
  idUsuario: string,
  clienteId: string,
  cotizacionId: string,
) {
  const response = await httpClient.get(
    endpoints.cotizaciones.detalle(idUsuario, clienteId, cotizacionId),
  )
  const data = parseApiData<{ cotizacion?: Cotizacion } | Cotizacion>(response.data)
  return 'cotizacion' in Object(data)
    ? (data as { cotizacion: Cotizacion }).cotizacion
    : (data as Cotizacion)
}

export function useCrearCotizacion(idUsuario: string, clienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CrearCotizacionRequest) => {
      const response = await httpClient.post(
        endpoints.cotizaciones.agregar(idUsuario, clienteId),
        payload,
      )
      return parseApiData<Cotizacion>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cotizaciones.all })
    },
  })
}

export function useModificarCotizacion(idUsuario: string, clienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      cotizacionId,
      payload,
    }: {
      cotizacionId: string
      payload: ModificarCotizacionRequest
    }) => {
      const response = await httpClient.put(
        endpoints.cotizaciones.modificar(idUsuario, clienteId, cotizacionId),
        payload,
      )
      return parseApiData<Cotizacion>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cotizaciones.all })
    },
  })
}

export function useEliminarCotizacion(idUsuario: string, clienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cotizacionId: string) => {
      const response = await httpClient.delete(
        endpoints.cotizaciones.eliminar(idUsuario, clienteId, cotizacionId),
      )
      return parseApiData(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cotizaciones.all })
    },
  })
}
