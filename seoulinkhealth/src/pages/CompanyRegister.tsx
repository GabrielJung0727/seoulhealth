import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/store/toastStore'
import EmailInput from '@/components/ui/EmailInput'
import PhoneInput from '@/components/ui/PhoneInput'
import CountrySelect from '@/components/ui/CountrySelect'
import { api } from '@/utils/api'

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface RegisterForm {
  companyName: string
  contactPerson: string
  email: string
  password: string
  confirmPassword: string
  telephone: string
  dialCode: string
  countryOfOrigin: string
  industry: string
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

const INDUSTRY_OPTIONS = [
  'Pharmaceuticals',
  'Medical Devices',
  'Biotechnology',
  'Healthcare Services',
  'Health Food & Nutraceuticals',
  'Hospital & Clinics',
  'Research & Development',
  'Regulatory & Compliance',
  'Distribution & Supply Chain',
  'Other',
]

export default function CompanyRegisterPage() {
  usePageTitle('Company Registration')
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      dialCode: '+82',
      countryOfOrigin: '',
      industry: '',
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.post('/company/auth/register', {
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email,
        password: data.password,
        telephone: data.telephone,
        dialCode: data.dialCode,
        country: data.countryOfOrigin,
        industry: data.industry,
      })
      toast.success('Registration successful! Please log in with your credentials.')
      navigate('/company/login')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      toast.error(message)
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
        className="w-full max-w-lg"
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
            Company Registration
          </h2>
          <p className="text-sm text-brand-muted text-center mb-8">
            Create your company account to get started
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Company Name */}
            <div>
              <label className="form-label">
                Company Name
                <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
              </label>
              <input
                {...register('companyName', { required: 'Company name is required' })}
                type="text"
                className={`form-input${errors.companyName ? ' border-red-400' : ''}`}
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.companyName.message}</p>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <label className="form-label">
                Contact Person
                <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
              </label>
              <input
                {...register('contactPerson', { required: 'Contact person name is required' })}
                type="text"
                className={`form-input${errors.contactPerson ? ' border-red-400' : ''}`}
                placeholder="Full name"
              />
              {errors.contactPerson && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.contactPerson.message}</p>
              )}
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
            />

            {/* Password */}
            <div>
              <label className="form-label">
                Password
                <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
                type="password"
                className={`form-input${errors.password ? ' border-red-400' : ''}`}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">
                Confirm Password
                <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
              </label>
              <input
                {...register('confirmPassword', { required: 'Please confirm your password' })}
                type="password"
                className={`form-input${errors.confirmPassword ? ' border-red-400' : ''}`}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Phone */}
            <PhoneInput
              register={register}
              phoneName="telephone"
              dialCodeName="dialCode"
              watch={watch}
              setValue={setValue}
              phoneError={errors.telephone?.message}
              label="Telephone"
              required
            />

            {/* Country */}
            <CountrySelect
              register={register}
              name="countryOfOrigin"
              watch={watch}
              setValue={setValue}
              error={errors.countryOfOrigin?.message}
              label="Country"
              required
            />

            {/* Industry */}
            <div>
              <label className="form-label">
                Industry
                <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
              </label>
              <select
                {...register('industry', { required: 'Please select an industry' })}
                className={`form-input${errors.industry ? ' border-red-400' : ''}`}
              >
                <option value="">Select industry...</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.industry && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.industry.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center mt-6 text-sm text-white/60">
          Already have an account?{' '}
          <Link to="/company/login" className="text-brand-gold hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
