import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-black/5 bg-white px-4 py-3 text-sm text-slate-500 shadow-[0_10px_28px_rgba(19,20,21,0.04)] sm:flex-row sm:items-center sm:justify-between">
      <span>
        Pagina {page} de {totalPages} · {total} registros
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="min-h-9 px-3"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          className="min-h-9 px-3"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
