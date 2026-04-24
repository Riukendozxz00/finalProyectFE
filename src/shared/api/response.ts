import type { ApiEnvelope } from '@/shared/types/api'

export function parseApiData<T>(response: ApiEnvelope<T>): T {
  if (response && typeof response === 'object') {
    const record = response as Record<string, unknown>
    if ('data' in record) return record.data as T
    if ('result' in record) return record.result as T
    if ('results' in record) return record.results as T
    if ('items' in record) return record.items as T
    if ('item' in record) return record.item as T
  }

  return response as T
}

export function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (!value) return []
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const candidate =
      record.data ??
      record.items ??
      record.results ??
      record.rows ??
      record.content ??
      record.result ??
      record.usuarios ??
      record.clientes ??
      record.bases ??
      record.cuentasCredito ??
      record.cuentas_credito ??
      record.cuentaCredito ??
      record.cotizaciones ??
      record.facturas
    if (Array.isArray(candidate)) return candidate as T[]
  }
  return []
}

export function getMessageFromUnknown(
  error: unknown,
  fallback = 'Ocurrió un error inesperado',
) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>
    if (typeof record.message === 'string') return record.message
  }
  return fallback
}
