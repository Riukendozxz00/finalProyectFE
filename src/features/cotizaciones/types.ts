export interface Cotizacion {
  id?: number | string
  cotizacionId?: number | string
  folio?: string | null
  subtotal: number
  cta_credito_id?: number | null
  ejecutivo_id?: number | null
  ejecutivo_nombre?: string
  [key: string]: unknown
}

export interface CrearCotizacionRequest {
  folio?: string | null
  subtotal: number
  cta_credito_id?: number | null
  ejecutivo_id?: number | null
}

export type ModificarCotizacionRequest = Partial<CrearCotizacionRequest>
