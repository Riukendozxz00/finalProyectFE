import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './button'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ open, title, description, children, onClose }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-kleep-ink/45 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white shadow-[0_30px_90px_rgba(19,20,21,0.25)] sm:max-w-2xl sm:rounded-lg">
        <div className="flex items-start justify-between gap-4 border-b border-black/5 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-kleep-ink">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            className="min-h-8 px-2"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
