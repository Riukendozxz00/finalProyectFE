import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSessionStore } from '@/features/auth/session'

export function PrivateRoute() {
  const user = useSessionStore((state) => state.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
