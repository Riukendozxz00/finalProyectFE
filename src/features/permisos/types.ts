export type PermisoAccion = 'add' | 'remove'

export interface Grupo {
  id?: string | number
  groupId?: string | number
  nombre?: string
  name?: string
  descripcion?: string
  [key: string]: unknown
}

export interface Permiso {
  id?: string | number
  permissionId?: string | number
  nombre?: string
  name?: string
  descripcion?: string
  asignado?: boolean
  [key: string]: unknown
}

export interface CambiarPermisoPayload {
  asignador: string
  groupId: string
  RolAsignado: string
  permissionId: string
  accion: PermisoAccion
}

export interface CambiarTodosPayload {
  asignador: string
  groupId: string
  RolAsignado: string
  accion: PermisoAccion
}
