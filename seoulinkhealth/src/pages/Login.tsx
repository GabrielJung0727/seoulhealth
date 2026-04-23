import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/utils/api'
import { SITE_CONFIG } from '@/config/site'
import { usePageTitle } from '@/hooks/usePageTitle'

const L = SITE_CONFIG.admin.labels

const loginSchema = z.object({
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
})
type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  usePageTitle('Admin Login')
  const navigate = useNavigate()
  const location = useLocation()
  const setToken = useAuthStore((s) => s.setToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

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
    <div className="min-h-screen flex items-center justify-center bg-brand-navy relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-teal/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(to right, #B8965A 1px, transparent 1px), linear-gradient(to bottom, #B8965A 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold text-white tracking-[0.1em]">
              SEOU<span className="text-[#C45C4A]">L</span><span className="text-brand-gold">IN</span><span className="text-[#C45C4A]">K</span>HEALTH
            </h1>
            <p className="text-[0.5rem] tracking-[0.25em] text-white/30 font-semibold uppercase mt-1">
              K-Health Business Platform
            </p>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-gold/10 border border-brand-gold/20 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-brand-gold">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">{L.loginTitle}</h2>
            <p className="text-white/40 text-sm mt-1">{L.loginSubtitle}</p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/70 mb-2">
                  {L.password}<span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full h-13 px-4 text-base rounded-xl border bg-white/5 text-white placeholder-white/25 ${
                      errors.password ? 'border-red-400/60' : 'border-white/15'
                    } focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all`}
                    placeholder={L.passwordPlaceholder}
                    autoComplete="current-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
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
                  <p className="mt-2 text-sm text-red-400 font-medium">{errors.password.message}</p>
                )}
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-500/10 border border-red-400/20 px-4 py-3 text-sm text-red-300 font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-13 text-sm font-bold tracking-[0.1em] uppercase rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
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

            <p className="mt-5 text-center text-xs text-white/20">{L.loginFooter}</p>
          </div>
        </div>

        {/* Company login link */}
        <div className="text-center mt-6">
          <Link
            to="/company/login"
            className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors tracking-wider uppercase"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
            </svg>
            Company Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
