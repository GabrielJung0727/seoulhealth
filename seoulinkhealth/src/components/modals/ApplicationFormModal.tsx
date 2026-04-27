import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { COUNTRIES, PRIORITY_COUNTRIES } from '@/data/countries'
import EmailInput from '@/components/ui/EmailInput'
import PhoneInput from '@/components/ui/PhoneInput'
import { submitApplication, ApiError } from '@/utils/api'
import { useCompanyAuthStore } from '@/store/companyAuthStore'

/* ─── Zod Schema ─────────────────────────────────────────────────────────── */
const applicationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  dialCode: z.string().min(1, 'Please select a country code'),
  telephone: z
    .string()
    .min(5, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[\d\s\-().]+$/, 'Please enter a valid phone number'),
  professionalExperiences: z
    .string()
    .min(10, 'Please provide more detail about your professional experience')
    .max(2000),
  education: z
    .string()
    .min(5, 'Please describe your educational background')
    .max(1000),
  specialty: z
    .string()
    .min(2, 'Please enter your area of specialty')
    .max(200),
  countryOfOrigin: z.string().min(1, 'Please select your country'),
  website_url: z.string().max(0, '').optional(), // honeypot — must stay empty
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface ApplicationFormModalProps {
  isOpen: boolean
  onClose: () => void
}

/* ─── Submission States ──────────────────────────────────────────────────── */
type SubmitState = 'idle' | 'loading' | 'success' | 'error'

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function ApplicationFormModal({ isOpen, onClose }: ApplicationFormModalProps) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const companyAuth = useCompanyAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { dialCode: '+82' },
  })

  // Auto-fill from company profile when modal opens
  useEffect(() => {
    if (isOpen && companyAuth.isAuthenticated() && companyAuth.company) {
      const c = companyAuth.company
      if (c.contactPerson) setValue('fullName', c.contactPerson)
      if (c.email) setValue('email', c.email)
      if (c.dialCode) setValue('dialCode', c.dialCode)
      if (c.telephone) setValue('telephone', c.telephone)
    }
  }, [isOpen, companyAuth, setValue])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen])

  // Reset form when closed
  const handleClose = () => {
    onClose()
    setTimeout(() => { reset(); setSubmitState('idle'); setErrorMessage('') }, 300)
  }

  const onSubmit = async (data: ApplicationFormValues) => {
    // Honeypot check
    if (data.website_url) return

    setSubmitState('loading')
    setErrorMessage('')

    try {
      await submitApplication({
        fullName: data.fullName,
        email: data.email,
        dialCode: data.dialCode,
        telephone: data.telephone,
        professionalExperiences: data.professionalExperiences,
        education: data.education,
        specialty: data.specialty,
        countryOfOrigin: data.countryOfOrigin,
      })
      setSubmitState('success')
    } catch (err) {
      setSubmitState('error')
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      )
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Overlay ── */}
          <motion.div
            key="app-overlay"
            className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* ── Panel ── */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="app-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="app-modal-title"
              className="pointer-events-auto bg-white rounded-2xl shadow-premium-lg
                         w-full max-w-2xl mx-2 sm:mx-4 max-h-[92vh] flex flex-col overflow-hidden"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* ── Modal Header ── */}
              <div className="flex items-start justify-between px-5 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-brand-border shrink-0">
                <div>
                  <span className="section-label mb-1 block">Expert Network</span>
                  <h2 id="app-modal-title" className="text-xl font-bold text-brand-navy">
                    Expert Network Application Form
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="ml-4 mt-0.5 p-1.5 rounded-lg text-brand-muted hover:text-brand-navy
                             hover:bg-brand-cream transition-colors duration-200 shrink-0"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>

              {/* ── Scrollable Body ── */}
              <div className="overflow-y-auto flex-1 px-5 sm:px-8 py-5 sm:py-6">

                {/* SUCCESS STATE */}
                {submitState === 'success' ? (
                  <SuccessMessage onClose={handleClose} />
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                    {/* Honeypot — visually hidden */}
                    <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                      <label htmlFor="app_website_url">Website</label>
                      <input id="app_website_url" type="text" autoComplete="off" {...register('website_url')} tabIndex={-1} />
                    </div>

                    {/* Full Name */}
                    <FormField label="Full Name" required error={errors.fullName?.message}>
                      <input
                        {...register('fullName')}
                        className="form-input"
                        placeholder="Dr. Jane Smith"
                        autoComplete="name"
                      />
                    </FormField>

                    {/* Email — shared component */}
                    <EmailInput
                      register={register}
                      name="email"
                      watch={watch}
                      setValue={setValue}
                      error={errors.email?.message}
                      label="Email Address"
                      required
                      placeholder="you@example.com"
                    />

                    {/* Telephone — shared component */}
                    <PhoneInput
                      register={register}
                      phoneName="telephone"
                      dialCodeName="dialCode"
                      watch={watch}
                      setValue={setValue}
                      phoneError={errors.telephone?.message}
                      dialCodeError={errors.dialCode?.message}
                      label="Telephone"
                      required
                    />

                    {/* Professional Experiences */}
                    <FormField label="Professional Experiences" required error={errors.professionalExperiences?.message}>
                      <textarea
                        {...register('professionalExperiences')}
                        className="form-input resize-none"
                        rows={4}
                        placeholder="Please describe your professional background, roles, and expertise..."
                      />
                    </FormField>

                    {/* Education */}
                    <FormField label="Education" required error={errors.education?.message}>
                      <textarea
                        {...register('education')}
                        className="form-input resize-none"
                        rows={3}
                        placeholder="e.g. Ph.D. in Public Health, Seoul National University"
                      />
                    </FormField>

                    {/* Specialty */}
                    <FormField label="Specialty" required error={errors.specialty?.message}>
                      <input
                        {...register('specialty')}
                        className="form-input"
                        placeholder="e.g. Biopharmaceutical Regulatory Affairs"
                        autoComplete="off"
                      />
                    </FormField>

                    {/* Country of Origin */}
                    <FormField label="Country of Origin" required error={errors.countryOfOrigin?.message}>
                      <select {...register('countryOfOrigin')} className="form-input bg-white cursor-pointer">
                        <option value="">Select country...</option>
                        <optgroup label="— Common —">
                          {PRIORITY_COUNTRIES.map((c) => (
                            <option key={`p-${c.code}`} value={c.code}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="— All Countries —">
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </FormField>

                    {/* Error banner */}
                    {submitState === 'error' && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {errorMessage || 'Submission failed. Please try again.'}
                      </div>
                    )}

                    {/* Submit */}
                    <div className="pt-2 pb-1">
                      <button
                        type="submit"
                        disabled={submitState === 'loading'}
                        className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitState === 'loading' ? (
                          <>
                            <Spinner />
                            Submitting...
                          </>
                        ) : (
                          'Submit Application'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0V5zm-.75 6.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

function SuccessMessage({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-10 px-4"
    >
      {/* Check icon */}
      <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-brand-navy mb-3">Application Submitted</h3>
      <p className="text-brand-muted text-sm leading-relaxed max-w-sm mx-auto mb-8">
        Your application has been submitted successfully. Our team will review your profile and
        contact you with further details regarding the next steps.
      </p>
      <button onClick={onClose} className="btn-primary">
        Close
      </button>
    </motion.div>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin w-4 h-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
