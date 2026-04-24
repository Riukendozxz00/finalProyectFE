import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-black/5 bg-white shadow-[0_14px_40px_rgba(19,20,21,0.06)]',
        className,
      )}
      {...props}
    />
  )
}
