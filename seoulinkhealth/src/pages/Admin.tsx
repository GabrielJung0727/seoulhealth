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
  type SubmissionItem,
  type PaginatedResponse,
  type AdminQAThread,
} from '@/utils/api'

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Tab = 'applications' | 'inquiries' | 'qa'
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

/* ─── Skeleton Card ──────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 lg:p-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="h-6 w-40 bg-gray-100 rounded-full" />
          <div className="h-4 w-56 bg-gray-100 rounded-full" />
          <div className="h-4 w-32 bg-gray-100 rounded-full" />
        </div>
        <div className="h-8 w-20 bg-gray-100 rounded-full" />
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

  /* Debounce search */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

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

  /* Fetch data */
  const fetchData = useCallback(async () => {
    if (tab === 'qa') return // Q&A tab has its own fetch
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
    }, 30_000)
    return () => clearInterval(refreshRef.current)
  }, [fetchData, fetchQAThreads, tab])

  /* Fetch Q&A threads when Q&A tab is selected */
  useEffect(() => {
    if (tab === 'qa') fetchQAThreads()
  }, [tab, fetchQAThreads])

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
  }

  /* CSV export */
  const handleExport = () => {
    if (data?.data.length) {
      exportToCSV(data.data, tab === 'applications' ? 'application' : 'inquiry')
      addToast({ type: 'success', message: 'CSV 파일을 다운로드했습니다.' })
    }
  }

  const items = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  return (
    <div className="admin-layout min-h-screen bg-gray-50 no-print">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-navy">SEOULINKHEALTH</h1>
            <p className="text-sm sm:text-base text-gray-500">{L.loginSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="admin-btn border-2 border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">{L.refresh}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="admin-btn bg-gray-100 text-gray-700 hover:bg-gray-200"
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
          {(['applications', 'inquiries', 'qa'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`admin-btn rounded-full text-sm sm:text-lg ${
                tab === t
                  ? 'bg-brand-navy text-white shadow-md'
                  : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'applications' ? L.applications : t === 'inquiries' ? L.inquiries : L.qa}
            </button>
          ))}

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
        {tab !== 'qa' && (
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
                  className="w-full h-14 pl-12 pr-4 text-lg rounded-xl border-2 border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors"
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
                      className="w-full text-left bg-white rounded-2xl border-2 border-gray-100 hover:border-brand-teal/40 hover:shadow-md p-4 sm:p-5 lg:p-6 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-xl font-bold text-gray-900 group-hover:text-brand-teal transition-colors truncate">
                            {item.fullName}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-500 truncate">{item.email}</p>
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
      </div>

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
