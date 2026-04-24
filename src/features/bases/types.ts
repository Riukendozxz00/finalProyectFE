export interface Base {
  id?: number | string
  baseId?: number | string
  cliente_id?: number
  clienteId?: number
  ejecutivo_id?: number | null
  ejecutivoId?: number | null
  direccion?: string | null
  localidad?: string | null
  [key: string]: unknown
}

export interface CrearBaseRequest {
  cliente_id: number
  ejecutivo_id?: number | null
  direccion?: string | null
  localidad?: string | null
}

export interface ModificarBaseRequest {
  cliente_id?: number
  ejecutivo_id?: number | null
  direccion?: string | null
  localidad?: string | null
}
