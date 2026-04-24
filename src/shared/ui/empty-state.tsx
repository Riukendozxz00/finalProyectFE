import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-kleep-blue/25 bg-white p-10 text-center shadow-[0_12px_32px_rgba(19,20,21,0.04)]">
      <div>
        <h3 className="text-base font-bold text-kleep-ink">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  )
}
