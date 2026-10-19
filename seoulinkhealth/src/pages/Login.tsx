import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/utils/api'
import { SITE_CONFIG } from '@/config/site'
import { usePageTitle } from '@/hooks/usePageTitle'
import './Auth.css'

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
    <div className="auth-page auth-page--admin">
      {/* ── Background: Seoul skyline, dark institutional overlay, grid ── */}
      <img
        className="auth-bg-image"
        src="/images/seoulinkhealth-hero.png"
        alt=""
        aria-hidden="true"
      />
      <div className="auth-bg-overlay" aria-hidden="true" />
      <div className="auth-bg-grid" aria-hidden="true" />

      {/* Decorative orbital arcs & botanical corner */}
      <svg
        className="auth-bg-arcs"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <circle cx="220" cy="450" r="400" fill="none" stroke="#C99A3D" strokeWidth="0.8" strokeDasharray="2 8" />
        <circle cx="1220" cy="450" r="480" fill="none" stroke="#C99A3D" strokeWidth="0.8" />
        <path d="M0 620Q480 360 960 600T1440 440" fill="none" stroke="#af853d" strokeWidth="1.2" />
      </svg>
      <svg className="auth-bg-leaf" viewBox="0 0 170 260" aria-hidden="true">
        <path d="M160 260Q96 170 112 18M126 214Q44 220 16 168Q84 158 126 214ZM110 170Q150 140 160 92Q110 104 110 170ZM108 126Q52 122 34 70Q92 80 108 126ZM110 84Q140 44 124 6Q94 40 110 84Z" />
        <path d="M16 168L126 214M34 70L108 126M160 92L110 170M124 6L110 84M40 172L104 204M58 84L100 118" />
      </svg>

      {/* ── Left Editorial Annotation (Desktop) ── */}
      <aside className="auth-annotation auth-annotation--left" aria-hidden="true">
        <p>
          GLOBAL
          <br />
          EXPERTISE
          <br />
          FOR A<br />
          HEALTHIER
          <br />
          TOMORROW.
        </p>
        <span>SEOUL · K-HEALTH · GLOBAL</span>
      </aside>

      {/* ── Right Editorial Annotation (Desktop) ── */}
      <aside className="auth-annotation auth-annotation--right" aria-hidden="true">
        <p>
          STRATEGIC
          <br />
          PLATFORM
          <br />
          FOR K-HEALTH
          <br />
          INNOVATION
        </p>
      </aside>

      {/* ── Main Form Shell ── */}
      <div className="auth-shell">
        {/* Brand Logo */}
        <div className="auth-brand">
          <Link to="/" aria-label="SEOULINKHEALTH Home">
            <img
              src="/seoulinkhealth-logo-transparent.png"
              alt="SEOULINKHEALTH — K-Health Business Platform"
              className="auth-brand-logo"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="auth-card__header">
            {/* Security Shield Badge */}
            <div className="auth-badge" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <span className="auth-eyebrow">Internal Access</span>
            <h1 className="auth-card__title auth-card__title--admin">{L.loginTitle}</h1>
            <p className="auth-card__desc">
              서울링크헬스 관리자 대시보드에 로그인하여 문의, 문서 및 프로젝트를 관리하세요.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
            {/* Password */}
            <div className="auth-field">
              <label htmlFor="admin-login-password" className="auth-label">
                {L.password} <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="auth-input-wrapper">
                <svg
                  className="auth-input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <input
                  {...register('password')}
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`auth-input${errors.password ? ' has-error' : ''}`}
                  placeholder={L.passwordPlaceholder}
                  aria-invalid={!!errors.password}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="auth-toggle-pwd"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                      <path d="M10.748 13.93l2.523 2.524a10.065 10.065 0 01-3.271.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="auth-error" role="alert">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0V5zm-.75 6.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="auth-error-banner" role="alert">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0V5zm-.75 6.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className={`auth-submit-btn${loading ? ' auth-submit-btn--loading' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-[#e3bb68]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>{L.authenticating}</span>
                </>
              ) : (
                <>
                  <span>{L.signIn}</span>
                  <span className="auth-submit-btn__arrow" aria-hidden="true">→</span>
                </>
              )}
            </button>

            <p className="auth-card__note">{L.loginFooter}</p>
          </form>
        </div>

        {/* ── Footer Supporting Link to Company Login ── */}
        <div className="auth-footer-links">
          <Link to="/company/login" className="auth-cross-link" aria-label="기업 회원 로그인으로 이동">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
            Company Login
          </Link>
        </div>
      </div>
    </div>
  )
}
