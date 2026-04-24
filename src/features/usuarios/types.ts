export interface Usuario {
  id?: number | string
  idUsuario?: number | string
  empleadoId?: number | string
  nombre: string
  apellido?: string
  posicion_id?: number
  posicionId?: number
  posicion?: string
  telefono?: string | null
  correo?: string | null
  regionId?: number
  region?: string
  [key: string]: unknown
}

export interface UsuarioOption {
  label: string
  value: string
  usuario: Usuario
}

export interface CrearUsuarioRequest {
  nombre: string
  apellido: string
  posicion_id: number
  telefono?: string | null
  correo?: string | null
  regionId: number
}

export type UsuarioEditableColumn =
  | 'nombre'
  | 'apellido'
  | 'posicion_id'
  | 'telefono'
  | 'correo'
  | 'regionId'

export interface ModificarUsuarioRequest {
  idUsuario: number
  column: UsuarioEditableColumn
  newValue: string | number | null
}
