export function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function matchesSearch<T extends Record<string, unknown>>(
  row: T,
  search: string,
  fields: Array<keyof T>,
) {
  const normalized = search.trim().toLowerCase()
  if (!normalized) return true

  return fields.some((field) =>
    String(row[field] ?? '')
      .toLowerCase()
      .includes(normalized),
  )
}
