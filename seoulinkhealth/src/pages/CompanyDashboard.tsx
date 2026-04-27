import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useCompanyAuthStore, type CompanyInfo } from '@/store/companyAuthStore'
import { useToast } from '@/store/toastStore'
import {
  api,
  companyUploadFiles,
  companyGetFiles,
  companyDownloadFile,
  companyDeleteFile,
  companyGetProjects,
  type FileItem,
  type ProjectItem,
} from '@/utils/api'

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Tab = 'overview' | 'inquiries' | 'files' | 'projects' | 'settings'

interface InquiryItem {
  id: string
  inquirySubject: string
  status: string
  createdAt: string
  updatedAt: string
}

interface ProfileForm {
  companyName: string
  contactPerson: string
  telephone: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const DARK_KEY = 'sih_company_dark'

const PROJECT_STATUS_BADGE: Record<string, string> = {
  Planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'In Progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
}

const DOMAIN_COLORS: Record<string, string> = {
  'K-HEALTH CARE': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'K-HEALTH INDUSTRY': 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  'K-BIO': 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  'K-HEALTH FOOD': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
}

/* ─── Help content sections ──────────────────────────────────────────────── */
const HELP_SECTIONS = [
  {
    title: 'Overview',
    content:
      'The Overview tab displays key statistics about your inquiries: total count, how many are open (awaiting review), answered (admin has responded), and closed. Below the stat cards you will find your most recent inquiries with their current status.',
  },
  {
    title: 'My Inquiries',
    content:
      'This tab shows all inquiries you have submitted. Each inquiry displays its subject, submission date, last update, and current status. Statuses are: Open (pending review), Answered (admin has responded — check details), and Closed (resolved). Click "Open Q&A" to visit the full Q&A page.',
  },
  {
    title: 'Documents',
    content:
      'Upload and manage your documents here. Drag & drop files into the upload area or click to browse. Supported formats include PDF, Word, Excel, PowerPoint, images, ZIP, and TXT (max 10 MB each, up to 5 files at once). You can download or delete uploaded files at any time.',
  },
  {
    title: 'Projects',
    content:
      'View the projects assigned to your company. Each project card shows the title, status, progress, domain, and timeline. Projects are managed by the SEOULINKHEALTH admin team — this view is read-only.',
  },
  {
    title: 'Q&A',
    content:
      'Need to ask a question or discuss something with our team? Navigate to the Q&A section (/company/qa) where you can start new conversation threads and receive responses from our administrators.',
    link: '/company/qa',
  },
  {
    title: 'Settings',
    content:
      'Update your company profile (company name, contact person, telephone) or change your account password. All changes take effect immediately.',
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function CompanyDashboardPage() {
  usePageTitle('Company Dashboard')
  const navigate = useNavigate()
  const { token, company, setAuth, clearAuth } = useCompanyAuthStore()

  /* ── Tab state ────────────────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  /* ── Inquiries state ──────────────────────────────────────────────────── */
  const [inquiries, setInquiries] = useState<InquiryItem[]>([])
  const [loadingInquiries, setLoadingInquiries] = useState(false)
  const [stats, setStats] = useState({ total: 0, open: 0, answered: 0, closed: 0 })

  /* ── Projects state ───────────────────────────────────────────────────── */
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)

  /* ── Dark mode ────────────────────────────────────────────────────────── */
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DARK_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(DARK_KEY, String(darkMode))
    } catch {
      // storage unavailable
    }
  }, [darkMode])

  /* ── Help modal ───────────────────────────────────────────────────────── */
  const [showHelp, setShowHelp] = useState(false)

  /* ── Login notification popup ─────────────────────────────────────────── */
  const [showNotification, setShowNotification] = useState(false)
  const notificationShownRef = useRef(false)

  /* ── Tab config (includes new Projects tab) ───────────────────────────── */
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'inquiries', label: 'My Inquiries' },
    { key: 'files', label: 'Documents' },
    { key: 'projects', label: 'Projects' },
    { key: 'settings', label: 'Settings' },
  ]

  /* ── Fetch inquiries ──────────────────────────────────────────────────── */
  const fetchInquiries = useCallback(async () => {
    if (!token) return
    setLoadingInquiries(true)
    try {
      const res = await api.get<InquiryItem[]>(
        '/company/auth/inquiries',
        token
      )
      const raw = res as unknown as { data: InquiryItem[]; pagination?: { total: number } }
      const items = Array.isArray(raw.data) ? raw.data : []
      setInquiries(items)
      const answeredCount = items.filter((i) => i.status === 'Answered').length
      setStats({
        total: items.length,
        open: items.filter((i) => i.status === 'Open').length,
        answered: answeredCount,
        closed: items.filter((i) => i.status === 'Closed').length,
      })

      // Login notification: show once if there are answered inquiries
      if (!notificationShownRef.current && answeredCount > 0) {
        notificationShownRef.current = true
        setShowNotification(true)
        // Play soft notification sound
        try {
          const ctx = new AudioContext()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(660, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1)
          gain.gain.setValueAtTime(0.08, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(ctx.currentTime)
          osc.stop(ctx.currentTime + 0.4)
        } catch {
          // audio not available
        }
      }
    } catch {
      // silently fail — empty state shown
    } finally {
      setLoadingInquiries(false)
    }
  }, [token])

  // Initial fetch
  useEffect(() => {
    fetchInquiries()
  }, [fetchInquiries])

  /* ── Auto-refresh inquiries every 30 seconds ──────────────────────────── */
  useEffect(() => {
    if (!token) return
    const interval = setInterval(() => {
      fetchInquiries()
    }, 30_000)
    return () => clearInterval(interval)
  }, [token, fetchInquiries])

  /* ── Fetch projects ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (!token) return
    const fetchProjects = async () => {
      setProjectsLoading(true)
      try {
        const items = await companyGetProjects(token)
        setProjects(items)
      } catch {
        // silently fail
      } finally {
        setProjectsLoading(false)
      }
    }
    fetchProjects()
  }, [token])

  /* ── Browser tab title badge ──────────────────────────────────────────── */
  useEffect(() => {
    if (stats.answered > 0) {
      document.title = `(${stats.answered}) Dashboard | SEOULINKHEALTH`
    } else {
      document.title = 'Dashboard | SEOULINKHEALTH'
    }
    return () => {
      document.title = 'SEOULINKHEALTH'
    }
  }, [stats.answered])

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  const handleSignOut = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-brand-cream dark:bg-gray-900 transition-colors duration-300">
        {/* Top Navigation */}
        <header className="bg-brand-navy dark:bg-gray-950 shadow-lg border-b border-brand-navy dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Link to="/" className="flex flex-col leading-none">
              <span className="text-sm sm:text-base font-bold tracking-[0.1em] text-white">
                SEOU<span className="text-[#C45C4A]">L</span><span className="text-brand-gold">IN</span><span className="text-[#C45C4A]">K</span>HEALTH
              </span>
              <span className="text-[0.5rem] tracking-[0.25em] text-brand-gold font-bold uppercase mt-0.5">
                K-HEALTH BUSINESS PLATFORM
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white">{company?.companyName}</p>
                <p className="text-xs text-white/60">{company?.contactPerson}</p>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode((d) => !d)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>

              {/* Help Button */}
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Help"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </button>

              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-xs font-bold tracking-widest uppercase border border-white/30 text-white
                           hover:bg-white hover:text-brand-navy rounded-sm transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-brand-border dark:border-gray-700 mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'flex-1 min-w-[100px] py-2.5 px-4 text-xs font-bold tracking-widest uppercase rounded-lg transition-all duration-200',
                  activeTab === tab.key
                    ? 'bg-brand-navy dark:bg-brand-teal text-white shadow-sm'
                    : 'text-brand-muted dark:text-gray-400 hover:text-brand-navy dark:hover:text-white hover:bg-brand-cream/50 dark:hover:bg-gray-700/50',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
                <OverviewTab stats={stats} inquiries={inquiries} loading={loadingInquiries} />
              </motion.div>
            )}
            {activeTab === 'inquiries' && (
              <motion.div key="inquiries" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
                <InquiriesTab inquiries={inquiries} loading={loadingInquiries} />
              </motion.div>
            )}
            {activeTab === 'files' && (
              <motion.div key="files" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
                <FilesTab token={token} />
              </motion.div>
            )}
            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
                <ProjectsTab projects={projects} loading={projectsLoading} />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
                <SettingsTab company={company} token={token} setAuth={setAuth} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-premium-lg w-full max-w-2xl my-8"
              >
                <div className="p-6 border-b border-brand-border dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-brand-navy dark:text-white tracking-wide">Dashboard Help</h2>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="p-1.5 rounded-lg text-brand-muted dark:text-gray-400 hover:bg-brand-cream dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  {HELP_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <h3 className="text-sm font-bold text-brand-navy dark:text-brand-gold tracking-wide uppercase mb-1.5">
                        {section.title}
                      </h3>
                      <p className="text-sm text-brand-muted dark:text-gray-300 leading-relaxed">
                        {section.content}
                      </p>
                      {section.link && (
                        <Link
                          to={section.link}
                          className="inline-block mt-1.5 text-xs font-bold text-brand-teal dark:text-brand-teal-light hover:underline tracking-wide uppercase"
                          onClick={() => setShowHelp(false)}
                        >
                          Go to Q&A &rarr;
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-brand-border dark:border-gray-700 text-right">
                  <button
                    onClick={() => setShowHelp(false)}
                    className="px-5 py-2 text-xs font-bold tracking-widest uppercase bg-brand-navy dark:bg-brand-teal text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Login Notification Popup ─────────────────────────────────────── */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed bottom-6 right-6 z-[70] bg-white dark:bg-gray-800 rounded-xl shadow-premium-lg border border-brand-border dark:border-gray-700 p-5 max-w-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-600 dark:text-emerald-400">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brand-navy dark:text-white">
                    {stats.answered} inquiry{stats.answered !== 1 ? 'ies' : ''} answered
                  </p>
                  <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">
                    The admin has responded to your inquiries. Check the details now.
                  </p>
                  <button
                    onClick={() => {
                      setShowNotification(false)
                      setActiveTab('inquiries')
                    }}
                    className="mt-2 text-xs font-bold text-brand-teal dark:text-brand-teal-light hover:underline tracking-wide uppercase"
                  >
                    Go to Inquiries &rarr;
                  </button>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="p-1 rounded text-brand-muted dark:text-gray-500 hover:text-brand-navy dark:hover:text-white transition-colors shrink-0"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function OverviewTab({
  stats,
  inquiries,
  loading,
}: {
  stats: { total: number; open: number; answered: number; closed: number }
  inquiries: InquiryItem[]
  loading: boolean
}) {
  const statCards = [
    { label: 'Total Inquiries', value: stats.total, color: 'bg-brand-navy' },
    { label: 'Open', value: stats.open, color: 'bg-blue-500' },
    { label: 'Answered', value: stats.answered, color: 'bg-emerald-500' },
    { label: 'Closed', value: stats.closed, color: 'bg-gray-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-brand-border dark:border-gray-700">
            <div className={`w-2 h-2 rounded-full ${s.color} mb-3`} />
            <p className="text-2xl font-bold text-brand-navy dark:text-white">{s.value}</p>
            <p className="text-xs text-brand-muted dark:text-gray-400 font-medium tracking-wide uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Inquiries */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-brand-border dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-brand-border dark:border-gray-700">
          <h3 className="text-sm font-bold text-brand-navy dark:text-white tracking-wide uppercase">Recent Inquiries</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-brand-muted dark:text-gray-400 text-sm">Loading...</div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center text-brand-muted dark:text-gray-400 text-sm">No inquiries yet.</div>
        ) : (
          <ul className="divide-y divide-brand-border dark:divide-gray-700">
            {inquiries.slice(0, 5).map((item) => (
              <li key={item.id} className="p-4 hover:bg-brand-cream/30 dark:hover:bg-gray-700/40 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-navy dark:text-white truncate">{item.inquirySubject}</p>
                    <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   INQUIRIES TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function InquiriesTab({ inquiries, loading }: { inquiries: InquiryItem[]; loading: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-brand-border dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-brand-border dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-brand-navy dark:text-white tracking-wide uppercase">All Inquiries</h3>
        <Link
          to="/company/qa"
          className="text-xs font-bold text-brand-teal dark:text-brand-teal-light hover:underline tracking-wide uppercase"
        >
          Open Q&A
        </Link>
      </div>
      {loading ? (
        <div className="p-8 text-center text-brand-muted dark:text-gray-400 text-sm">Loading...</div>
      ) : inquiries.length === 0 ? (
        <div className="p-8 text-center text-brand-muted dark:text-gray-400 text-sm">
          <p className="mb-2">No inquiries yet.</p>
          <Link to="/request" className="text-brand-teal dark:text-brand-teal-light hover:underline text-sm font-medium">
            Submit your first inquiry
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-brand-border dark:divide-gray-700">
          {inquiries.map((item) => (
            <li key={item.id} className="p-4 hover:bg-brand-cream/30 dark:hover:bg-gray-700/40 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-navy dark:text-white truncate">{item.inquirySubject}</p>
                  <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">
                    Created: {new Date(item.createdAt).toLocaleDateString()} | Updated: {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROJECTS TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function ProjectsTab({ projects, loading }: { projects: ProjectItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-brand-border dark:border-gray-700 p-5 animate-pulse">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-brand-border dark:border-gray-700 p-8 text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 text-brand-muted dark:text-gray-500 mx-auto mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
        <p className="text-sm text-brand-muted dark:text-gray-400">No projects assigned yet.</p>
        <p className="text-xs text-brand-muted dark:text-gray-500 mt-1">
          Projects will appear here once the admin team assigns them to your company.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project) => {
        const statusBadge = PROJECT_STATUS_BADGE[project.status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
        const domainBadge = project.domain
          ? DOMAIN_COLORS[project.domain] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          : null
        const progressColor =
          project.status === 'Completed'
            ? 'bg-green-500'
            : project.status === 'In Progress'
              ? 'bg-amber-500'
              : project.status === 'Review'
                ? 'bg-purple-500'
                : 'bg-blue-500'

        return (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-brand-border dark:border-gray-700 p-5 hover:shadow-card-hover transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h4 className="text-sm font-bold text-brand-navy dark:text-white leading-snug">{project.title}</h4>
              <span
                className={`inline-block text-[0.6rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shrink-0 ${statusBadge}`}
              >
                {project.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-brand-muted dark:text-gray-400 font-medium">Progress</span>
                <span className="text-xs font-bold text-brand-navy dark:text-white">{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Domain tag */}
            {domainBadge && (
              <span className={`inline-block text-[0.6rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full mb-3 ${domainBadge}`}>
                {project.domain}
              </span>
            )}

            {/* Dates */}
            <div className="flex items-center gap-4 text-xs text-brand-muted dark:text-gray-400">
              {project.startDate && (
                <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
              )}
              {project.endDate && (
                <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function SettingsTab({
  company,
  token,
  setAuth,
}: {
  company: CompanyInfo | null
  token: string | null
  setAuth: (token: string, company: CompanyInfo) => void
}) {
  const toast = useToast()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      companyName: company?.companyName ?? '',
      contactPerson: company?.contactPerson ?? '',
      telephone: company?.telephone ?? '',
    },
  })

  const passwordForm = useForm<PasswordForm>()

  const onSaveProfile = async (data: ProfileForm) => {
    if (!token || !company) return
    setSavingProfile(true)
    try {
      const res = await api.patch('/company/profile', data, token)
      const updated = (res.data as CompanyInfo) ?? { ...company, ...data }
      setAuth(token, updated)
      toast.success('Profile updated successfully.')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const onChangePassword = async (data: PasswordForm) => {
    if (!token) return
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error('Passwords do not match.')
      return
    }
    setSavingPassword(true)
    try {
      await api.post('/company/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }, token)
      toast.success('Password changed successfully.')
      passwordForm.reset()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-brand-border dark:border-gray-700 p-6">
        <h3 className="text-sm font-bold text-brand-navy dark:text-white tracking-wide uppercase mb-5">Profile Settings</h3>
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4 max-w-md">
          <div>
            <label className="form-label dark:text-gray-300">Company Name</label>
            <input {...profileForm.register('companyName')} type="text" className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="form-label dark:text-gray-300">Contact Person</label>
            <input {...profileForm.register('contactPerson')} type="text" className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="form-label dark:text-gray-300">Telephone</label>
            <input {...profileForm.register('telephone')} type="tel" className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="btn-primary disabled:opacity-50"
          >
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-brand-border dark:border-gray-700 p-6">
        <h3 className="text-sm font-bold text-brand-navy dark:text-white tracking-wide uppercase mb-5">Change Password</h3>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
          <div>
            <label className="form-label dark:text-gray-300">Current Password</label>
            <input
              {...passwordForm.register('currentPassword', { required: true })}
              type="password"
              className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="form-label dark:text-gray-300">New Password</label>
            <input
              {...passwordForm.register('newPassword', { required: true, minLength: 8 })}
              type="password"
              className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="form-label dark:text-gray-300">Confirm New Password</label>
            <input
              {...passwordForm.register('confirmNewPassword', { required: true })}
              type="password"
              className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="btn-primary disabled:opacity-50"
          >
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FILES TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const ACCEPTED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.txt'
const MAX_SIZE_MB = 10

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'img'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt'
  if (mimeType.includes('zip')) return 'zip'
  return 'txt'
}

const FILE_ICON_COLORS: Record<string, string> = {
  pdf: 'bg-red-100 text-red-600',
  doc: 'bg-blue-100 text-blue-600',
  xls: 'bg-green-100 text-green-600',
  ppt: 'bg-orange-100 text-orange-600',
  img: 'bg-purple-100 text-purple-600',
  zip: 'bg-amber-100 text-amber-600',
  txt: 'bg-gray-100 text-gray-600',
}

function FilesTab({ token }: { token: string | null }) {
  const toast = useToast()
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchFiles = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await companyGetFiles(token)
      setFiles(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleUpload = async (fileList: FileList | File[]) => {
    if (!token) return
    const selected = Array.from(fileList).slice(0, 5)
    if (selected.length === 0) return

    // Client-side validation
    for (const f of selected) {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds the ${MAX_SIZE_MB}MB limit.`)
        return
      }
    }

    setUploading(true)
    try {
      await companyUploadFiles(token, selected)
      toast.success(`${selected.length} file(s) uploaded successfully.`)
      await fetchFiles()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!token) return
    if (!confirm(`Delete "${fileName}"?`)) return
    try {
      await companyDeleteFile(token, fileId)
      toast.success('File deleted.')
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.')
    }
  }

  const handleDownload = async (fileId: string) => {
    if (!token) return
    try {
      await companyDownloadFile(token, fileId)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Download failed.')
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) {
      handleUpload(e.dataTransfer.files)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          'bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-dashed p-8 text-center transition-all cursor-pointer',
          dragOver ? 'border-brand-teal bg-brand-teal/5 dark:bg-brand-teal/10' : 'border-brand-border dark:border-gray-600 hover:border-brand-teal/40 dark:hover:border-brand-teal/40',
        ].join(' ')}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />

        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <>
              <div className="w-10 h-10 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-brand-navy dark:text-white">Uploading...</p>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-brand-teal">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-brand-navy dark:text-white">
                  Drag & drop files here, or <span className="text-brand-teal underline">click to browse</span>
                </p>
                <p className="text-xs text-brand-muted dark:text-gray-400 mt-1">
                  Max {MAX_SIZE_MB}MB per file, up to 5 files at once
                </p>
                <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">
                  PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, ZIP, TXT
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-brand-border dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-brand-border dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-brand-navy dark:text-white tracking-wide uppercase">Uploaded Documents</h3>
          <span className="text-xs text-brand-muted dark:text-gray-400">{files.length} file(s)</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-brand-muted dark:text-gray-400 text-sm">Loading...</div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-brand-muted dark:text-gray-400 text-sm">No files uploaded yet.</div>
        ) : (
          <ul className="divide-y divide-brand-border dark:divide-gray-700">
            {files.map((file) => {
              const icon = getFileIcon(file.mimeType)
              return (
                <li key={file.id} className="p-4 hover:bg-brand-cream/30 dark:hover:bg-gray-700/40 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* File type icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0 ${FILE_ICON_COLORS[icon]}`}>
                      {icon}
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-navy dark:text-white truncate">{file.originalName}</p>
                      <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">
                        {formatFileSize(file.size)} &middot; {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="p-2 rounded-lg text-brand-teal hover:bg-brand-teal/10 transition-colors"
                        title="Download"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(file.id, file.originalName)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════════════════════════════════════ */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Answered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Closed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    New: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Reviewed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    Contacted: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  }

  return (
    <span
      className={`inline-block text-[0.65rem] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shrink-0
        ${colors[status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
    >
      {status}
    </span>
  )
}
