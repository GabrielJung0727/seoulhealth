import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useCompanyAuthStore, type CompanyInfo } from '@/store/companyAuthStore'
import { useToast } from '@/store/toastStore'
import { api } from '@/utils/api'

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Tab = 'overview' | 'inquiries' | 'settings'

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

export default function CompanyDashboardPage() {
  usePageTitle('Company Dashboard')
  const navigate = useNavigate()
  const { token, company, setAuth, clearAuth } = useCompanyAuthStore()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [inquiries, setInquiries] = useState<InquiryItem[]>([])
  const [loadingInquiries, setLoadingInquiries] = useState(false)
  const [stats, setStats] = useState({ total: 0, open: 0, answered: 0, closed: 0 })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'inquiries', label: 'My Inquiries' },
    { key: 'settings', label: 'Settings' },
  ]

  // Fetch inquiries for overview and list
  useEffect(() => {
    if (!token) return
    const fetchInquiries = async () => {
      setLoadingInquiries(true)
      try {
        const res = await api.get<{ data: InquiryItem[]; pagination: { total: number } }>(
          '/company/inquiries',
          token
        )
        const data = res.data as { data: InquiryItem[]; pagination: { total: number } }
        const items = data?.data ?? []
        setInquiries(items)
        setStats({
          total: items.length,
          open: items.filter((i) => i.status === 'Open').length,
          answered: items.filter((i) => i.status === 'Answered').length,
          closed: items.filter((i) => i.status === 'Closed').length,
        })
      } catch {
        // silently fail — empty state shown
      } finally {
        setLoadingInquiries(false)
      }
    }
    fetchInquiries()
  }, [token])

  const handleSignOut = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Top Navigation */}
      <header className="bg-brand-navy shadow-lg border-b border-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-sm sm:text-base font-bold tracking-[0.1em] text-white">
              SEOUL<span className="text-brand-gold">INK</span>HEALTH
            </span>
            <span className="text-[0.5rem] tracking-[0.25em] text-brand-gold font-bold uppercase mt-0.5">
              K-HEALTH BUSINESS PLATFORM
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white">{company?.companyName}</p>
              <p className="text-xs text-white/60">{company?.contactPerson}</p>
            </div>
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
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-brand-border mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex-1 min-w-[100px] py-2.5 px-4 text-xs font-bold tracking-widest uppercase rounded-lg transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-brand-muted hover:text-brand-navy hover:bg-brand-cream/50',
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
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
              <SettingsTab company={company} token={token} setAuth={setAuth} />
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
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-brand-border">
            <div className={`w-2 h-2 rounded-full ${s.color} mb-3`} />
            <p className="text-2xl font-bold text-brand-navy">{s.value}</p>
            <p className="text-xs text-brand-muted font-medium tracking-wide uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Inquiries */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
        <div className="p-5 border-b border-brand-border">
          <h3 className="text-sm font-bold text-brand-navy tracking-wide uppercase">Recent Inquiries</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-brand-muted text-sm">Loading...</div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center text-brand-muted text-sm">No inquiries yet.</div>
        ) : (
          <ul className="divide-y divide-brand-border">
            {inquiries.slice(0, 5).map((item) => (
              <li key={item.id} className="p-4 hover:bg-brand-cream/30 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-navy truncate">{item.inquirySubject}</p>
                    <p className="text-xs text-brand-muted mt-0.5">
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
    <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
      <div className="p-5 border-b border-brand-border flex items-center justify-between">
        <h3 className="text-sm font-bold text-brand-navy tracking-wide uppercase">All Inquiries</h3>
        <Link
          to="/company/qa"
          className="text-xs font-bold text-brand-teal hover:underline tracking-wide uppercase"
        >
          Open Q&A
        </Link>
      </div>
      {loading ? (
        <div className="p-8 text-center text-brand-muted text-sm">Loading...</div>
      ) : inquiries.length === 0 ? (
        <div className="p-8 text-center text-brand-muted text-sm">
          <p className="mb-2">No inquiries yet.</p>
          <Link to="/request" className="text-brand-teal hover:underline text-sm font-medium">
            Submit your first inquiry
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-brand-border">
          {inquiries.map((item) => (
            <li key={item.id} className="p-4 hover:bg-brand-cream/30 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-navy truncate">{item.inquirySubject}</p>
                  <p className="text-xs text-brand-muted mt-0.5">
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
      <div className="bg-white rounded-xl shadow-sm border border-brand-border p-6">
        <h3 className="text-sm font-bold text-brand-navy tracking-wide uppercase mb-5">Profile Settings</h3>
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4 max-w-md">
          <div>
            <label className="form-label">Company Name</label>
            <input {...profileForm.register('companyName')} type="text" className="form-input" />
          </div>
          <div>
            <label className="form-label">Contact Person</label>
            <input {...profileForm.register('contactPerson')} type="text" className="form-input" />
          </div>
          <div>
            <label className="form-label">Telephone</label>
            <input {...profileForm.register('telephone')} type="tel" className="form-input" />
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
      <div className="bg-white rounded-xl shadow-sm border border-brand-border p-6">
        <h3 className="text-sm font-bold text-brand-navy tracking-wide uppercase mb-5">Change Password</h3>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
          <div>
            <label className="form-label">Current Password</label>
            <input
              {...passwordForm.register('currentPassword', { required: true })}
              type="password"
              className="form-input"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input
              {...passwordForm.register('newPassword', { required: true, minLength: 8 })}
              type="password"
              className="form-input"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input
              {...passwordForm.register('confirmNewPassword', { required: true })}
              type="password"
              className="form-input"
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
   STATUS BADGE
   ═══════════════════════════════════════════════════════════════════════════ */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Open: 'bg-blue-100 text-blue-700',
    Answered: 'bg-emerald-100 text-emerald-700',
    Closed: 'bg-gray-100 text-gray-600',
    New: 'bg-amber-100 text-amber-700',
    Reviewed: 'bg-indigo-100 text-indigo-700',
    Contacted: 'bg-green-100 text-green-700',
  }

  return (
    <span
      className={`inline-block text-[0.65rem] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shrink-0
        ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {status}
    </span>
  )
}
