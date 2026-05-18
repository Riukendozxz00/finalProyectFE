import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/shared/api/endpoints'
import { httpClient } from '@/shared/api/httpClient'
import { queryKeys } from '@/shared/api/queryKeys'
import { parseApiData, toArray } from '@/shared/api/response'
import type { CambiarPermisoPayload, CambiarTodosPayload, Grupo, Permiso } from './types'

const PERMISOS_READ_CONFIG = { skipUnauthorizedHandler: true }

function normalizeWriteResponse(response: { status: number; data: unknown }) {
  const data = parseApiData<{ status?: string } | unknown>(response.data)
  if (
    response.status === 202 ||
    (data &&
      typeof data === 'object' &&
      (data as { status?: unknown }).status === 'RECEIVED')
  ) {
    return { status: 'RECEIVED' as const }
  }
  return data
}

function getGroupId(grupo: Grupo) {
  const record = grupo as Record<string, unknown>
  return String(
    grupo.groupId ??
      grupo.id ??
      record.idGrupo ??
      record.grupoId ??
      record.group_id ??
      '',
  )
}

function getPermissionName(permiso: Permiso) {
  const record = permiso as Record<string, unknown>
  const value =
    permiso.name ??
    permiso.nombre ??
    record.permissionName ??
    record.permiso ??
    record.clave ??
    record.codigo ??
    record.key

  return value === undefined || value === null ? '' : String(value).trim()
}

export async function fetchUserPermissions(userId: string) {
  const gruposResponse = await httpClient.post(
    endpoints.permisos.gruposPorUsuario(userId),
    undefined,
    PERMISOS_READ_CONFIG,
  )
  const grupos = toArray<Grupo>(parseApiData(gruposResponse.data))
  const permissions = new Set<string>()

  await Promise.all(
    grupos.map(async (grupo) => {
      const groupId = getGroupId(grupo)
      if (!groupId) return

      const permisosResponse = await httpClient.post(
        endpoints.permisos.permisosPorGrupoPost(userId, groupId),
        undefined,
        PERMISOS_READ_CONFIG,
      )
      toArray<Permiso>(parseApiData(permisosResponse.data)).forEach((permiso) => {
        const name = getPermissionName(permiso)
        if (name) permissions.add(name)
      })
    }),
  )

  return [...permissions]
}

export function useGruposPorUsuario(id: string) {
  return useQuery({
    queryKey: queryKeys.permisos.gruposUsuario(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await httpClient.post(
        endpoints.permisos.gruposPorUsuario(id),
        undefined,
        PERMISOS_READ_CONFIG,
      )
      return toArray<Grupo>(parseApiData(response.data))
    },
  })
}

export function useTodosGrupos(empleadoId: string) {
  return useQuery({
    queryKey: queryKeys.permisos.gruposTodos(empleadoId),
    enabled: Boolean(empleadoId),
    queryFn: async () => {
      const response = await httpClient.get(
        endpoints.permisos.gruposTodos(empleadoId),
        PERMISOS_READ_CONFIG,
      )
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
        PERMISOS_READ_CONFIG,
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
        undefined,
        PERMISOS_READ_CONFIG,
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
        PERMISOS_READ_CONFIG,
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
      return normalizeWriteResponse(response)
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
      return normalizeWriteResponse(response)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permisos.all })
    },
  })
}
