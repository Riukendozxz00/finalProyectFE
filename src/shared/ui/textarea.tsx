import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-kleep-ink">
      {label}
      <textarea
        className={cn(
          'min-h-24 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-kleep-ink outline-none transition placeholder:text-slate-400 hover:border-kleep-blue/30 focus:border-kleep-blue focus:ring-2 focus:ring-kleep-soft',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  )
}
