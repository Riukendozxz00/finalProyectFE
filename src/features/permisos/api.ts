import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/shared/api/endpoints'
import { httpClient } from '@/shared/api/httpClient'
import { queryKeys } from '@/shared/api/queryKeys'
import { parseApiData, toArray } from '@/shared/api/response'
import type { CambiarPermisoPayload, CambiarTodosPayload, Grupo, Permiso } from './types'

export function useGruposPorUsuario(id: string) {
  return useQuery({
    queryKey: queryKeys.permisos.gruposUsuario(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await httpClient.post(endpoints.permisos.gruposPorUsuario(id))
      return toArray<Grupo>(parseApiData(response.data))
    },
  })
}

export function useTodosGrupos(empleadoId: string) {
  return useQuery({
    queryKey: queryKeys.permisos.gruposTodos(empleadoId),
    enabled: Boolean(empleadoId),
    queryFn: async () => {
      const response = await httpClient.get(endpoints.permisos.gruposTodos(empleadoId))
      return toArray<Grupo>(parseApiData(response.data))
    },
  })
}

export function usePermisosPorGrupo(empleadoId: string, groupId: string) {
  return useQuery({
    queryKey: queryKeys.permisos.grupo(empleadoId, groupId),
    enabled: Boolean(empleadoId && groupId),
    queryFn: async () => {
      const response = await httpClient.get(
        endpoints.permisos.permisosPorGrupo(empleadoId, groupId),
      )
      return toArray<Permiso>(parseApiData(response.data))
    },
  })
}

export function usePermisosPorGrupoPost(userId: string, groupId: string) {
  return useQuery({
    queryKey: ['permisos', 'grupo-post', userId, groupId],
    enabled: Boolean(userId && groupId),
    queryFn: async () => {
      const response = await httpClient.post(
        endpoints.permisos.permisosPorGrupoPost(userId, groupId),
      )
      return toArray<Permiso>(parseApiData(response.data))
    },
  })
}

export function usePermisosPorPosicion(
  empleadoId: string,
  groupId: string,
  positionId: string,
) {
  return useQuery({
    queryKey: queryKeys.permisos.posicion(empleadoId, groupId, positionId),
    enabled: Boolean(empleadoId && groupId && positionId),
    queryFn: async () => {
      const response = await httpClient.get(
        endpoints.permisos.permisosPorPosicion(empleadoId, groupId, positionId),
      )
      return toArray<Permiso>(parseApiData(response.data))
    },
  })
}

export function useCambiarPermiso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CambiarPermisoPayload) => {
      const response = await httpClient.post(
        endpoints.permisos.permisoAccion(
          payload.asignador,
          payload.groupId,
          payload.RolAsignado,
          payload.permissionId,
          payload.accion,
        ),
      )
      return parseApiData(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permisos.all })
    },
  })
}

export function useCambiarTodosPermisos() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CambiarTodosPayload) => {
      const response = await httpClient.post(
        endpoints.permisos.todosAccion(
          payload.asignador,
          payload.groupId,
          payload.RolAsignado,
          payload.accion,
        ),
      )
      return parseApiData(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permisos.all })
    },
  })
}
