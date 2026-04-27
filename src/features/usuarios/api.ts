import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/shared/api/endpoints'
import { httpClient } from '@/shared/api/httpClient'
import { queryKeys } from '@/shared/api/queryKeys'
import { parseApiData, toArray } from '@/shared/api/response'
import type {
  CrearUsuarioRequest,
  ModificarUsuarioRequest,
  Usuario,
  UsuarioOption,
} from './types'

export function useUsuarios(empleadoId: string) {
  return useQuery({
    queryKey: queryKeys.usuarios.list(empleadoId),
    enabled: Boolean(empleadoId),
    queryFn: async () => {
      const response = await httpClient.get(endpoints.usuarios.listar(empleadoId))
      return toArray<Usuario>(parseApiData(response.data))
    },
  })
}

export function useUsuariosOptions(empleadoId: string) {
  return useQuery({
    queryKey: queryKeys.usuarios.options(empleadoId),
    enabled: Boolean(empleadoId),
    queryFn: async () => {
      const response = await httpClient.get(endpoints.usuarios.listar(empleadoId))
      return toArray<Usuario>(parseApiData(response.data)).map<UsuarioOption>(
        (usuario) => {
          const record = usuario as Record<string, unknown>
          const value = String(
            usuario.id ??
              usuario.idUsuario ??
              usuario.empleadoId ??
              record.ownId ??
              record.usuarioId ??
              record.usuario_id ??
              record.empleado_id ??
              '',
          )
          const fullName = `${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`.trim()
          const posicion =
            usuario.posicion ??
            usuario.posicion_id ??
            usuario.posicionId ??
            'Sin posicion'
          const region = usuario.region ?? usuario.regionId ?? 'Sin region'

          return {
            value,
            label: `${fullName || value} - ${posicion} (${region})`,
            usuario,
          }
        },
      )
    },
  })
}

export function useUsuarioDetalle(empleadoId: string) {
  return useQuery({
    queryKey: queryKeys.usuarios.detail(empleadoId),
    enabled: Boolean(empleadoId),
    queryFn: async () => {
      const response = await httpClient.get(endpoints.usuarios.detalle(empleadoId))
      const data = parseApiData<{ usuario?: Usuario; user?: Usuario } | Usuario>(
        response.data,
      )
      if ('usuario' in Object(data)) return (data as { usuario: Usuario }).usuario
      if ('user' in Object(data)) return (data as { user: Usuario }).user
      return data as Usuario
    },
  })
}

export function useEquipo(empleadoId: string) {
  return useQuery({
    queryKey: queryKeys.usuarios.team(empleadoId),
    enabled: Boolean(empleadoId),
    queryFn: async () => {
      const response = await httpClient.get(endpoints.usuarios.equipo(empleadoId))
      return toArray<Usuario>(parseApiData(response.data))
    },
  })
}

export function useCrearUsuario(idEjecutivo: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CrearUsuarioRequest) => {
      const response = await httpClient.post(
        endpoints.usuarios.crear(idEjecutivo),
        payload,
      )
      return parseApiData<Usuario>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.all })
    },
  })
}

export function useModificarUsuario(idEjecutivo: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ModificarUsuarioRequest) => {
      const response = await httpClient.put(
        endpoints.usuarios.modificar(idEjecutivo),
        payload,
      )
      return parseApiData<Usuario>(response.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.all })
    },
  })
}
