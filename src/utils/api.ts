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
  const res = await api.get<PaginatedResponse<SubmissionItem>>(
    `/admin/applications${qs.toString() ? `?${qs}` : ''}`,
    token
  )
  return res.data as PaginatedResponse<SubmissionItem>
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
  const res = await api.get<PaginatedResponse<SubmissionItem>>(
    `/admin/inquiries${qs.toString() ? `?${qs}` : ''}`,
    token
  )
  return res.data as PaginatedResponse<SubmissionItem>
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
