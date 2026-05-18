import type { Cotizacion } from '@/features/cotizaciones/types'
import type { Factura } from '@/features/facturas/types'

export interface Base {
  id?: number | string
  baseId?: number | string
  cliente_id?: number
  clienteId?: number
  cliente_nombre?: string
  clienteNombre?: string
  ejecutivo_id?: number | null
  ejecutivoId?: number | null
  ejecutivo_nombre?: string
  ejecutivoNombre?: string
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

export interface BaseDocumentosFilters {
  fechaInicio?: string
  fechaFin?: string
}

export interface BaseDocumentosResponse {
  base: Base
  fechaInicio?: string
  fechaFin?: string
  cotizaciones: Cotizacion[]
  facturas: Factura[]
}
