/**
 * SEOULINKHEALTH — Global TypeScript Type Definitions
 */

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface ApplicationFormData {
  fullName: string
  email: string
  telephone: string
  countryCode: string
  professionalExperiences: string
  education: string
  specialty: string
  countryOfOrigin: string
  /** Honeypot field — must be empty on submission */
  _trap?: string
}

export interface InquiryFormData {
  fullName: string
  email: string
  telephone: string
  countryCode: string
  currentEmployment: string
  professionalExperiences: string
  inquirySubject: string
  inquiryDescription: string
  additionalComments?: string
  /** Honeypot field — must be empty on submission */
  _trap?: string
}

// ─── Submission Types ─────────────────────────────────────────────────────────

export type SubmissionStatus = 'New' | 'Reviewed' | 'Contacted'
export type SubmissionType = 'application' | 'inquiry'

export interface BaseSubmission {
  id: string
  type: SubmissionType
  status: SubmissionStatus
  submittedAt: string // ISO date string
}

export interface ApplicationSubmission extends BaseSubmission {
  type: 'application'
  data: ApplicationFormData
}

export interface InquirySubmission extends BaseSubmission {
  type: 'inquiry'
  data: InquiryFormData
}

export type Submission = ApplicationSubmission | InquirySubmission

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type ModalType = 'application' | 'inquiry' | null

export interface NavLink {
  label: string
  href: string
}

// ─── Process Step Type ────────────────────────────────────────────────────────

export interface ProcessStep {
  step: number
  title: string
  description: string
}
