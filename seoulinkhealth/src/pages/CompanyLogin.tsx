import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useCompanyAuthStore, type CompanyInfo } from '@/store/companyAuthStore'
import { useToast } from '@/store/toastStore'
import EmailInput from '@/components/ui/EmailInput'
import { api } from '@/utils/api'

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface LoginForm {
  email: string
  password: string
}

/* ─── Animation ──────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] },
  }),
}

export default function CompanyLoginPage() {
  usePageTitle('Company Login')
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useCompanyAuthStore((s) => s.setAuth)
  const toast = useToast()

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
      const res = await api.post<{ tempToken: string }>('/company/auth/login', {
        email: data.email,
        password: data.password,
      })
      setTempToken((res as unknown as { tempToken: string }).tempToken || (res.data as { tempToken: string })?.tempToken || '')
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
        tempToken,
        otp: code,
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
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-[#0F2238] to-[#0A1520] flex items-center justify-center px-4 py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold text-white tracking-[0.1em]">
              SEOU<span className="text-[#D4C4A8]">L</span><span className="text-brand-gold">INK</span>HEALTH
            </h1>
            <p className="text-[0.55rem] tracking-[0.25em] text-brand-gold font-bold uppercase mt-1">
              K-HEALTH BUSINESS PLATFORM
            </p>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-premium p-8 sm:p-10">
          <h2 className="text-xl font-bold text-brand-navy mb-1 text-center">
            {step === 'credentials' ? 'Company Login' : 'Verify Your Identity'}
          </h2>
          <p className="text-sm text-brand-muted text-center mb-8">
            {step === 'credentials'
              ? 'Sign in to access your company dashboard'
              : 'Enter the 6-digit code sent to your email'}
          </p>

          {step === 'credentials' ? (
            <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-5">
              <EmailInput
                register={register}
                name="email"
                watch={watch}
                setValue={setValue}
                error={errors.email?.message}
                label="Email Address"
                required
              />

              <div>
                <label className="form-label">
                  Password
                  <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
                </label>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  className={`form-input${errors.password ? ' border-red-400' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.password.message}</p>
                )}
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={async () => {
                    const email = watch('email')
                    if (!email) { toast.error('Please enter your email first.'); return }
                    try {
                      await api.post('/company/auth/forgot-password', { email })
                      toast.success('A temporary password has been sent to your email.')
                    } catch {
                      toast.error('Failed to send reset email. Please try again.')
                    }
                  }}
                  className="text-xs text-brand-teal hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* OTP Inputs */}
              <div className="flex justify-center gap-2 sm:gap-3">
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    className="w-11 h-14 text-center text-xl font-bold border-2 border-brand-border rounded-lg
                               focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none
                               transition-all duration-200"
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>

              {loading && (
                <p className="text-sm text-brand-muted text-center">Verifying...</p>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep('credentials')
                  setOtpValues(['', '', '', '', '', ''])
                }}
                className="text-sm text-brand-teal hover:underline mx-auto block"
              >
                Back to login
              </button>
            </div>
          )}
        </div>

        {/* Register link */}
        <p className="text-center mt-6 text-sm text-white/60">
          Don&apos;t have an account?{' '}
          <Link to="/company/register" className="text-brand-gold hover:underline font-medium">
            Register here
          </Link>
        </p>

        {/* Admin login */}
        <div className="text-center mt-4 pt-4 border-t border-white/10">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors tracking-wider uppercase"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            Admin Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
