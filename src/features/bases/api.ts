import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/shared/api/endpoints'
import { httpClient } from '@/shared/api/httpClient'
import { queryKeys } from '@/shared/api/queryKeys'
import { parseApiData, toArray } from '@/shared/api/response'
import type { Base, CrearBaseRequest, ModificarBaseRequest } from './types'

export function useBases(idUsuario: string, clienteId?: string) {
  return useQuery({
    queryKey: queryKeys.bases.list(idUsuario, clienteId),
    enabled: Boolean(idUsuario),
    queryFn: async () => {
      const response = await httpClient.get(endpoints.bases.listar(idUsuario), {
        params: clienteId ? { clienteId: Number(clienteId) } : undefined,
      })
      return toArray<Base>(parseApiData(response.data))
    },
  })
}

export function useBaseDetalle(idUsuario: string, baseId?: string) {
  return useQuery({
    queryKey: baseId ? queryKeys.bases.detail(idUsuario, baseId) : ['bases', 'detail'],
    enabled: Boolean(idUsuario && baseId),
    queryFn: async () => {
      const response = await httpClient.get(
        endpoints.bases.detalle(idUsuario, baseId ?? ''),
      )
      return parseApiData<Base>(response.data)
    },
  })
}

export function useCrearBase(idUsuario: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CrearBaseRequest) => {
      const response = await httpClient.post(endpoints.bases.agregar(idUsuario), payload)
      return parseApiData<Base>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bases.all })
    },
  })
}

export function useCrearBasePorCliente(idUsuario: string, clienteId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<CrearBaseRequest, 'cliente_id'>) => {
      const response = await httpClient.post(
        endpoints.bases.agregarPorCliente(idUsuario, clienteId ?? ''),
        payload,
      )
      return parseApiData<Base>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bases.all })
    },
  })
}

export function useModificarBase(idUsuario: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      baseId,
      payload,
    }: {
      baseId: string
      payload: ModificarBaseRequest
    }) => {
      const response = await httpClient.put(
        endpoints.bases.modificar(idUsuario, baseId),
        payload,
      )
      return parseApiData<Base>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bases.all })
    },
  })
}

export function useEliminarBase(idUsuario: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (baseId: string) => {
      const response = await httpClient.delete(
        endpoints.bases.eliminar(idUsuario, baseId),
      )
      return parseApiData(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bases.all })
    },
  })
}
