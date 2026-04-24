import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-kleep-blue text-white shadow-[0_8px_18px_rgba(3,54,157,0.22)] hover:bg-[#022a78] focus-visible:ring-kleep-blue',
  secondary:
    'bg-white text-kleep-ink border border-black/10 hover:border-kleep-blue/30 hover:bg-kleep-soft',
  ghost: 'bg-transparent text-kleep-ink hover:bg-kleep-soft',
  danger:
    'bg-red-600 text-white shadow-[0_8px_18px_rgba(220,38,38,0.18)] hover:bg-red-700 focus-visible:ring-red-500',
}

export function Button({
  className,
  variant = 'primary',
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Procesando...' : children}
    </button>
  )
}
