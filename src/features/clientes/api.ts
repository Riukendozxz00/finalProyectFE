import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/shared/api/endpoints'
import { httpClient } from '@/shared/api/httpClient'
import { queryKeys } from '@/shared/api/queryKeys'
import { parseApiData, toArray } from '@/shared/api/response'
import type {
  Cliente,
  ClienteFilters,
  ClienteOption,
  CrearClienteRequest,
  ModificarClienteRequest,
} from './types'

export function useClientes(idUsuario: string, filters: ClienteFilters) {
  return useQuery({
    queryKey: queryKeys.clientes.list(idUsuario, filters),
    enabled: Boolean(idUsuario),
    queryFn: async () => {
      const response = await httpClient.get(endpoints.clientes.listar(idUsuario), {
        params: filters,
      })
      return toArray<Cliente>(parseApiData(response.data))
    },
  })
}

export function useClientesOptions(idUsuario: string) {
  return useQuery({
    queryKey: ['clientes', 'options', idUsuario] as const,
    enabled: Boolean(idUsuario),
    queryFn: async () => {
      const response = await httpClient.get(endpoints.clientes.listar(idUsuario))
      return toArray<Cliente>(parseApiData(response.data)).map<ClienteOption>(
        (cliente) => {
          const record = cliente as Record<string, unknown>
          const value = String(
            cliente.id ??
              cliente.clienteId ??
              cliente.cliente_id ??
              record.idCliente ??
              '',
          )
          const credito = cliente.limite_credito ?? cliente.limiteCredito
          const meta = [
            cliente.localidad,
            cliente.ejecutivo_nombre,
            credito !== undefined ? `Credito ${credito}` : undefined,
          ]
            .filter(Boolean)
            .join(' · ')

          return {
            value,
            label: meta ? `${cliente.nombre} - ${meta}` : cliente.nombre,
            cliente,
          }
        },
      )
    },
  })
}

export function useClienteDetalle(idUsuario: string, clienteId?: string) {
  return useQuery({
    queryKey: clienteId
      ? queryKeys.clientes.detail(idUsuario, clienteId)
      : ['clientes', 'detail'],
    enabled: Boolean(idUsuario && clienteId),
    queryFn: async () => {
      const response = await httpClient.get(
        endpoints.clientes.detalle(idUsuario, clienteId ?? ''),
      )
      const data = parseApiData<{ cliente?: Cliente } | Cliente>(response.data)
      return 'cliente' in Object(data)
        ? (data as { cliente: Cliente }).cliente
        : (data as Cliente)
    },
  })
}

export function useCrearCliente(idUsuario: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CrearClienteRequest) => {
      const response = await httpClient.post(
        endpoints.clientes.agregar(idUsuario),
        payload,
      )
      return parseApiData<Cliente>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
    },
  })
}

export function useModificarCliente(idUsuario: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      clienteId,
      payload,
    }: {
      clienteId: string
      payload: ModificarClienteRequest
    }) => {
      const response = await httpClient.put(
        endpoints.clientes.modificar(idUsuario, clienteId),
        payload,
      )
      return parseApiData<Cliente>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
    },
  })
}

export function useEliminarCliente(idUsuario: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (clienteId: string) => {
      const response = await httpClient.delete(
        endpoints.clientes.eliminar(idUsuario, clienteId),
      )
      return parseApiData(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
    },
  })
}

export function useReactivarCliente(idUsuario: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (clienteId: string) => {
      const response = await httpClient.put(
        endpoints.clientes.reactivar(idUsuario, clienteId),
      )
      return parseApiData(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
    },
  })
}
