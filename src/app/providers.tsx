import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { setUnauthorizedHandler } from '@/shared/api/httpClient'
import { useSessionStore } from '@/features/auth/session'
import { fetchUserPermissions } from '@/features/permisos/api'
import { ToastProvider } from '@/shared/ui/toast'

function PermissionsLoader() {
  const user = useSessionStore((state) => state.user)
  const permissionsLoaded = useSessionStore((state) => state.permissionsLoaded)
  const setPermissions = useSessionStore((state) => state.setPermissions)

  useEffect(() => {
    if (!user?.id || permissionsLoaded) return

    let cancelled = false

    fetchUserPermissions(user.id)
      .then((permissions) => {
        if (!cancelled) setPermissions(permissions)
      })
      .catch(() => {
        if (!cancelled) setPermissions([])
      })

    return () => {
      cancelled = true
    }
  }, [permissionsLoaded, setPermissions, user?.id])

  return null
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      }),
  )
  const clearSession = useSessionStore((state) => state.clearSession)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
      window.location.assign('/login')
    })
  }, [clearSession])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PermissionsLoader />
        {children}
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
