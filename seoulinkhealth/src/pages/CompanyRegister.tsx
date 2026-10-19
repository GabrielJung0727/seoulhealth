import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/store/toastStore'
import EmailInput from '@/components/ui/EmailInput'
import PhoneInput from '@/components/ui/PhoneInput'
import CountrySelect from '@/components/ui/CountrySelect'
import { api } from '@/utils/api'
import AuthBackground from '@/components/auth/AuthBackground'
import './Auth.css'

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

  // EmailInput / PhoneInput / CountrySelect register their field without rules;
  // registering here first attaches the rules (react-hook-form keeps them on re-register)
  register('email', {
    required: 'Email address is required',
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' },
  })
  register('telephone', {
    required: 'Telephone is required',
    pattern: { value: /^[\d\s\-().]{5,20}$/, message: 'Please enter a valid phone number' },
  })
  register('countryOfOrigin', { required: 'Please select a country' })

  const onSubmit = async (data: RegisterForm) => {
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
    <div className="auth-page auth-page--company">
      <AuthBackground />

      <div className="auth-shell auth-shell--wide">
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
            <h1 className="auth-card__title">Company Registration</h1>
            <p className="auth-card__desc">
              Create your company account to submit inquiries and follow their progress.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
            <div className="auth-row">
              <TextField
                id="register-company-name"
                label="Company Name"
                placeholder="Enter company name"
                autoComplete="organization"
                error={errors.companyName?.message}
                registration={register('companyName', { required: 'Company name is required' })}
              />
              <TextField
                id="register-contact-person"
                label="Contact Person"
                placeholder="Full name"
                autoComplete="name"
                error={errors.contactPerson?.message}
                registration={register('contactPerson', { required: 'Contact person name is required' })}
              />
            </div>

            <EmailInput
              register={register}
              name="email"
              watch={watch}
              setValue={setValue}
              error={errors.email?.message}
              label="Email Address"
              required
            />

            <div className="auth-row">
              <TextField
                id="register-password"
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                error={errors.password?.message}
                registration={register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
              />
              <TextField
                id="register-confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                registration={register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
              />
            </div>

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

            <div className="auth-row">
              <CountrySelect
                register={register}
                name="countryOfOrigin"
                watch={watch}
                setValue={setValue}
                error={errors.countryOfOrigin?.message}
                label="Country"
                required
              />

              <div className="auth-field">
                <label htmlFor="register-industry" className="auth-label">
                  Industry <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <select
                  {...register('industry', { required: 'Please select an industry' })}
                  id="register-industry"
                  className={`auth-input auth-input--plain auth-select${errors.industry ? ' has-error' : ''}`}
                  aria-invalid={!!errors.industry}
                >
                  <option value="">Select industry...</option>
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.industry && <FieldError message={errors.industry.message} />}
              </div>
            </div>

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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="auth-submit-btn__arrow" aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Footer Supporting Links ── */}
        <div className="auth-footer-links">
          <p className="auth-register-text">
            Already have an account? <Link to="/company/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FieldError({ message }: { message?: string }) {
  return (
    <p className="auth-error" role="alert">
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0V5zm-.75 6.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
      </svg>
      {message}
    </p>
  )
}

function TextField({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  error,
  registration,
}: {
  id: string
  label: string
  type?: string
  placeholder: string
  autoComplete: string
  error?: string
  registration: UseFormRegisterReturn
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">
        {label} <span className="text-red-500" aria-hidden="true">*</span>
      </label>
      <input
        {...registration}
        id={id}
        type={type}
        className={`auth-input auth-input--plain${error ? ' has-error' : ''}`}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
      />
      {error && <FieldError message={error} />}
    </div>
  )
}
