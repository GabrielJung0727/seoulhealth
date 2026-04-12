import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { companyRegister, ApiError } from '@/utils/api'
import { usePageTitle } from '@/hooks/usePageTitle'
import EmailInput from '@/components/ui/EmailInput'
import PhoneInput from '@/components/ui/PhoneInput'
import CountrySelect from '@/components/ui/CountrySelect'

/* ─── Schema ─────────────────────────────────────────────────────────────── */
const registerSchema = z
  .object({
    companyName: z.string().min(1, 'Company name is required.'),
    contactPerson: z.string().min(1, 'Contact person name is required.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    dialCode: z.string().default('+82'),
    telephone: z.string().optional(),
    countryOfOrigin: z.string().optional(),
    industry: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type RegisterValues = z.infer<typeof registerSchema>

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function CompanyRegisterPage() {
  usePageTitle('Register')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { dialCode: '+82' },
  })

  const onSubmit = async (data: RegisterValues) => {
    setLoading(true)
    setErrorMsg('')
    try {
      await companyRegister({
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email,
        password: data.password,
        dialCode: data.dialCode,
        telephone: data.telephone ?? '',
        countryOfOrigin: data.countryOfOrigin ?? '',
        industry: data.industry ?? '',
      })
      setSuccess(true)
      setTimeout(() => navigate('/company/login'), 3000)
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError ? err.message : 'Connection error. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="admin-layout min-h-[90vh] flex items-center justify-center px-4 bg-brand-cream">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white rounded-2xl shadow-premium border border-brand-border p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-navy mb-3">Registration Successful</h2>
            <p className="text-brand-muted text-lg">
              Your account has been created. You will be redirected to the login page shortly.
            </p>
            <Link
              to="/company/login"
              className="inline-block mt-6 px-8 py-3 rounded-xl bg-brand-navy text-white font-bold hover:bg-brand-teal transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="admin-layout min-h-screen flex items-center justify-center px-4 py-12 bg-brand-cream">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-premium border border-brand-border overflow-hidden">
          {/* Header */}
          <div className="bg-brand-navy px-8 py-8">
            <p className="text-[0.6rem] font-bold tracking-[0.22em] uppercase text-brand-gold/80 mb-2">
              SEOULINKHEALTH
            </p>
            <h1 className="text-2xl font-bold text-white">Create Company Account</h1>
            <p className="text-white/50 text-base mt-1">
              Register to access the company portal
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* Two-column grid for larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Company Name */}
                <div>
                  <label className="block text-base font-bold text-brand-navy mb-2">
                    Company Name<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    {...register('companyName')}
                    type="text"
                    className={`w-full h-14 px-4 text-lg rounded-xl border-2 ${
                      errors.companyName ? 'border-red-400' : 'border-gray-200'
                    } focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors`}
                    placeholder="Your company name"
                  />
                  {errors.companyName && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-base font-bold text-brand-navy mb-2">
                    Contact Person<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    {...register('contactPerson')}
                    type="text"
                    className={`w-full h-14 px-4 text-lg rounded-xl border-2 ${
                      errors.contactPerson ? 'border-red-400' : 'border-gray-200'
                    } focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors`}
                    placeholder="Full name"
                  />
                  {errors.contactPerson && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.contactPerson.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <EmailInput
                register={register}
                name="email"
                watch={watch}
                setValue={setValue}
                error={errors.email?.message}
                label="Email Address"
                required
                className="[&_.form-label]:text-base [&_.form-label]:font-bold [&_.form-label]:text-brand-navy [&_.form-label]:mb-2 [&_.form-input]:h-14 [&_.form-input]:text-lg [&_.form-input]:rounded-xl [&_.form-input]:border-2"
              />

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        {showPassword ? (
                          <>
                            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </>
                        ) : (
                          <>
                            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                            <path d="M10.748 13.93l2.523 2.524a10.065 10.065 0 01-3.271.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-base font-bold text-brand-navy mb-2">
                    Confirm Password<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      className={`w-full h-14 px-4 text-lg rounded-xl border-2 ${
                        errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
                      } focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors`}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy transition-colors p-1"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        {showConfirm ? (
                          <>
                            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </>
                        ) : (
                          <>
                            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                            <path d="M10.748 13.93l2.523 2.524a10.065 10.065 0 01-3.271.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <PhoneInput
                register={register}
                phoneName="telephone"
                dialCodeName="dialCode"
                watch={watch}
                setValue={setValue}
                phoneError={errors.telephone?.message}
                dialCodeError={errors.dialCode?.message}
                label="Telephone"
                className="[&_.form-label]:text-base [&_.form-label]:font-bold [&_.form-label]:text-brand-navy [&_.form-label]:mb-2 [&_.form-input]:h-14 [&_.form-input]:text-lg [&_.form-input]:rounded-xl [&_.form-input]:border-2"
              />

              {/* Country + Industry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CountrySelect
                  register={register}
                  name="countryOfOrigin"
                  watch={watch}
                  setValue={setValue}
                  error={errors.countryOfOrigin?.message}
                  label="Country"
                  className="[&_.form-label]:text-base [&_.form-label]:font-bold [&_.form-label]:text-brand-navy [&_.form-label]:mb-2 [&_.form-input]:h-14 [&_.form-input]:text-lg [&_.form-input]:rounded-xl [&_.form-input]:border-2"
                />

                <div>
                  <label className="block text-base font-bold text-brand-navy mb-2">Industry</label>
                  <input
                    {...register('industry')}
                    type="text"
                    className="w-full h-14 px-4 text-lg rounded-xl border-2 border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors"
                    placeholder="e.g., Healthcare, Pharma"
                  />
                </div>
              </div>

              {/* Error */}
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-6 pt-6 border-t border-brand-border text-center">
              <p className="text-base text-gray-500">
                Already have an account?{' '}
                <Link to="/company/login" className="font-semibold text-brand-teal hover:text-brand-navy transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
