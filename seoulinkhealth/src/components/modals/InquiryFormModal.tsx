import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import EmailInput from '@/components/ui/EmailInput'
import PhoneInput from '@/components/ui/PhoneInput'
import { submitInquiry, ApiError } from '@/utils/api'
import { useCompanyAuthStore } from '@/store/companyAuthStore'

/* ─── Zod Schema ─────────────────────────────────────────────────────────── */
const inquirySchema = z.object({
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
  currentEmployment: z
    .string()
    .min(2, 'Please provide your current employment information')
    .max(500),
  professionalExperiences: z
    .string()
    .min(10, 'Please describe your professional background')
    .max(2000),
  inquirySubject: z
    .string()
    .min(3, 'Please enter an inquiry subject')
    .max(200),
  inquiryDescription: z
    .string()
    .min(20, 'Please provide more detail in your description')
    .max(3000),
  additionalComments: z
    .string()
    .max(1000)
    .optional(),
  website_url: z.string().max(0, '').optional(), // honeypot — must stay empty
})

type InquiryFormValues = z.infer<typeof inquirySchema>

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface InquiryFormModalProps {
  isOpen: boolean
  onClose: () => void
}

/* ─── Submit state ───────────────────────────────────────────────────────── */
type SubmitState = 'idle' | 'loading' | 'success' | 'error'

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function InquiryFormModal({ isOpen, onClose }: InquiryFormModalProps) {
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
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
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
      if (c.companyName) setValue('currentEmployment', c.companyName)
    }
  }, [isOpen, companyAuth, setValue])

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen])

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      reset()
      setSubmitState('idle')
      setErrorMessage('')
    }, 300)
  }

  const onSubmit = async (data: InquiryFormValues) => {
    // Honeypot check
    if (data.website_url) return

    setSubmitState('loading')
    setErrorMessage('')

    try {
      await submitInquiry({
        fullName: data.fullName,
        email: data.email,
        dialCode: data.dialCode,
        telephone: data.telephone,
        currentEmployment: data.currentEmployment,
        professionalExperiences: data.professionalExperiences,
        inquirySubject: data.inquirySubject,
        inquiryDescription: data.inquiryDescription,
        additionalComments: data.additionalComments,
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
            key="inq-overlay"
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
              key="inq-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="inq-modal-title"
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
                  <span className="section-label mb-1 block">Request Now</span>
                  <h2 id="inq-modal-title" className="text-xl font-bold text-brand-navy">
                    INQUIRY FORM
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

                {submitState === 'success' ? (
                  <SuccessMessage onClose={handleClose} />
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                    {/* Honeypot — visually hidden */}
                    <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                      <label htmlFor="inq_website_url">Website</label>
                      <input id="inq_website_url" type="text" autoComplete="off" {...register('website_url')} tabIndex={-1} />
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

                    {/* Email */}
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

                    {/* Telephone */}
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

                    {/* Current Employment */}
                    <FormField label="Current Employment Information" required error={errors.currentEmployment?.message}>
                      <input
                        {...register('currentEmployment')}
                        className="form-input"
                        placeholder="e.g. Senior Director, Ministry of Health and Welfare"
                        autoComplete="organization-title"
                      />
                    </FormField>

                    {/* Professional Experiences */}
                    <FormField label="Professional Experiences" required error={errors.professionalExperiences?.message}>
                      <textarea
                        {...register('professionalExperiences')}
                        className="form-input resize-none"
                        rows={3}
                        placeholder="Please describe your professional background, roles, and areas of expertise..."
                      />
                    </FormField>

                    {/* ── Inquiry Detail section separator ── */}
                    <div className="pt-2">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-1 h-5 bg-brand-gold rounded-full shrink-0" aria-hidden="true" />
                        <p className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-brand-navy">
                          Inquiry Detail
                        </p>
                        <div className="flex-1 h-px bg-brand-border" aria-hidden="true" />
                      </div>

                      {/* Subject */}
                      <FormField label="Subject" required error={errors.inquirySubject?.message}>
                        <input
                          {...register('inquirySubject')}
                          className="form-input"
                          placeholder="e.g. K-BIO Investment Advisory for Southeast Asian Market"
                          autoComplete="off"
                        />
                      </FormField>
                    </div>

                    {/* Description */}
                    <FormField label="Description" required error={errors.inquiryDescription?.message}>
                      <textarea
                        {...register('inquiryDescription')}
                        className="form-input resize-none"
                        rows={5}
                        placeholder="Please provide a detailed description of your inquiry, including any specific objectives, challenges, or questions you have..."
                      />
                    </FormField>

                    {/* Additional Comments */}
                    <FormField label="Additional Comments" error={errors.additionalComments?.message}>
                      <textarea
                        {...register('additionalComments')}
                        className="form-input resize-none"
                        rows={3}
                        placeholder="Any other information or context you would like to share with us..."
                      />
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
                          'Submit Inquiry'
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
      <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-brand-navy mb-3">Inquiry Submitted</h3>
      <p className="text-brand-muted text-sm leading-relaxed max-w-sm mx-auto mb-8">
        Your inquiry has been submitted successfully. Our Director will review your request
        and contact you within two business days.
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
