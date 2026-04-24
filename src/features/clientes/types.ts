export interface Cliente {
  id?: number | string
  clienteId?: number | string
  cliente_id?: number | string
  nombre: string
  direccion?: string | null
  localidad?: string | null
  ejecutivoId?: number
  ejecutivo_nombre?: string
  ejecutivo_posicion?: string
  ejecutivo_region?: string
  cta_credito_id?: number
  limiteCredito?: number
  limite_credito?: number
  total_cotizaciones?: number
  total_facturas?: number
  status?: string
  [key: string]: unknown
}

export interface ClienteOption {
  label: string
  value: string
  cliente: Cliente
}

export interface ClienteFilters {
  nombre?: string
  direccion?: string
  localidad?: string
  ejecutivoId?: number
  limiteCreditoMin?: number
  limiteCreditoMax?: number
  status?: string
}

export interface CrearClienteRequest {
  nombre: string
  direccion?: string | null
}

export interface ModificarClienteRequest {
  nombre?: string
  direccion?: string | null
}
