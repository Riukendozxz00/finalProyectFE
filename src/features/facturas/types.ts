export interface Factura {
  id?: number | string
  facturaId?: number | string
  folio?: string | null
  subtotal: number
  cta_credito_id?: number | null
  ejecutivo_id?: number | null
  cotizacion_id?: number | null
  ejecutivo_nombre?: string
  [key: string]: unknown
}

export interface CrearFacturaRequest {
  folio?: string | null
  subtotal: number
  cta_credito_id?: number | null
  ejecutivo_id?: number | null
  cotizacion_id?: number | null
}

export type ModificarFacturaRequest = Partial<CrearFacturaRequest>
