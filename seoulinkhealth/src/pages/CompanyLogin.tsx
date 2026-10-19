import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useCompanyAuthStore, type CompanyInfo } from '@/store/companyAuthStore'
import { useToast } from '@/store/toastStore'
import { api } from '@/utils/api'
import './Auth.css'

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface LoginForm {
  email: string
  password: string
}

/* ─── Page Component ─────────────────────────────────────────────────────── */
export default function CompanyLoginPage() {
  usePageTitle('Company Login')
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useCompanyAuthStore((s) => s.setAuth)
  const toast = useToast()

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/company/dashboard'

  // Focus first OTP input when step changes
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }
  }, [step])

  /* ── Step 1: Email + Password ── */
  const onSubmitCredentials = async (data: LoginForm) => {
    setLoading(true)
    try {
      await api.post('/company/auth/login', {
        email: data.email,
        password: data.password,
      })
      setLoginEmail(data.email)
      setStep('otp')
      toast.success('Verification code sent to your email.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 2: OTP Verification ── */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newValues = [...otpValues]
    newValues[index] = value.slice(-1)
    setOtpValues(newValues)

    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all filled
    if (newValues.every((v) => v !== '') && value) {
      submitOtp(newValues.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newValues = pasted.split('')
      setOtpValues(newValues)
      otpRefs.current[5]?.focus()
      submitOtp(pasted)
    }
  }

  const submitOtp = async (code: string) => {
    setLoading(true)
    try {
      const res = await api.post('/company/auth/verify-otp', {
        email: loginEmail,
        otpCode: code,
      })
      const data = res as unknown as Record<string, unknown>
      const token = (data.token || (data.data as Record<string, unknown>)?.token || '') as string
      const company = (data.company || (data.data as Record<string, unknown>)?.company) as CompanyInfo | undefined
      if (token && company) {
        setAuth(token, company as CompanyInfo)
        toast.success('Login successful!')
        navigate(from, { replace: true })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid verification code.'
      toast.error(message)
      setOtpValues(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page auth-page--company">
      {/* ── Background: Seoul skyline, gradient overlay, architectural grid ── */}
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
        <circle cx="180" cy="450" r="380" fill="none" stroke="#C99A3D" strokeWidth="0.8" strokeDasharray="3 9" />
        <circle cx="1260" cy="450" r="460" fill="none" stroke="#C99A3D" strokeWidth="0.8" />
        <path d="M0 640Q440 380 920 620T1440 460" fill="none" stroke="#af853d" strokeWidth="1.2" />
      </svg>
      <svg className="auth-bg-leaf" viewBox="0 0 170 260" aria-hidden="true">
        <path d="M160 260Q96 170 112 18M126 214Q44 220 16 168Q84 158 126 214ZM110 170Q150 140 160 92Q110 104 110 170ZM108 126Q52 122 34 70Q92 80 108 126ZM110 84Q140 44 124 6Q94 40 110 84Z" />
        <path d="M16 168L126 214M34 70L108 126M160 92L110 170M124 6L110 84M40 172L104 204M58 84L100 118" />
      </svg>

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
            <span className="auth-eyebrow">Client Portal</span>
            <h1 className="auth-card__title">
              {step === 'credentials' ? 'Company Login' : 'Verify Your Identity'}
            </h1>
            <p className="auth-card__desc">
              {step === 'credentials'
                ? 'Sign in to manage your inquiries, documents, and project communication.'
                : `Enter the 6-digit verification code sent to ${loginEmail || 'your email'}.`}
            </p>
          </div>

          {step === 'credentials' ? (
            <form onSubmit={handleSubmit(onSubmitCredentials)} noValidate className="auth-form">
              {/* Email Address */}
              <div className="auth-field">
                <label htmlFor="company-login-email" className="auth-label">
                  Email Address <span className="text-red-500" aria-hidden="true">*</span>
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
                    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
                    <path d="M3.5 6.5 12 13l8.5-6.5" />
                  </svg>
                  <input
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address',
                      },
                    })}
                    id="company-login-email"
                    type="email"
                    autoComplete="email"
                    className={`auth-input${errors.email ? ' has-error' : ''}`}
                    placeholder="name@company.com"
                    aria-invalid={!!errors.email}
                    autoFocus
                  />
                </div>
                {errors.email && (
                  <p className="auth-error" role="alert">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0V5zm-.75 6.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="auth-field">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="company-login-password" className="auth-label !mb-0">
                    Password <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const email = watch('email')
                      if (!email) {
                        toast.error('Please enter your email first.')
                        return
                      }
                      try {
                        await api.post('/company/auth/forgot-password', { email })
                        toast.success('A temporary password has been sent to your email.')
                      } catch {
                        toast.error('Failed to send reset email. Please try again.')
                      }
                    }}
                    className="auth-forgot-link"
                  >
                    Forgot password?
                  </button>
                </div>
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
                    {...register('password', { required: 'Password is required' })}
                    id="company-login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`auth-input${errors.password ? ' has-error' : ''}`}
                    placeholder="Enter your password"
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="auth-toggle-pwd"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="auth-submit-btn__arrow" aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="auth-form">
              {/* 6-digit OTP code */}
              <div className="auth-otp-grid">
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    className="auth-otp-input"
                    aria-label={`Digit ${i + 1}`}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 text-sm text-[#5a6878]">
                  <svg className="animate-spin w-4 h-4 text-[#c99a3d]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Verifying code...</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep('credentials')
                  setOtpValues(['', '', '', '', '', ''])
                }}
                className="auth-otp-back-btn"
              >
                ← Back to credentials
              </button>
            </div>
          )}
        </div>

        {/* ── Footer Supporting Links ── */}
        <div className="auth-footer-links">
          <p className="auth-register-text">
            Don&apos;t have an account?{' '}
            <Link to="/company/register">Register here →</Link>
          </p>

          <Link to="/login" className="auth-cross-link" aria-label="Go to Admin Login">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}
