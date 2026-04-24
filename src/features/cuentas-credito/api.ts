import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/shared/api/endpoints'
import { httpClient } from '@/shared/api/httpClient'
import { queryKeys } from '@/shared/api/queryKeys'
import { parseApiData, toArray } from '@/shared/api/response'
import type {
  CrearCuentaCreditoRequest,
  CuentaCredito,
  ModificarCuentaCreditoRequest,
} from './types'

export function useCuentasCredito(idUsuario: string, clienteId: string) {
  return useQuery({
    queryKey: queryKeys.cuentasCredito.byCliente(idUsuario, clienteId),
    enabled: Boolean(idUsuario && clienteId),
    queryFn: async () => {
      const response = await httpClient.get(
        endpoints.cuentasCredito.listarPorCliente(idUsuario, clienteId),
      )
      return toArray<CuentaCredito>(parseApiData(response.data))
    },
  })
}

export function useCrearCuentaCredito(idUsuario: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CrearCuentaCreditoRequest) => {
      const response = await httpClient.post(
        endpoints.cuentasCredito.agregar(idUsuario),
        payload,
      )
      return parseApiData<CuentaCredito>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cuentasCredito.all })
    },
  })
}

export function useCrearCuentaCreditoPorCliente(idUsuario: string, clienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Pick<CrearCuentaCreditoRequest, 'limite_credito'>) => {
      const response = await httpClient.post(
        endpoints.cuentasCredito.agregarPorCliente(idUsuario, clienteId),
        payload,
      )
      return parseApiData<CuentaCredito>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cuentasCredito.all })
    },
  })
}

export function useModificarCuentaCredito(idUsuario: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      cuentaCreditoId,
      payload,
    }: {
      cuentaCreditoId: string
      payload: ModificarCuentaCreditoRequest
    }) => {
      const response = await httpClient.put(
        endpoints.cuentasCredito.modificar(idUsuario, cuentaCreditoId),
        payload,
      )
      return parseApiData<CuentaCredito>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cuentasCredito.all })
    },
  })
}

export function useEliminarCuentaCredito(idUsuario: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cuentaCreditoId: string) => {
      const response = await httpClient.delete(
        endpoints.cuentasCredito.eliminar(idUsuario, cuentaCreditoId),
      )
      return parseApiData(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cuentasCredito.all })
    },
  })
}
