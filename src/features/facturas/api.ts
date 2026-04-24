import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/shared/api/endpoints'
import { httpClient } from '@/shared/api/httpClient'
import { queryKeys } from '@/shared/api/queryKeys'
import { parseApiData, toArray } from '@/shared/api/response'
import type { CrearFacturaRequest, Factura, ModificarFacturaRequest } from './types'

export function useFacturas(idUsuario: string, clienteId: string) {
  return useQuery({
    queryKey: queryKeys.facturas.byCliente(idUsuario, clienteId),
    enabled: Boolean(idUsuario && clienteId),
    queryFn: async () => {
      const response = await httpClient.get(
        endpoints.facturas.listarPorCliente(idUsuario, clienteId),
      )
      return toArray<Factura>(parseApiData(response.data))
    },
  })
}

export function useFacturaDetalle(
  idUsuario: string,
  clienteId: string,
  facturaId?: string,
) {
  return useQuery({
    queryKey: facturaId
      ? queryKeys.facturas.detail(idUsuario, clienteId, facturaId)
      : ['facturas', 'detail'],
    enabled: Boolean(idUsuario && clienteId && facturaId),
    queryFn: async () => {
      const response = await httpClient.get(
        endpoints.facturas.detalle(idUsuario, clienteId, facturaId ?? ''),
      )
      const data = parseApiData<{ factura?: Factura } | Factura>(response.data)
      return 'factura' in Object(data)
        ? (data as { factura: Factura }).factura
        : (data as Factura)
    },
  })
}

export function useCrearFactura(idUsuario: string, clienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CrearFacturaRequest) => {
      const response = await httpClient.post(
        endpoints.facturas.agregar(idUsuario, clienteId),
        payload,
      )
      return parseApiData<Factura>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.facturas.all })
    },
  })
}

export function useModificarFactura(idUsuario: string, clienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      facturaId,
      payload,
    }: {
      facturaId: string
      payload: ModificarFacturaRequest
    }) => {
      const response = await httpClient.put(
        endpoints.facturas.modificar(idUsuario, clienteId, facturaId),
        payload,
      )
      return parseApiData<Factura>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.facturas.all })
    },
  })
}

export function useEliminarFactura(idUsuario: string, clienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (facturaId: string) => {
      const response = await httpClient.delete(
        endpoints.facturas.eliminar(idUsuario, clienteId, facturaId),
      )
      return parseApiData(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.facturas.all })
    },
  })
}
