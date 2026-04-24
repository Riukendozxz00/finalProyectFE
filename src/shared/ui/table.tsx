import type { ReactNode } from 'react'
import { EmptyState } from './empty-state'
import { Skeleton } from './skeleton'

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  emptyTitle?: string
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  emptyTitle,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle ?? 'Sin registros'} />
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-[0_12px_32px_rgba(19,20,21,0.05)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-black/5 text-sm">
          <thead className="bg-[#f7f9ff] text-left text-xs font-semibold uppercase tracking-wide text-kleep-ink">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className="px-4 py-3.5">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="transition hover:bg-kleep-soft/50">
                {columns.map((column) => (
                  <td key={column.header} className="px-4 py-3.5 text-kleep-ink">
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
