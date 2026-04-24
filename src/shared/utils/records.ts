export function getRecordId(record: Record<string, unknown>, fallback = '') {
  return String(
    record.id ??
      record.idUsuario ??
      record.empleadoId ??
      record.clienteId ??
      record.baseId ??
      record.cuentaCreditoId ??
      record.cotizacionId ??
      record.facturaId ??
      fallback,
  )
}

export function getDisplayName(record: Record<string, unknown>, fallback = 'Sin nombre') {
  return String(record.nombre ?? record.name ?? record.descripcion ?? fallback)
}

export function emptyToUndefined(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function emptyToNull(value?: string | null) {
  const trimmed = String(value ?? '').trim()
  return trimmed ? trimmed : null
}

export function removeUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>
}
