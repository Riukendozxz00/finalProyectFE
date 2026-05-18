import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setAccessToken } from '@/shared/api/httpClient'

export interface SessionUser {
  id: string
  nombre: string
  rol?: string
  posicionId?: string
  token?: string
}

interface SessionState {
  user: SessionUser | null
  permissions: string[]
  permissionsLoaded: boolean
  setUser: (user: SessionUser) => void
  setPermissions: (permissions: string[]) => void
  can: (permission: string) => boolean
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      permissionsLoaded: false,
      setUser: (user) => {
        setAccessToken(user.token)
        set({ user, permissions: [], permissionsLoaded: false })
      },
      setPermissions: (permissions) => {
        set({ permissions, permissionsLoaded: true })
      },
      can: (permission) => {
        const permissions = get().permissions ?? []
        return permissions.includes(permission)
      },
      clearSession: () => {
        setAccessToken(null)
        set({ user: null, permissions: [], permissionsLoaded: false })
      },
    }),
    {
      name: 'app.session',
      partialize: (state) => ({
        user: state.user,
      }),
    },
  ),
)
