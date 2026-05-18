import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSessionStore } from '@/features/auth/session'
import { EmptyState } from '@/shared/ui/empty-state'
import { Skeleton } from '@/shared/ui/skeleton'

export function PrivateRoute() {
  const user = useSessionStore((state) => state.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function PermissionRoute({
  permission,
  children,
}: {
  permission: string
  children: ReactNode
}) {
  const can = useSessionStore((state) => state.can)
  const permissionsLoaded = useSessionStore((state) => state.permissionsLoaded)

  if (!permissionsLoaded) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!can(permission)) {
    return (
      <EmptyState
        title="Sin acceso"
        description="Tu usuario no tiene permiso para ver este modulo."
      />
    )
  }

  return children
}
