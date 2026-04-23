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
  type SubmissionItem,
  type PaginatedResponse,
} from '@/utils/api'

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Tab = 'applications' | 'inquiries'
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

  /* Debounce search */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  /* Fetch data */
  const fetchData = useCallback(async () => {
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
    refreshRef.current = setInterval(fetchData, 30_000)
    return () => clearInterval(refreshRef.current)
  }, [fetchData])

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
          {(['applications', 'inquiries'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`admin-btn rounded-full text-sm sm:text-lg ${
                tab === t
                  ? 'bg-brand-navy text-white shadow-md'
                  : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'applications' ? L.applications : L.inquiries}
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

        {/* ── Search + Filter ────────────────────────────────────────────── */}
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

        {/* ── Card List ──────────────────────────────────────────────────── */}
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

        {/* ── Pagination ─────────────────────────────────────────────────── */}
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
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <DetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        type={tab}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
