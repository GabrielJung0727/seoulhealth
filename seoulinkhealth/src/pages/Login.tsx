import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/utils/api'
import { SITE_CONFIG } from '@/config/site'
import { usePageTitle } from '@/hooks/usePageTitle'

const L = SITE_CONFIG.admin.labels

/* ─── Schema ──────────────────────────────────────────────────────────────── */
const loginSchema = z.object({
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
})
type LoginValues = z.infer<typeof loginSchema>

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function LoginPage() {
  usePageTitle('Login')
  const navigate = useNavigate()
  const location = useLocation()
  const setToken = useAuthStore((s) => s.setToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // If already authenticated, redirect immediately
  if (isAuthenticated()) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin'
    navigate(from, { replace: true })
  }

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginValues) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await api.post<never>('/auth/login', { password: data.password })
      const token = (res as unknown as { token: string }).token
      setToken(token)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin'
      navigate(from, { replace: true })
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError
          ? err.statusCode === 401
            ? L.incorrectPassword
            : err.message
          : L.connectionError
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-layout min-h-[90vh] flex items-center justify-center px-4 bg-brand-cream">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-2xl shadow-premium border border-brand-border overflow-hidden">
          {/* Header */}
          <div className="bg-brand-navy px-8 py-8">
            <p className="text-[0.6rem] font-bold tracking-[0.22em] uppercase text-brand-gold/80 mb-2">
              SEOULINKHEALTH
            </p>
            <h1 className="text-2xl font-bold text-white">{L.loginTitle}</h1>
            <p className="text-white/50 text-base mt-1">
              {L.loginSubtitle}
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

              {/* Password field */}
              <div>
                <label className="block text-base font-bold text-brand-navy mb-2">
                  {L.password}<span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full h-14 px-4 text-lg rounded-xl border-2 ${errors.password ? 'border-red-400' : 'border-gray-200'} focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors`}
                    placeholder={L.passwordPlaceholder}
                    autoComplete="current-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                        <path d="M10.748 13.93l2.523 2.524a10.065 10.065 0 01-3.271.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* API error */}
              {errorMsg && (
                <div className="rounded-xl bg-red-50 border-2 border-red-200 px-5 py-4 text-base text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[56px] text-lg font-bold rounded-xl bg-brand-navy text-white hover:bg-brand-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {L.authenticating}
                  </>
                ) : (
                  L.signIn
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-base text-gray-400">{L.loginFooter}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
