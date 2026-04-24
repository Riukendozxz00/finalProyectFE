import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { ToastContext, type ToastItem } from './toast-context'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((items) => items.filter((item) => item.id !== id))
  }, [])

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = crypto.randomUUID()
      setToasts((items) => [...items, { ...toast, id }])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[60] grid w-[calc(100%-2rem)] gap-2 sm:w-96">
        {toasts.map((toast) => {
          const Icon =
            toast.variant === 'success'
              ? CheckCircle2
              : toast.variant === 'error'
                ? XCircle
                : Info
          return (
            <div
              key={toast.id}
              className={cn(
                'flex gap-3 rounded-lg border bg-white p-4 shadow-[0_18px_50px_rgba(19,20,21,0.16)]',
                toast.variant === 'success' && 'border-emerald-200',
                toast.variant === 'error' && 'border-red-200',
                toast.variant === 'info' && 'border-kleep-soft',
              )}
            >
              <Icon
                className={cn(
                  'mt-0.5 h-5 w-5 shrink-0',
                  toast.variant === 'success' && 'text-emerald-600',
                  toast.variant === 'error' && 'text-red-600',
                  toast.variant === 'info' && 'text-kleep-blue',
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-kleep-ink">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm text-slate-500">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded p-1 text-slate-400 hover:bg-kleep-soft hover:text-kleep-ink"
                onClick={() => dismiss(toast.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
