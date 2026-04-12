import { create } from 'zustand'

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface AuthState {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
  isAuthenticated: () => boolean
}

const SESSION_KEY = 'sih_admin_token'

/* ─── Store ──────────────────────────────────────────────────────────────── */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Rehydrate from sessionStorage on load
  token: sessionStorage.getItem(SESSION_KEY) ?? null,

  setToken: (token) => {
    sessionStorage.setItem(SESSION_KEY, token)
    set({ token })
  },

  clearToken: () => {
    sessionStorage.removeItem(SESSION_KEY)
    set({ token: null })
  },

  isAuthenticated: () => {
    const { token } = get()
    if (!token) return false

    // Decode JWT expiry without a library — just check exp claim
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        sessionStorage.removeItem(SESSION_KEY)
        set({ token: null })
        return false
      }
    } catch {
      return false
    }

    return true
  },
}))
