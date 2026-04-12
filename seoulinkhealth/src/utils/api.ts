/**
 * Lightweight fetch wrapper for SEOULINKHEALTH API calls.
 *
 * Base URL is injected via VITE_API_BASE_URL (defaults to same-origin /api
 * in production, or http://localhost:3001/api in development).
 *
 * Usage:
 *   import { api } from '@/utils/api'
 *   const res = await api.post('/apply', formData)
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
  (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api')

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  error?: string
  data?: T
  id?: string
  details?: unknown
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/* ─── Core request helper ────────────────────────────────────────────────── */
async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json = (await res.json()) as ApiResponse<T>

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.error ?? `Request failed with status ${res.status}`,
      json.details
    )
  }

  return json
}

/* ─── Public API ─────────────────────────────────────────────────────────── */
export const api = {
  get: <T = unknown>(path: string, token?: string) =>
    request<T>('GET', path, undefined, token),

  post: <T = unknown>(path: string, body: unknown, token?: string) =>
    request<T>('POST', path, body, token),

  patch: <T = unknown>(path: string, body: unknown, token?: string) =>
    request<T>('PATCH', path, body, token),

  delete: <T = unknown>(path: string, token?: string) =>
    request<T>('DELETE', path, undefined, token),
}

/* ─── Typed submission helpers ───────────────────────────────────────────── */
export interface ApplicationFormData {
  fullName: string
  email: string
  dialCode: string
  telephone: string
  professionalExperiences: string
  education: string
  specialty: string
  countryOfOrigin: string
  website_url?: string
}

export interface InquiryFormData {
  fullName: string
  email: string
  dialCode: string
  telephone: string
  currentEmployment: string
  professionalExperiences: string
  inquirySubject: string
  inquiryDescription: string
  additionalComments?: string
  website_url?: string
}

export async function submitApplication(data: ApplicationFormData): Promise<string> {
  const res = await api.post<{ id: string }>('/apply', data)
  return res.id ?? ''
}

export async function submitInquiry(data: InquiryFormData): Promise<string> {
  const res = await api.post<{ id: string }>('/inquiry', data)
  return res.id ?? ''
}

/* ─── Admin helpers (auth token required) ───────────────────────────────── */
export interface SubmissionItem {
  id: string
  createdAt: string
  updatedAt: string
  fullName: string
  email: string
  dialCode: string
  telephone: string
  status: 'New' | 'Reviewed' | 'Contacted'
  countryOfOrigin?: string | null
  specialty?: string | null
  education?: string | null
  experiences?: string | null
  currentEmployment?: string | null
  inquirySubject?: string | null
  inquiryDescription?: string | null
  additionalComments?: string | null
  adminNotes?: string | null
  [key: string]: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function adminLogin(password: string): Promise<string> {
  const res = await api.post<{ token: string }>('/admin/login', { password })
  return (res as unknown as { token: string }).token ?? ''
}

export async function getApplications(
  token: string,
  params?: { status?: string; page?: number; limit?: number; search?: string }
): Promise<PaginatedResponse<SubmissionItem>> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.search) qs.set('search', params.search)
  // Backend returns { success, data: [...], pagination: {...} } at top level
  const res = await api.get<SubmissionItem[]>(
    `/admin/applications${qs.toString() ? `?${qs}` : ''}`,
    token
  )
  const raw = res as unknown as { data: SubmissionItem[]; pagination: PaginatedResponse<SubmissionItem>['pagination'] }
  return { data: raw.data ?? [], pagination: raw.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 } }
}

export async function getInquiries(
  token: string,
  params?: { status?: string; page?: number; limit?: number; search?: string }
): Promise<PaginatedResponse<SubmissionItem>> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.search) qs.set('search', params.search)
  const res = await api.get<SubmissionItem[]>(
    `/admin/inquiries${qs.toString() ? `?${qs}` : ''}`,
    token
  )
  const raw = res as unknown as { data: SubmissionItem[]; pagination: PaginatedResponse<SubmissionItem>['pagination'] }
  return { data: raw.data ?? [], pagination: raw.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 } }
}

/* ─── CSV Export ─────────────────────────────────────────────────────────── */
export function exportToCSV(items: SubmissionItem[], type: 'application' | 'inquiry') {
  const appHeaders = ['이름', '이메일', '전화번호', '국가', '전공분야', '학력', '경력', '상태', '제출일']
  const inqHeaders = ['이름', '이메일', '전화번호', '현 직장', '문의 제목', '문의 내용', '추가 사항', '상태', '제출일']

  const headers = type === 'application' ? appHeaders : inqHeaders

  const rows = items.map((item) => {
    const phone = `${item.dialCode ?? ''} ${item.telephone ?? ''}`.trim()
    const date = new Date(item.createdAt).toLocaleDateString('ko-KR', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric',
    })
    if (type === 'application') {
      return [item.fullName, item.email, phone, item.countryOfOrigin ?? '', item.specialty ?? '', item.education ?? '', item.experiences ?? '', item.status, date]
    }
    return [item.fullName, item.email, phone, item.currentEmployment ?? '', item.inquirySubject ?? '', item.inquiryDescription ?? '', item.additionalComments ?? '', item.status, date]
  })

  const escape = (v: string) => `"${v.replace(/"/g, '""').replace(/\n/g, ' ')}"`
  const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const dateStr = new Date().toISOString().slice(0, 10)
  a.download = type === 'application' ? `지원서_${dateStr}.csv` : `문의_${dateStr}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function updateApplicationStatus(
  token: string,
  id: string,
  status: 'New' | 'Reviewed' | 'Contacted',
  adminNotes?: string
): Promise<SubmissionItem> {
  const res = await api.patch<SubmissionItem>(
    `/admin/applications/${id}/status`,
    { status, adminNotes },
    token
  )
  return res.data as SubmissionItem
}

export async function updateInquiryStatus(
  token: string,
  id: string,
  status: 'New' | 'Reviewed' | 'Contacted',
  adminNotes?: string
): Promise<SubmissionItem> {
  const res = await api.patch<SubmissionItem>(
    `/admin/inquiries/${id}/status`,
    { status, adminNotes },
    token
  )
  return res.data as SubmissionItem
}

/* ─── Company Auth types & helpers ─────────────────────────────────────── */
export interface CompanyRegisterData {
  companyName: string
  contactPerson: string
  email: string
  password: string
  dialCode: string
  telephone: string
  countryOfOrigin: string
  industry: string
}

export interface CompanyProfile {
  id: string
  companyName: string
  contactPerson: string
  email: string
  dialCode?: string
  telephone?: string
  countryOfOrigin?: string
  industry?: string
  tempPassword?: boolean
}

export interface QAThread {
  id: string
  subject: string
  status: string
  createdAt: string
  updatedAt: string
  messageCount?: number
}

export interface QAMessage {
  id: string
  threadId: string
  senderType: 'company' | 'admin'
  content: string
  createdAt: string
}

export interface QAThreadDetail extends QAThread {
  messages: QAMessage[]
}

/* ─── Company Auth ─────────────────────────────────────────────────────── */
export async function companyRegister(data: CompanyRegisterData): Promise<ApiResponse> {
  return api.post('/company/auth/register', data)
}

export async function companyLogin(email: string, password: string): Promise<ApiResponse> {
  return api.post('/company/auth/login', { email, password })
}

export async function companyVerifyOTP(
  email: string,
  otpCode: string
): Promise<{ token: string; company: { id: string; email: string; companyName: string; contactPerson: string; tempPassword: boolean; telephone?: string; dialCode?: string; country?: string; industry?: string } }> {
  const res = await api.post('/company/auth/verify-otp', { email, otpCode })
  return res as unknown as { token: string; company: { id: string; email: string; companyName: string; contactPerson: string; tempPassword: boolean; telephone?: string; dialCode?: string; country?: string; industry?: string } }
}

export async function companyForgotPassword(email: string): Promise<ApiResponse> {
  return api.post('/company/auth/forgot-password', { email })
}

export async function getCompanyProfile(token: string): Promise<CompanyProfile> {
  const res = await api.get<CompanyProfile>('/company/auth/me', token)
  const raw = res as unknown as Record<string, unknown>
  return (raw.company ?? raw.data ?? res.data) as CompanyProfile
}

export async function updateCompanyProfile(
  token: string,
  data: Partial<CompanyProfile> & { currentPassword?: string; newPassword?: string }
): Promise<CompanyProfile> {
  const res = await api.patch<CompanyProfile>('/company/auth/me', data, token)
  const raw = res as unknown as Record<string, unknown>
  return (raw.company ?? raw.data ?? res.data) as CompanyProfile
}

/* ─── Company Q&A ──────────────────────────────────────────────────────── */
export async function getQAThreads(token: string): Promise<QAThread[]> {
  const res = await api.get<QAThread[]>('/company/qa', token)
  const raw = res as unknown as { data: QAThread[] }
  return raw.data ?? (res.data as QAThread[]) ?? []
}

export async function getQAThread(token: string, threadId: string): Promise<QAThreadDetail> {
  const res = await api.get<QAThreadDetail>(`/company/qa/${threadId}`, token)
  return (res as unknown as { data: QAThreadDetail }).data ?? (res.data as QAThreadDetail)
}

export async function createQAThread(
  token: string,
  data: { subject: string; content: string }
): Promise<QAThread> {
  const res = await api.post<QAThread>('/company/qa', data, token)
  return (res as unknown as { data: QAThread }).data ?? (res.data as QAThread)
}

export async function replyToQAThread(
  token: string,
  threadId: string,
  content: string
): Promise<QAMessage> {
  const res = await api.post<QAMessage>(`/company/qa/${threadId}/reply`, { content }, token)
  return (res as unknown as { data: QAMessage }).data ?? (res.data as QAMessage)
}
