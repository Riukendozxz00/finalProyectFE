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
  setUser: (user: SessionUser) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => {
        setAccessToken(user.token)
        set({ user })
      },
      clearSession: () => {
        setAccessToken(null)
        set({ user: null })
      },
    }),
    {
      name: 'app.session',
    },
  ),
)
