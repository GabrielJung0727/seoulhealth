import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCompanyAuthStore } from '@/store/companyAuthStore'
import { companyLogin, companyVerifyOTP, companyForgotPassword, ApiError } from '@/utils/api'
import { usePageTitle } from '@/hooks/usePageTitle'
import EmailInput from '@/components/ui/EmailInput'

/* ─── Schemas ────────────────────────────────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})
type LoginValues = z.infer<typeof loginSchema>

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function CompanyLoginPage() {
  usePageTitle('Login')
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useCompanyAuthStore((s) => s.setAuth)
  const isAuthenticated = useCompanyAuthStore((s) => s.isAuthenticated)

  const [step, setStep] = useState<'login' | 'otp'>('login')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', ''])
  const [loginEmail, setLoginEmail] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated()) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/company/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location.state])

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  /* ─── Step 1: Login ───────────────────────────────────────────────────── */
  const onLogin = async (data: LoginValues) => {
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await companyLogin(data.email, data.password)
      setLoginEmail(data.email)
      setStep('otp')
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError
          ? err.statusCode === 401
            ? 'Invalid email or password.'
            : err.message
          : 'Connection error. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* ─── Forgot Password ─────────────────────────────────────────────────── */
  const handleForgotPassword = async () => {
    const email = getValues('email')
    if (!email) {
      setErrorMsg('Please enter your email address first.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await companyForgotPassword(email)
      setSuccessMsg('A temporary password has been sent to your email.')
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError ? err.message : 'Connection error. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* ─── OTP Input Handling ──────────────────────────────────────────────── */
  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return
      const next = [...otpValues]
      next[index] = value.slice(-1)
      setOtpValues(next)

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus()
      }
    },
    [otpValues]
  )

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
        otpRefs.current[index - 1]?.focus()
      }
    },
    [otpValues]
  )

  const handleOtpPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 0) return
    const next = [...Array(6)].map((_, i) => pasted[i] ?? '')
    setOtpValues(next)
    const focusIdx = Math.min(pasted.length, 5)
    otpRefs.current[focusIdx]?.focus()
  }, [])

  /* ─── Step 2: Verify OTP ──────────────────────────────────────────────── */
  const handleVerifyOtp = async () => {
    const code = otpValues.join('')
    if (code.length !== 6) {
      setErrorMsg('Please enter the full 6-digit code.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await companyVerifyOTP(loginEmail, code)
      setAuth(res.token, res.company)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/company/dashboard'
      navigate(from, { replace: true })
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError ? err.message : 'Connection error. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* ─── Render ──────────────────────────────────────────────────────────── */
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
            <h1 className="text-2xl font-bold text-white">Company Portal</h1>
            <p className="text-white/50 text-base mt-1">
              {step === 'login' ? 'Sign in to your account' : 'Enter verification code'}
            </p>
          </div>

          {/* Form area */}
          <div className="px-8 py-8">
            <AnimatePresence mode="wait">
              {step === 'login' ? (
                <motion.form
                  key="login-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit(onLogin)}
                  noValidate
                  className="space-y-5"
                >
                  {/* Email */}
                  <div>
                    <label className="block text-base font-bold text-brand-navy mb-2">
                      Email Address<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <EmailInput
                      name="email"
                      register={register}
                      watch={watch}
                      setValue={setValue}
                      error={errors.email?.message}
                      placeholder="you@company.com"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-base font-bold text-brand-navy mb-2">
                      Password<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className={`w-full h-14 px-4 text-lg rounded-xl border-2 ${
                          errors.password ? 'border-red-400' : 'border-gray-200'
                        } focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors`}
                        placeholder="Enter your password"
                        autoComplete="current-password"
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

                  {/* Forgot Password */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="text-sm font-medium text-brand-teal hover:text-brand-navy transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Messages */}
                  {errorMsg && (
                    <div className="rounded-xl bg-red-50 border-2 border-red-200 px-5 py-4 text-base text-red-700 font-medium">
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="rounded-xl bg-green-50 border-2 border-green-200 px-5 py-4 text-base text-green-700 font-medium">
                      {successMsg}
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
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-brand-navy font-semibold text-lg">Check your email</p>
                    <p className="text-brand-muted text-sm mt-1">
                      We sent a 6-digit verification code to<br />
                      <span className="font-medium text-brand-navy">{loginEmail}</span>
                    </p>
                  </div>

                  {/* OTP Inputs */}
                  <div className="flex justify-center gap-3">
                    {otpValues.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  {/* Error */}
                  {errorMsg && (
                    <div className="rounded-xl bg-red-50 border-2 border-red-200 px-5 py-4 text-base text-red-700 font-medium">
                      {errorMsg}
                    </div>
                  )}

                  {/* Verify Button */}
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading || otpValues.join('').length !== 6}
                    className="w-full min-h-[56px] text-lg font-bold rounded-xl bg-brand-navy text-white hover:bg-brand-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </button>

                  {/* Back to login */}
                  <button
                    type="button"
                    onClick={() => { setStep('login'); setErrorMsg(''); setOtpValues(['', '', '', '', '', '']) }}
                    className="w-full text-sm font-medium text-brand-muted hover:text-brand-navy transition-colors"
                  >
                    Back to login
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Register link */}
            <div className="mt-6 pt-6 border-t border-brand-border text-center">
              <p className="text-base text-gray-500">
                Don&apos;t have an account?{' '}
                <Link to="/company/register" className="font-semibold text-brand-teal hover:text-brand-navy transition-colors">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
