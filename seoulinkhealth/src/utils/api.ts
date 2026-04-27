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

/* ─── Company Auth helpers ─────────────────────────────────────────────── */
export interface CompanyRegisterData {
  companyName: string
  contactPerson: string
  email: string
  password: string
  telephone: string
  dialCode: string
  country: string
  industry: string
}

export interface CompanyLoginData {
  email: string
  password: string
}

export interface CompanyVerifyOTPData {
  tempToken: string
  otp: string
}

export async function companyRegister(data: CompanyRegisterData) {
  return api.post('/company/auth/register', data)
}

export async function companyLogin(data: CompanyLoginData) {
  return api.post<{ tempToken: string }>('/company/auth/login', data)
}

export async function companyVerifyOTP(data: CompanyVerifyOTPData) {
  return api.post('/company/auth/verify-otp', data)
}

export async function companyForgotPassword(email: string) {
  return api.post('/company/auth/forgot-password', { email })
}

/* ─── Company Profile helpers ──────────────────────────────────────────── */
export async function getCompanyProfile(token: string) {
  return api.get('/company/profile', token)
}

export async function updateCompanyProfile(
  token: string,
  data: Partial<{ companyName: string; contactPerson: string; telephone: string }>
) {
  return api.patch('/company/profile', data, token)
}

/* ─── Company Q&A helpers ──────────────────────────────────────────────── */
export interface QAThread {
  id: string
  subject: string
  status: 'Open' | 'Answered' | 'Closed'
  createdAt: string
  updatedAt: string
  messages: Array<{
    id: string
    sender: 'company' | 'admin'
    content: string
    createdAt: string
  }>
}

export async function getQAThreads(token: string) {
  return api.get<{ data: QAThread[] }>('/company/qa/threads', token)
}

export async function getQAThread(token: string, threadId: string) {
  return api.get<QAThread>(`/company/qa/threads/${threadId}`, token)
}

export async function createQAThread(
  token: string,
  data: { subject: string; message: string }
) {
  return api.post('/company/qa/threads', data, token)
}

export async function replyToQAThread(
  token: string,
  threadId: string,
  message: string
) {
  return api.post(`/company/qa/threads/${threadId}/reply`, { message }, token)
}

/* ─── Admin Q&A helpers ─────────────────────────────────────────────────── */
export interface AdminQAThread {
  id: string
  companyId: string
  subject: string
  status: string
  createdAt: string
  updatedAt: string
  company: { companyName: string }
  messages: Array<{
    id: string
    sender: 'company' | 'admin'
    content: string
    createdAt: string
  }>
}

export async function adminGetQAThreads(token: string): Promise<AdminQAThread[]> {
  const res = await api.get<AdminQAThread[]>('/admin/qa', token)
  const raw = res as unknown as Record<string, unknown>
  const threads = raw.threads ?? raw.data ?? res.data
  return Array.isArray(threads) ? threads : []
}

export async function adminGetQAThread(token: string, threadId: string) {
  const res = await api.get<AdminQAThread>(`/admin/qa/${threadId}`, token)
  return res.data as AdminQAThread
}

export async function adminReplyQA(
  token: string,
  threadId: string,
  message: string
) {
  return api.post(`/admin/qa/${threadId}/reply`, { message }, token)
}

export async function adminTranslateText(
  token: string,
  text: string,
  targetLang: string
) {
  const res = await api.post<{ translatedText: string; sourceLang: string }>(
    '/admin/qa/translate',
    { text, targetLang },
    token
  )
  return res as unknown as { success: boolean; translatedText: string; sourceLang: string }
}

/* ─── File Upload helpers ──────────────────────────────────────────────── */
export interface FileItem {
  id: string
  companyId: string
  originalName: string
  storedName: string
  mimeType: string
  size: number
  createdAt: string
  company?: { companyName: string }
}

export interface FileGrouped {
  companyId: string
  companyName: string
  files: FileItem[]
  totalSize: number
}

export async function companyUploadFiles(token: string, files: File[]): Promise<FileItem[]> {
  const url = `${BASE_URL}/company/files/upload`
  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  const json = await res.json()
  if (!res.ok) {
    throw new ApiError(res.status, json.error ?? 'Upload failed.', json.details)
  }
  return json.data as FileItem[]
}

export async function companyGetFiles(token: string): Promise<FileItem[]> {
  const res = await api.get<FileItem[]>('/company/files', token)
  return (res.data ?? []) as FileItem[]
}

export async function companyDownloadFile(token: string, fileId: string): Promise<void> {
  const url = `${BASE_URL}/company/files/${fileId}/download`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new ApiError(res.status, (json as Record<string, string>).error ?? 'Download failed.')
  }
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="?(.+?)"?$/)
  const filename = match ? decodeURIComponent(match[1]) : 'download'

  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  a.click()
  URL.revokeObjectURL(blobUrl)
}

export async function companyDeleteFile(token: string, fileId: string): Promise<void> {
  await api.delete('/company/files/' + fileId, token)
}

export async function adminGetAllFiles(token: string): Promise<Record<string, FileGrouped>> {
  const res = await api.get<Record<string, FileGrouped>>('/admin/files', token)
  return (res.data ?? {}) as Record<string, FileGrouped>
}

export async function adminGetCompanyFiles(token: string, companyId: string): Promise<FileItem[]> {
  const res = await api.get<FileItem[]>(`/admin/files/company/${companyId}`, token)
  return (res.data ?? []) as FileItem[]
}

export async function adminDownloadFile(token: string, fileId: string): Promise<void> {
  const url = `${BASE_URL}/admin/files/${fileId}/download`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new ApiError(res.status, (json as Record<string, string>).error ?? 'Download failed.')
  }
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="?(.+?)"?$/)
  const filename = match ? decodeURIComponent(match[1]) : 'download'

  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  a.click()
  URL.revokeObjectURL(blobUrl)
}
