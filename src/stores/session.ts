import { defineStore } from 'pinia'
import authService, { type SessionUser } from '@/services/authService'

const TOKEN_KEY = 'access_token'

/** A dónde va cada rol después de entrar. */
export function homeForRole(role: SessionUser['role'] | null): string {
  return role === 'admin' ? '/admin' : '/academia'
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    user: null as SessionUser | null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (s) => Boolean(s.user),
    isAdmin: (s) => s.user?.role === 'admin',
  },

  actions: {
    setSession(token: string, user: SessionUser) {
      try {
        localStorage.setItem(TOKEN_KEY, token)
      } catch {
        // Modo privado: la sesión dura lo que dure la pestaña.
      }
      this.user = user
    },

    /** Recupera la sesión desde el token guardado. */
    async restore(): Promise<SessionUser | null> {
      if (this.user) return this.user
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) return null

      this.loading = true
      try {
        this.user = await authService.me()
        return this.user
      } catch {
        this.clear()
        return null
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.user = null
      try {
        localStorage.removeItem(TOKEN_KEY)
      } catch {
        /* nada que limpiar */
      }
    },
  },
})
