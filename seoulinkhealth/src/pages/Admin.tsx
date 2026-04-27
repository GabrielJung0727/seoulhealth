import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { usePageTitle } from '@/hooks/usePageTitle'
import { SITE_CONFIG } from '@/config/site'
import DetailModal from '@/components/admin/DetailModal'
import {
  getApplications,
  getInquiries,
  updateApplicationStatus,
  updateInquiryStatus,
  exportToCSV,
  adminGetQAThreads,
  adminReplyQA,
  adminTranslateText,
  adminGetAllFiles,
  adminDownloadFile,
  adminGetEmailLogs,
  adminGetProjects,
  adminGetExperts,
  adminGetAnalytics,
  type SubmissionItem,
  type PaginatedResponse,
  type AdminQAThread,
  type FileItem,
  type FileGrouped,
  type EmailLogItem,
  type AdminProject,
  type AdminExpert,
  type AdminAnalytics,
} from '@/utils/api'

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Tab = 'applications' | 'inquiries' | 'qa' | 'documents' | 'emailLogs' | 'projects' | 'experts' | 'analytics'
type Status = 'New' | 'Reviewed' | 'Contacted'

const L = SITE_CONFIG.admin.labels

const STATUS_OPTIONS: { value: '' | Status; label: string }[] = [
  { value: '',          label: L.statusAll       },
  { value: 'New',       label: L.statusNew       },
  { value: 'Reviewed',  label: L.statusReviewed  },
  { value: 'Contacted', label: L.statusContacted },
]

const STATUS_BADGE: Record<Status, string> = {
  New:       'bg-blue-100 text-blue-800',
  Reviewed:  'bg-amber-100 text-amber-800',
  Contacted: 'bg-green-100 text-green-800',
}

const STATUS_LABEL: Record<Status, string> = {
  New:       L.statusNew,
  Reviewed:  L.statusReviewed,
  Contacted: L.statusContacted,
}

const QA_STATUS_BADGE: Record<string, string> = {
  Open:     'bg-blue-100 text-blue-800',
  Answered: 'bg-green-100 text-green-800',
  Closed:   'bg-gray-100 text-gray-600',
}

const QA_STATUS_LABEL: Record<string, string> = {
  Open:     L.qaStatusOpen,
  Answered: L.qaStatusAnswered,
  Closed:   L.qaStatusClosed,
}

const TRANSLATE_LANGUAGES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function toKoreanDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/* ─── File Helpers ───────────────────────────────────────────────────────── */
function formatAdminFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getAdminFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'img'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt'
  if (mimeType.includes('zip')) return 'zip'
  return 'txt'
}

function getAdminFileIconColor(mimeType: string): string {
  const colors: Record<string, string> = {
    pdf: 'bg-red-100 text-red-600',
    doc: 'bg-blue-100 text-blue-600',
    xls: 'bg-green-100 text-green-600',
    ppt: 'bg-orange-100 text-orange-600',
    img: 'bg-purple-100 text-purple-600',
    zip: 'bg-amber-100 text-amber-600',
    txt: 'bg-gray-100 text-gray-600',
  }
  return colors[getAdminFileIcon(mimeType)] ?? 'bg-gray-100 text-gray-600'
}

const EMAIL_TYPE_BADGE: Record<string, string> = {
  otp: 'bg-purple-100 text-purple-800',
  welcome: 'bg-blue-100 text-blue-800',
  confirmation: 'bg-teal-100 text-teal-800',
  temp_password: 'bg-amber-100 text-amber-800',
  qa_notification: 'bg-indigo-100 text-indigo-800',
  admin_notification: 'bg-gray-100 text-gray-800',
}

/* ─── Skeleton Card ──────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-5 lg:p-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="h-6 w-40 bg-gray-100 dark:bg-gray-700 rounded-full" />
          <div className="h-4 w-56 bg-gray-100 dark:bg-gray-700 rounded-full" />
          <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="h-8 w-20 bg-gray-100 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function AdminPage() {
  usePageTitle('Admin Dashboard')
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)!
  const clearToken = useAuthStore((s) => s.clearToken)
  const addToast = useToastStore((s) => s.addToast)

  /* State */
  const [tab, setTab] = useState<Tab>('applications')
  const [statusFilter, setStatusFilter] = useState<'' | Status>('')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedResponse<SubmissionItem> | null>(null)
  const [stats, setStats] = useState<{ applications: { total: number; new: number }; inquiries: { total: number; new: number } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<SubmissionItem | null>(null)
  const refreshRef = useRef<ReturnType<typeof setInterval>>()

  /* Documents state */
  const [fileGroups, setFileGroups] = useState<Record<string, FileGrouped>>({})
  const [filesLoading, setFilesLoading] = useState(false)
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set())

  /* Q&A state */
  const [qaThreads, setQaThreads] = useState<AdminQAThread[]>([])
  const [qaLoading, setQaLoading] = useState(false)
  const [selectedThread, setSelectedThread] = useState<AdminQAThread | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replySending, setReplySending] = useState(false)
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({})
  const [translatingId, setTranslatingId] = useState<string | null>(null)
  const [showLangDropdown, setShowLangDropdown] = useState<string | null>(null)
  const langDropdownRef = useRef<HTMLDivElement>(null)

  /* Email logs state */
  const [emailLogs, setEmailLogs] = useState<PaginatedResponse<EmailLogItem> | null>(null)
  const [emailLogsLoading, setEmailLogsLoading] = useState(false)
  const [emailSearchInput, setEmailSearchInput] = useState('')
  const [emailDebouncedSearch, setEmailDebouncedSearch] = useState('')
  const [emailPage, setEmailPage] = useState(1)

  /* Projects state */
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)

  /* Experts state */
  const [experts, setExperts] = useState<AdminExpert[]>([])
  const [expertsLoading, setExpertsLoading] = useState(false)
  const [expertSearch, setExpertSearch] = useState('')
  const [expertDomainFilter, setExpertDomainFilter] = useState('전체')

  /* Analytics state */
  const [analyticsData, setAnalyticsData] = useState<AdminAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  /* Dark mode state */
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('sih_admin_dark') === 'true')
  const [showHelp, setShowHelp] = useState(false)

  /* Debounce search */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  /* Debounce email log search */
  useEffect(() => {
    const t = setTimeout(() => {
      setEmailDebouncedSearch(emailSearchInput)
      setEmailPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [emailSearchInput])

  /* Dark mode persistence */
  useEffect(() => {
    localStorage.setItem('sih_admin_dark', String(darkMode))
  }, [darkMode])

  /* Fetch Q&A threads */
  const fetchQAThreads = useCallback(async () => {
    try {
      setQaLoading(true)
      const threads = await adminGetQAThreads(token)
      setQaThreads(Array.isArray(threads) ? threads : [])
    } catch (err) {
      console.error('[Admin] fetchQAThreads error:', err)
      setQaThreads([])
    } finally {
      setQaLoading(false)
    }
  }, [token])

  /* Fetch files */
  const fetchFiles = useCallback(async () => {
    try {
      setFilesLoading(true)
      const groups = await adminGetAllFiles(token)
      setFileGroups(groups)
    } catch (err) {
      console.error('[Admin] fetchFiles error:', err)
      setFileGroups({})
    } finally {
      setFilesLoading(false)
    }
  }, [token])

  /* Fetch email logs */
  const fetchEmailLogs = useCallback(async () => {
    try {
      setEmailLogsLoading(true)
      const result = await adminGetEmailLogs(token, {
        page: emailPage,
        limit: 20,
        search: emailDebouncedSearch || undefined,
      })
      setEmailLogs(result)
    } catch (err) {
      console.error('[Admin] fetchEmailLogs error:', err)
      setEmailLogs(null)
    } finally {
      setEmailLogsLoading(false)
    }
  }, [token, emailPage, emailDebouncedSearch])

  /* Fetch projects */
  const fetchProjects = useCallback(async () => {
    try {
      setProjectsLoading(true)
      const items = await adminGetProjects(token)
      setProjects(Array.isArray(items) ? items : [])
    } catch (err) {
      console.error('[Admin] fetchProjects error:', err)
      setProjects([])
    } finally {
      setProjectsLoading(false)
    }
  }, [token])

  /* Fetch experts */
  const fetchExperts = useCallback(async () => {
    try {
      setExpertsLoading(true)
      const items = await adminGetExperts(token)
      setExperts(Array.isArray(items) ? items : [])
    } catch (err) {
      console.error('[Admin] fetchExperts error:', err)
      setExperts([])
    } finally {
      setExpertsLoading(false)
    }
  }, [token])

  /* Fetch analytics */
  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true)
      const data = await adminGetAnalytics(token)
      setAnalyticsData(data)
    } catch (err) {
      console.error('[Admin] fetchAnalytics error:', err)
      setAnalyticsData(null)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [token])

  /* Fetch data */
  const fetchData = useCallback(async () => {
    if (tab !== 'applications' && tab !== 'inquiries') return // Only these tabs use fetchData
    try {
      setLoading(true)
      const params = {
        status: statusFilter || undefined,
        page,
        limit: 10,
        search: debouncedSearch || undefined,
      }

      const BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api')

      const [res, statsRes] = await Promise.allSettled([
        tab === 'applications'
          ? getApplications(token, params)
          : getInquiries(token, params),
        fetch(`${BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ])

      if (res.status === 'fulfilled') setData(res.value)
      if (statsRes.status === 'fulfilled' && statsRes.value?.success) setStats(statsRes.value.data)
    } catch (err) {
      console.error('[Admin] fetchData error:', err)
    } finally {
      setLoading(false)
    }
  }, [tab, statusFilter, page, debouncedSearch, token])

  useEffect(() => { fetchData() }, [fetchData])

  /* Auto-refresh every 30s */
  useEffect(() => {
    refreshRef.current = setInterval(() => {
      fetchData()
      if (tab === 'qa') fetchQAThreads()
      if (tab === 'documents') fetchFiles()
      if (tab === 'emailLogs') fetchEmailLogs()
      if (tab === 'projects') fetchProjects()
      if (tab === 'experts') fetchExperts()
      if (tab === 'analytics') fetchAnalytics()
    }, 30_000)
    return () => clearInterval(refreshRef.current)
  }, [fetchData, fetchQAThreads, fetchFiles, fetchEmailLogs, fetchProjects, fetchExperts, fetchAnalytics, tab])

  /* Fetch Q&A threads when Q&A tab is selected */
  useEffect(() => {
    if (tab === 'qa') fetchQAThreads()
    if (tab === 'documents') fetchFiles()
    if (tab === 'emailLogs') fetchEmailLogs()
    if (tab === 'projects') fetchProjects()
    if (tab === 'experts') fetchExperts()
    if (tab === 'analytics') fetchAnalytics()
  }, [tab, fetchQAThreads, fetchFiles, fetchEmailLogs, fetchProjects, fetchExperts, fetchAnalytics])

  /* FEATURE 3: Alert badge — update browser tab title with new item count */
  useEffect(() => {
    if (!stats) return
    const count = stats.applications.new + stats.inquiries.new
    document.title = count > 0
      ? `(${count}) Admin Dashboard | SEOULINKHEALTH`
      : 'Admin Dashboard | SEOULINKHEALTH'
  }, [stats])

  /* Close lang dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setShowLangDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* Status change handler */
  const handleStatusChange = async (id: string, status: Status) => {
    try {
      if (tab === 'applications') {
        await updateApplicationStatus(token, id, status)
      } else {
        await updateInquiryStatus(token, id, status)
      }
      addToast({ type: 'success', message: '상태가 변경되었습니다.' })

      // Update local state
      if (data) {
        setData({
          ...data,
          data: data.data.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        })
      }
      if (selectedItem?.id === id) {
        setSelectedItem({ ...selectedItem, status })
      }
      fetchData()
    } catch {
      addToast({ type: 'error', message: '상태 변경에 실패했습니다.' })
    }
  }

  /* Q&A reply handler */
  const handleQAReply = async () => {
    if (!selectedThread || !replyText.trim()) return
    try {
      setReplySending(true)
      await adminReplyQA(token, selectedThread.id, replyText.trim())
      setReplyText('')
      addToast({ type: 'success', message: '답변이 전송되었습니다.' })
      await fetchQAThreads()
    } catch {
      addToast({ type: 'error', message: '답변 전송에 실패했습니다.' })
    } finally {
      setReplySending(false)
    }
  }

  /* Translate handler */
  const handleTranslate = async (messageId: string, text: string, targetLang: string) => {
    try {
      setTranslatingId(messageId)
      setShowLangDropdown(null)
      const result = await adminTranslateText(token, text, targetLang)
      setTranslatedMessages((prev) => ({
        ...prev,
        [messageId]: result.translatedText,
      }))
    } catch {
      addToast({ type: 'error', message: '번역에 실패했습니다.' })
    } finally {
      setTranslatingId(null)
    }
  }

  /* File download handler */
  const handleFileDownload = async (fileId: string) => {
    try {
      await adminDownloadFile(token, fileId)
    } catch {
      addToast({ type: 'error', message: '파일 다운로드에 실패했습니다.' })
    }
  }

  /* Toggle company folder expand */
  const toggleCompanyExpand = (companyId: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev)
      if (next.has(companyId)) {
        next.delete(companyId)
      } else {
        next.add(companyId)
      }
      return next
    })
  }

  /* Sign out */
  const handleSignOut = () => {
    clearToken()
    navigate('/login')
  }

  /* Tab change */
  const handleTabChange = (t: Tab) => {
    setTab(t)
    setPage(1)
    setStatusFilter('')
    setSearchInput('')
    setSelectedThread(null)
    setReplyText('')
    setTranslatedMessages({})
    setExpandedCompanies(new Set())
    setEmailSearchInput('')
    setEmailPage(1)
  }

  /* CSV export */
  const handleExport = () => {
    if (data?.data.length) {
      exportToCSV(data.data, tab === 'applications' ? 'application' : 'inquiry')
      addToast({ type: 'success', message: 'CSV 파일을 다운로드했습니다.' })
    }
  }

  const items = data?.data ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  return (
    <div className={`admin-layout min-h-screen bg-gray-50 dark:bg-gray-900 no-print ${darkMode ? 'dark' : ''}`}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 border-b-2 border-gray-100 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-navy dark:text-white">SEOULINKHEALTH</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{L.loginSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Help modal */}
            <button
              onClick={() => setShowHelp(true)}
              className="admin-btn border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="도움말"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">도움말</span>
            </button>
            {/* FEATURE 4: Dark mode toggle */}
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="admin-btn border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={L.darkMode}
            >
              {darkMode ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
              <span className="hidden sm:inline">{L.darkMode}</span>
            </button>
            <button
              onClick={fetchData}
              className="admin-btn border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">{L.refresh}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="admin-btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {L.signOut}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: L.totalApplications, value: stats?.applications.total, sub: stats?.applications.new, color: 'text-brand-navy' },
            { label: L.newApplications, value: stats?.applications.new, color: 'text-blue-600' },
            { label: L.totalInquiries, value: stats?.inquiries.total, sub: stats?.inquiries.new, color: 'text-brand-navy' },
            { label: L.newInquiries, value: stats?.inquiries.new, color: 'text-blue-600' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              {loading && !stats ? (
                <div className="h-12 w-20 bg-gray-100 rounded-full animate-pulse" />
              ) : (
                <div className={`stat-value ${s.color}`}>{s.value ?? 0}</div>
              )}
              <div className="stat-label">{s.label}</div>
              {s.sub != null && s.sub > 0 && (
                <p className="text-sm text-blue-600 font-bold mt-1">{s.sub}{L.unread}</p>
              )}
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          {(['applications', 'inquiries', 'qa', 'documents', 'emailLogs', 'projects', 'experts', 'analytics'] as Tab[]).map((t) => {
            const label = t === 'applications' ? L.applications
              : t === 'inquiries' ? L.inquiries
              : t === 'qa' ? L.qa
              : t === 'documents' ? L.documents
              : t === 'emailLogs' ? L.emailLogs
              : t === 'projects' ? L.projects
              : t === 'experts' ? L.experts
              : L.analytics

            /* FEATURE 3: red badge for new items */
            const badgeCount = t === 'applications' ? (stats?.applications.new ?? 0)
              : t === 'inquiries' ? (stats?.inquiries.new ?? 0)
              : 0

            return (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`admin-btn rounded-full text-sm sm:text-lg relative ${
                  tab === t
                    ? 'bg-brand-navy text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {label}
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1">
                    {badgeCount}
                  </span>
                )}
              </button>
            )
          })}

          <div className="flex-1" />

          <button
            onClick={handleExport}
            disabled={!items.length}
            className="admin-btn bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {L.export}
          </button>
        </div>

        {/* ── Applications / Inquiries content ─────────────────────────── */}
        {(tab === 'applications' || tab === 'inquiries') && (
          <>
            {/* ── Search + Filter ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={L.search}
                  className="w-full h-14 pl-12 pr-4 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setStatusFilter(opt.value); setPage(1) }}
                    className={`admin-btn rounded-full ${
                      statusFilter === opt.value
                        ? 'bg-brand-navy text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Card List ────────────────────────────────────────────────── */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {loading && !data ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)
                ) : items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <p className="text-xl text-gray-400">
                      {debouncedSearch ? L.noResults : L.noSubmissions}
                    </p>
                  </motion.div>
                ) : (
                  items.map((item, i) => (
                    <motion.button
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedItem(item)}
                      className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-brand-teal/40 hover:shadow-md p-4 sm:p-5 lg:p-6 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand-teal transition-colors truncate">
                            {item.fullName}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 truncate">{item.email}</p>
                          {tab === 'inquiries' && item.inquirySubject && (
                            <p className="text-base text-gray-600 mt-1 truncate">{item.inquirySubject}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-base text-gray-400">
                            {toKoreanDate(item.createdAt)}
                          </span>
                          <span className={`px-4 py-1.5 rounded-full text-base font-bold ${STATUS_BADGE[item.status]}`}>
                            {STATUS_LABEL[item.status]}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* ── Pagination ───────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="admin-btn bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  {L.prevPage}
                </button>
                <span className="text-sm sm:text-lg font-bold text-gray-600">
                  {page} / {totalPages} {L.pageOf}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="admin-btn bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  {L.nextPage}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Documents Tab Content ──────────────────────────────────────── */}
        {tab === 'documents' && (
          <div className="space-y-4">
            {filesLoading && Object.keys(fileGroups).length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`files-sk-${i}`} />)
            ) : Object.keys(fileGroups).length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-xl text-gray-400">{L.documentsNoFiles}</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {Object.values(fileGroups).map((group, i) => {
                  const isExpanded = expandedCompanies.has(group.companyId)
                  return (
                    <motion.div
                      key={group.companyId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden"
                    >
                      {/* Folder header */}
                      <button
                        onClick={() => toggleCompanyExpand(group.companyId)}
                        className="w-full text-left p-4 sm:p-5 lg:p-6 hover:bg-gray-50 transition-colors flex items-center gap-4"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`w-6 h-6 text-brand-teal transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        >
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-amber-400">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                            {group.companyName}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {group.files.length} {L.documentsFiles} &middot; {L.documentsTotal} {formatAdminFileSize(group.totalSize)}
                          </p>
                        </div>
                      </button>

                      {/* Expanded file list */}
                      {isExpanded && (
                        <div className="border-t border-gray-100">
                          <ul className="divide-y divide-gray-50">
                            {group.files.map((file: FileItem) => (
                              <li key={file.id} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[0.6rem] font-bold uppercase shrink-0 ${getAdminFileIconColor(file.mimeType)}`}>
                                  {getAdminFileIcon(file.mimeType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">{file.originalName}</p>
                                  <p className="text-xs text-gray-400">
                                    {formatAdminFileSize(file.size)} &middot; {toKoreanDate(file.createdAt)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleFileDownload(file.id)}
                                  className="admin-btn bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
                                >
                                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  {L.documentsDownload}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* ── Q&A Tab Content ────────────────────────────────────────────── */}
        {tab === 'qa' && (
          <div className="space-y-4">
            {!selectedThread ? (
              /* ── Thread List ──────────────────────────────────────────── */
              <>
                {qaLoading && qaThreads.length === 0 ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`qa-sk-${i}`} />)
                ) : qaThreads.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <p className="text-xl text-gray-400">{L.qaNoThreads}</p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {qaThreads.map((thread, i) => (
                      <motion.button
                        key={thread.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => {
                          setSelectedThread(thread)
                          setTranslatedMessages({})
                        }}
                        className="w-full text-left bg-white rounded-2xl border-2 border-gray-100 hover:border-brand-teal/40 hover:shadow-md p-4 sm:p-5 lg:p-6 transition-all group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-brand-teal">
                                {thread.company.companyName}
                              </span>
                            </div>
                            <h3 className="text-base sm:text-xl font-bold text-gray-900 group-hover:text-brand-teal transition-colors truncate">
                              {thread.subject}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                              {L.qaMessages}: {thread.messages.length}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-base text-gray-400">
                              {toKoreanDate(thread.createdAt)}
                            </span>
                            <span className={`px-4 py-1.5 rounded-full text-base font-bold ${QA_STATUS_BADGE[thread.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {QA_STATUS_LABEL[thread.status] ?? thread.status}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                )}
              </>
            ) : (
              /* ── Thread Detail (Chat View) ───────────────────────────── */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Back button + Header */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setSelectedThread(null)
                      setReplyText('')
                      setTranslatedMessages({})
                    }}
                    className="admin-btn bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    {L.qaBackToList}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                      {selectedThread.subject}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedThread.company.companyName} &middot;{' '}
                      <span className={`inline-block px-3 py-0.5 rounded-full text-sm font-bold ${QA_STATUS_BADGE[selectedThread.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {QA_STATUS_LABEL[selectedThread.status] ?? selectedThread.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {selectedThread.messages.map((msg) => {
                    const isAdmin = msg.sender === 'admin'
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-4 ${
                            isAdmin
                              ? 'bg-brand-navy/5 border border-brand-navy/10'
                              : 'bg-brand-teal/5 border border-brand-teal/10'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold ${isAdmin ? 'text-brand-navy' : 'text-brand-teal'}`}>
                              {isAdmin ? 'Admin' : selectedThread.company.companyName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {toKoreanDate(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap">
                            {msg.content}
                          </p>

                          {/* Translated text */}
                          {translatedMessages[msg.id] && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-sm text-gray-500 whitespace-pre-wrap bg-gray-50 rounded-lg p-2">
                                {translatedMessages[msg.id]}
                              </p>
                            </div>
                          )}

                          {/* Translate button */}
                          <div className="relative mt-2" ref={showLangDropdown === msg.id ? langDropdownRef : undefined}>
                            <button
                              onClick={() =>
                                setShowLangDropdown(showLangDropdown === msg.id ? null : msg.id)
                              }
                              disabled={translatingId === msg.id}
                              className="text-xs text-gray-400 hover:text-brand-teal transition-colors flex items-center gap-1 disabled:opacity-50"
                              title={L.qaTranslate}
                            >
                              {translatingId === msg.id ? (
                                <span className="animate-pulse">{L.qaTranslating}</span>
                              ) : (
                                <>
                                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a18.933 18.933 0 01-3.08 3.416 1 1 0 01-1.386-1.44 16.935 16.935 0 002.77-3.078A18.723 18.723 0 013.2 7H2a1 1 0 010-2h3V3a1 1 0 011-1zm0 4a16.88 16.88 0 001.364 3.78A16.892 16.892 0 007 6zm6.532 3.986a1 1 0 011.217-.707l.008.002.022.007a4.667 4.667 0 01.312.12c.2.085.484.216.8.392.633.353 1.444.925 2.244 1.75a1 1 0 01-1.469 1.356c-.618-.636-1.227-1.08-1.687-1.337a4.763 4.763 0 00-.503-.256 1 1 0 01-.944-1.327zM18 14a1 1 0 00-2 0c0 .112-.044.251-.168.384-.135.144-.372.296-.724.413C14.472 15.01 13.593 15.1 12.5 15.1a1 1 0 100 2c1.157 0 2.278-.098 3.174-.367.462-.139.904-.346 1.26-.68.367-.345.566-.787.566-1.253a1 1 0 00-1.5-.867z" clipRule="evenodd" />
                                  </svg>
                                  {L.qaTranslate}
                                </>
                              )}
                            </button>

                            {/* Language dropdown */}
                            {showLangDropdown === msg.id && (
                              <div className="absolute bottom-full left-0 mb-1 bg-white rounded-xl border-2 border-gray-100 shadow-lg py-1 z-10 min-w-[140px]">
                                <p className="px-3 py-1 text-xs font-bold text-gray-400">{L.qaSelectLanguage}</p>
                                {TRANSLATE_LANGUAGES.map((lang) => (
                                  <button
                                    key={lang.code}
                                    onClick={() => handleTranslate(msg.id, msg.content, lang.code)}
                                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-brand-teal/5 hover:text-brand-teal transition-colors"
                                  >
                                    {lang.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Reply input */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 flex gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={L.qaReplyPlaceholder}
                    rows={3}
                    className="flex-1 resize-none text-base rounded-xl border-2 border-gray-200 p-3 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault()
                        handleQAReply()
                      }
                    }}
                  />
                  <button
                    onClick={handleQAReply}
                    disabled={!replyText.trim() || replySending}
                    className="admin-btn bg-brand-navy text-white hover:bg-brand-navy/90 disabled:opacity-40 self-end"
                  >
                    {replySending ? (
                      <span className="animate-pulse">{L.qaSend}...</span>
                    ) : (
                      <>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        {L.qaSend}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ── Email Logs Tab Content ────────────────────────────────────── */}
        {tab === 'emailLogs' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                value={emailSearchInput}
                onChange={(e) => setEmailSearchInput(e.target.value)}
                placeholder={L.emailLogSearchPlaceholder}
                className="w-full h-14 pl-12 pr-4 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors"
              />
            </div>

            {/* Email log list */}
            {emailLogsLoading && !emailLogs ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`el-sk-${i}`} />)
            ) : !emailLogs?.data?.length ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-xl text-gray-400 dark:text-gray-500">{L.emailLogNoLogs}</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {emailLogs.data.map((log, i) => (
                    <motion.div
                      key={log.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4 sm:p-5 lg:p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                            {log.to}
                          </p>
                          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 truncate">
                            {log.subject}
                          </p>
                          {log.error && (
                            <p className="text-sm text-red-500 mt-1 truncate">{log.error}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${EMAIL_TYPE_BADGE[log.type] ?? 'bg-gray-100 text-gray-800'}`}>
                            {log.type}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            log.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status === 'sent' ? L.emailLogSent : L.emailLogFailed}
                          </span>
                          <span className="text-sm text-gray-400">
                            {toKoreanDate(log.createdAt)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Email log pagination */}
            {emailLogs && emailLogs.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  disabled={emailPage <= 1}
                  onClick={() => setEmailPage((p) => Math.max(1, p - 1))}
                  className="admin-btn bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                >
                  {L.prevPage}
                </button>
                <span className="text-sm sm:text-lg font-bold text-gray-600 dark:text-gray-300">
                  {emailPage} / {emailLogs.pagination.totalPages} {L.pageOf}
                </span>
                <button
                  disabled={emailPage >= emailLogs.pagination.totalPages}
                  onClick={() => setEmailPage((p) => Math.min(emailLogs!.pagination.totalPages, p + 1))}
                  className="admin-btn bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                >
                  {L.nextPage}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

        {/* ── Projects Tab ─────────────────────────────────────────────── */}
        {tab === 'projects' && (
          <div className="space-y-4">
            {projectsLoading && projects.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`proj-sk-${i}`} />)
            ) : projects.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <p className="text-xl text-gray-400 dark:text-gray-500">등록된 프로젝트가 없습니다.</p>
              </motion.div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {projects.map((proj, i) => {
                    const statusColor: Record<string, string> = {
                      Planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                      'In Progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
                      Review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                      Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                    }
                    return (
                      <motion.div
                        key={proj.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-brand-teal/40 hover:shadow-md p-5 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{proj.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${statusColor[proj.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {proj.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{proj.companyName}</p>
                        {proj.domain && (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-brand-navy/10 text-brand-navy dark:bg-brand-teal/20 dark:text-brand-teal mb-3">
                            {proj.domain}
                          </span>
                        )}
                        {/* Progress bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>진행률</span>
                            <span>{proj.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-teal rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, proj.progress))}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-3">
                          {proj.expertName && <span>담당: {proj.expertName}</span>}
                          <span>
                            {proj.startDate ? toKoreanDate(proj.startDate) : ''}
                            {proj.startDate && proj.endDate ? ' ~ ' : ''}
                            {proj.endDate ? toKoreanDate(proj.endDate) : ''}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ── Experts Tab ──────────────────────────────────────────────── */}
        {tab === 'experts' && (
          <div className="space-y-4">
            {/* Search + Domain filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  value={expertSearch}
                  onChange={(e) => setExpertSearch(e.target.value)}
                  placeholder="이름 또는 전공 검색"
                  className="w-full h-14 pl-12 pr-4 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['전체', 'K-HEALTH CARE', 'K-HEALTH INDUSTRY', 'K-BIO', 'K-HEALTH FOOD'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setExpertDomainFilter(d)}
                    className={`admin-btn rounded-full text-sm ${
                      expertDomainFilter === d
                        ? 'bg-brand-navy text-white'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Expert cards */}
            {expertsLoading && experts.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`exp-sk-${i}`} />)
            ) : (() => {
              const filtered = experts.filter((e) => {
                const matchDomain = expertDomainFilter === '전체' || e.domain === expertDomainFilter
                const q = expertSearch.toLowerCase()
                const matchSearch = !q || e.name.toLowerCase().includes(q) || e.specialty.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
                return matchDomain && matchSearch
              })
              if (filtered.length === 0) {
                return (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <p className="text-xl text-gray-400 dark:text-gray-500">
                      {experts.length === 0 ? '등록된 전문가가 없습니다.' : '검색 결과가 없습니다.'}
                    </p>
                  </motion.div>
                )
              }
              const domainColor: Record<string, string> = {
                'K-HEALTH CARE': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                'K-HEALTH INDUSTRY': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                'K-BIO': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                'K-HEALTH FOOD': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
              }
              return (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((exp, i) => (
                      <motion.div
                        key={exp.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-brand-teal/40 hover:shadow-md p-5 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{exp.name}</h3>
                          <span className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${exp.status === 'Active' ? 'bg-green-400' : 'bg-gray-300'}`} title={exp.status} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-1">{exp.email}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{exp.specialty}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${domainColor[exp.domain] ?? 'bg-gray-100 text-gray-600'}`}>
                            {exp.domain}
                          </span>
                          {exp.country && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              {exp.country}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )
            })()}
          </div>
        )}

        {/* ── Analytics Tab ────────────────────────────────────────────── */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            {analyticsLoading && !analyticsData ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`ana-sk-${i}`} />)
            ) : !analyticsData ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <p className="text-xl text-gray-400 dark:text-gray-500">통계 데이터를 불러올 수 없습니다.</p>
              </motion.div>
            ) : (
              <>
                {/* Metric cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: '이번 달 문의', value: analyticsData.totalInquiriesThisMonth, color: 'text-blue-600' },
                    { label: '전환율', value: `${analyticsData.conversionRate}%`, color: 'text-green-600' },
                    { label: '전체 프로젝트', value: analyticsData.totalProjects, color: 'text-purple-600' },
                    { label: '전체 전문가', value: analyticsData.totalExperts, color: 'text-amber-600' },
                  ].map((m) => (
                    <div key={m.label} className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-5 text-center">
                      <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Monthly bar chart */}
                {analyticsData.monthlyInquiries?.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">월별 문의 현황</h3>
                    <div className="flex items-end gap-2 h-48">
                      {(() => {
                        const maxCount = Math.max(...analyticsData.monthlyInquiries.map((m) => m.count), 1)
                        return analyticsData.monthlyInquiries.map((m) => (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{m.count}</span>
                            <div
                              className="w-full bg-brand-navy dark:bg-brand-teal rounded-t transition-all min-h-[4px]"
                              style={{ height: `${(m.count / maxCount) * 100}%` }}
                            />
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate w-full text-center">{m.month}</span>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                )}

                {/* Domain distribution */}
                {analyticsData.domainDistribution?.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">분야별 분포</h3>
                    {(() => {
                      const total = analyticsData.domainDistribution.reduce((s, d) => s + d.count, 0) || 1
                      const colors = ['bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-teal-500']
                      return (
                        <>
                          <div className="w-full h-8 rounded-full overflow-hidden flex">
                            {analyticsData.domainDistribution.map((d, i) => (
                              <div
                                key={d.domain}
                                className={`${colors[i % colors.length]} transition-all`}
                                style={{ width: `${(d.count / total) * 100}%` }}
                                title={`${d.domain}: ${d.count}`}
                              />
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-3 mt-3">
                            {analyticsData.domainDistribution.map((d, i) => (
                              <div key={d.domain} className="flex items-center gap-1.5 text-sm">
                                <span className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                                <span className="text-gray-600 dark:text-gray-400">{d.domain}</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200">{d.count}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}

                {/* Top countries */}
                {analyticsData.topCountries?.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">국가별 현황</h3>
                    <div className="space-y-3">
                      {(() => {
                        const maxC = Math.max(...analyticsData.topCountries.map((c) => c.count), 1)
                        return analyticsData.topCountries.slice(0, 10).map((c) => (
                          <div key={c.country} className="flex items-center gap-3">
                            <span className="w-24 text-sm font-semibold text-gray-700 dark:text-gray-300 truncate shrink-0">{c.country}</span>
                            <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-navy dark:bg-brand-teal rounded-full transition-all"
                                style={{ width: `${(c.count / maxC) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400 w-10 text-right">{c.count}</span>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      {/* ── Help Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl my-8 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-brand-navy px-6 sm:px-8 py-6">
                <h2 className="text-2xl font-bold text-white">📖 관리자 대시보드 도움말</h2>
                <p className="text-white/50 text-sm mt-1">각 기능의 사용법을 안내합니다</p>
              </div>

              <div className="px-6 sm:px-8 py-6 space-y-8 text-base leading-relaxed text-gray-700 dark:text-gray-300 max-h-[70vh] overflow-y-auto">

                {/* 기본 사용법 */}
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">🏠 기본 사용법</h3>
                  <ul className="space-y-2 ml-1">
                    <li>• 상단의 <strong>숫자 카드 4개</strong>는 전체 지원서/문의 건수를 보여줍니다</li>
                    <li>• 숫자가 <strong className="text-blue-600">파란색</strong>이면 새로 들어온 건이 있다는 뜻입니다</li>
                    <li>• 화면은 <strong>30초마다 자동으로 새로고침</strong>됩니다</li>
                    <li>• 즉시 업데이트하려면 <strong>"새로고침"</strong> 버튼을 누르세요</li>
                  </ul>
                </div>

                {/* 지원서/문의 탭 */}
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">📋 지원서 / 문의 탭</h3>
                  <ul className="space-y-2 ml-1">
                    <li>• <strong>카드를 클릭</strong>하면 상세 정보를 볼 수 있습니다</li>
                    <li>• 상세 화면 아래에 <strong>큰 버튼 3개</strong>로 상태를 변경합니다:
                      <br/><span className="ml-4">🔵 <strong>신규</strong> → 🟡 <strong>검토완료</strong> → 🟢 <strong>연락완료</strong></span>
                    </li>
                    <li>• <strong>"메모"</strong> 칸에 참고사항을 자유롭게 기록할 수 있습니다</li>
                    <li>• 상단 <strong>검색창</strong>에 이름이나 이메일을 입력하면 해당 건만 보입니다</li>
                    <li>• <strong>"CSV 내보내기"</strong> 버튼으로 엑셀 파일을 다운로드할 수 있습니다</li>
                    <li>• <strong>"인쇄"</strong> 버튼으로 개별 건을 인쇄할 수 있습니다</li>
                  </ul>
                </div>

                {/* Q&A */}
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">💬 질문답변 (Q&A) 탭</h3>
                  <ul className="space-y-2 ml-1">
                    <li>• 회사 고객이 남긴 <strong>질문 목록</strong>이 표시됩니다</li>
                    <li>• 질문을 클릭하면 <strong>대화 내용</strong>을 볼 수 있습니다</li>
                    <li>• 하단 입력칸에 답변을 작성하고 <strong>"전송"</strong>을 누르세요</li>
                    <li>• 답변하면 고객에게 <strong>이메일 알림</strong>이 자동으로 갑니다</li>
                    <li>• 🌐 <strong>번역 버튼</strong>을 누르면 메시지를 한국어/영어 등으로 번역할 수 있습니다</li>
                  </ul>
                </div>

                {/* 서류 */}
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">📁 서류 탭</h3>
                  <ul className="space-y-2 ml-1">
                    <li>• 회사별로 <strong>업로드된 파일</strong>을 확인할 수 있습니다</li>
                    <li>• <strong>회사 이름을 클릭</strong>하면 해당 회사의 파일 목록이 펼쳐집니다</li>
                    <li>• <strong>"다운로드"</strong> 버튼으로 파일을 받을 수 있습니다</li>
                  </ul>
                </div>

                {/* 이메일 로그 */}
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">📧 이메일 로그 탭</h3>
                  <ul className="space-y-2 ml-1">
                    <li>• 시스템에서 발송된 <strong>모든 이메일 기록</strong>을 확인합니다</li>
                    <li>• <strong className="text-green-600">발송완료</strong> = 정상 발송 / <strong className="text-red-600">실패</strong> = 발송 오류</li>
                    <li>• 이메일이 제대로 가고 있는지 <strong>모니터링</strong>할 때 사용하세요</li>
                  </ul>
                </div>

                {/* 프로젝트 */}
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">📊 프로젝트 탭</h3>
                  <ul className="space-y-2 ml-1">
                    <li>• 문의가 실제 프로젝트로 전환되면 여기서 관리합니다</li>
                    <li>• 상태: 🔵 기획중 → 🟡 진행중 → 🟣 검토중 → 🟢 완료</li>
                    <li>• <strong>진행률 바</strong>로 프로젝트 진행 상황을 한눈에 봅니다</li>
                  </ul>
                </div>

                {/* 전문가 */}
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">👥 전문가 탭</h3>
                  <ul className="space-y-2 ml-1">
                    <li>• 등록된 <strong>전문가 프로필</strong>을 검색하고 관리합니다</li>
                    <li>• 상단 <strong>도메인 버튼</strong>으로 분야별 필터링이 가능합니다</li>
                    <li>• 지원서가 승인되면 전문가로 등록할 수 있습니다</li>
                  </ul>
                </div>

                {/* 통계 */}
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">📈 통계 탭</h3>
                  <ul className="space-y-2 ml-1">
                    <li>• <strong>월별 문의 건수 차트</strong>를 확인할 수 있습니다</li>
                    <li>• <strong>분야별 비율</strong>과 <strong>국가별 순위</strong>를 봅니다</li>
                    <li>• 전환율은 "연락완료 건수 / 전체 건수"를 의미합니다</li>
                  </ul>
                </div>

                {/* 기타 */}
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">⚙️ 기타 기능</h3>
                  <ul className="space-y-2 ml-1">
                    <li>• 🌙 <strong>다크모드</strong>: 어두운 화면으로 전환합니다 (눈 보호)</li>
                    <li>• 브라우저 탭에 <strong>(3)</strong> 같은 숫자가 뜨면 미확인 건이 있다는 뜻입니다</li>
                    <li>• 문제가 있으면 개발자에게 문의해 주세요</li>
                  </ul>
                </div>
              </div>

              {/* Close button */}
              <div className="px-6 sm:px-8 py-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setShowHelp(false)}
                  className="w-full min-h-[48px] text-lg font-bold rounded-xl bg-brand-navy text-white hover:bg-brand-teal transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <DetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        type={tab as 'applications' | 'inquiries'}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
