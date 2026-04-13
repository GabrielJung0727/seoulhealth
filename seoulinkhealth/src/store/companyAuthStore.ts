import { create } from 'zustand'

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface CompanyInfo {
  id: string
  email: string
  companyName: string
  contactPerson: string
  tempPassword: boolean
  telephone: string
  dialCode: string
  country: string
  industry: string
}

interface CompanyAuthState {
  token: string | null
  company: CompanyInfo | null
  setAuth: (token: string, company: CompanyInfo) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

const TOKEN_KEY = 'sih_company_token'
const INFO_KEY = 'sih_company_info'

/* ─── Store ──────────────────────────────────────────────────────────────── */
export const useCompanyAuthStore = create<CompanyAuthState>((set, get) => ({
  // Rehydrate from sessionStorage on load
  token: sessionStorage.getItem(TOKEN_KEY) ?? null,
  company: (() => {
    try {
      const raw = sessionStorage.getItem(INFO_KEY)
      return raw ? (JSON.parse(raw) as CompanyInfo) : null
    } catch {
      return null
    }
  })(),

  setAuth: (token, company) => {
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(INFO_KEY, JSON.stringify(company))
    set({ token, company })
  },

  clearAuth: () => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(INFO_KEY)
    set({ token: null, company: null })
  },

  isAuthenticated: () => {
    const { token } = get()
    if (!token) return false

    // Decode JWT expiry without a library
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(INFO_KEY)
        set({ token: null, company: null })
        return false
      }
    } catch {
      return false
    }

    return true
  },
}))
