import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  rightSlot?: ReactNode
}

export function Input({ label, error, className, rightSlot, ...props }: InputProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-kleep-ink">
      {label}
      <span className="relative">
        <input
          className={cn(
            'min-h-10 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-kleep-ink outline-none transition placeholder:text-slate-400 hover:border-kleep-blue/30 focus:border-kleep-blue focus:ring-2 focus:ring-kleep-soft',
            rightSlot && 'pr-10',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
            className,
          )}
          {...props}
        />
        {rightSlot ? <span className="absolute right-2 top-1.5">{rightSlot}</span> : null}
      </span>
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  )
}
