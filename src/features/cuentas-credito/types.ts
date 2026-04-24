export interface CuentaCredito {
  id?: number | string
  cuentaCreditoId?: number | string
  cliente_id?: number
  clienteId?: number
  limite_credito: number
  limiteCredito?: number
  [key: string]: unknown
}

export interface CrearCuentaCreditoRequest {
  cliente_id: number
  limite_credito: number
}

export interface ModificarCuentaCreditoRequest {
  limite_credito: number
  cliente_id?: number
}
