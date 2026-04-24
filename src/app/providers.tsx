import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { setUnauthorizedHandler } from '@/shared/api/httpClient'
import { useSessionStore } from '@/features/auth/session'
import { ToastProvider } from '@/shared/ui/toast'

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
      <ToastProvider>{children}</ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
