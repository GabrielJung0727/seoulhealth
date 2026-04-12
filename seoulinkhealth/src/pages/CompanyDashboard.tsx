import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCompanyAuthStore } from '@/store/companyAuthStore'
import {
  getCompanyProfile,
  updateCompanyProfile,
  getQAThreads,
  ApiError,
  api,
} from '@/utils/api'
// QAThread type used internally via getQAThreads return
import { usePageTitle } from '@/hooks/usePageTitle'
import PhoneInput from '@/components/ui/PhoneInput'
import CountrySelect from '@/components/ui/CountrySelect'

/* ─── Settings Schema ────────────────────────────────────────────────────── */
const settingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  contactPerson: z.string().min(1, 'Contact person is required.'),
  dialCode: z.string().default('+82'),
  telephone: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  industry: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) return false
  return true
}, { message: 'Passwords do not match.', path: ['confirmNewPassword'] })

type SettingsValues = z.infer<typeof settingsSchema>

type TabId = 'overview' | 'inquiries' | 'settings'

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function CompanyDashboardPage() {
  usePageTitle('Dashboard')
  const navigate = useNavigate()
  const { token, company, clearAuth } = useCompanyAuthStore()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const handleSignOut = () => {
    clearAuth()
    navigate('/company/login', { replace: true })
  }

  const tabs: { id: TabId; label: string; icon: JSX.Element }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'inquiries',
      label: 'My Inquiries',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="admin-layout min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-brand-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex flex-col leading-none hover:opacity-80 transition-opacity">
              <span className="text-base font-bold tracking-[0.1em] text-white">
                SEOUL<span className="text-brand-gold">LINK</span>HEALTH
              </span>
              <span className="text-[0.5rem] tracking-[0.25em] text-white/40 font-semibold uppercase mt-0.5">
                Company Portal
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{company?.companyName}</p>
              <p className="text-xs text-white/50">{company?.contactPerson}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-brand-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1" aria-label="Dashboard tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-brand-teal text-brand-navy'
                    : 'border-transparent text-brand-muted hover:text-brand-navy hover:border-gray-300'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <OverviewTab token={token} company={company} />
            </motion.div>
          )}
          {activeTab === 'inquiries' && (
            <motion.div key="inquiries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <InquiriesTab token={token} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <SettingsTab token={token} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Overview Tab ───────────────────────────────────────────────────────── */
function OverviewTab({ token, company }: { token: string | null; company: { companyName: string; contactPerson: string } | null }) {
  const [stats, setStats] = useState({ inquiries: 0, qaThreads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const fetchStats = async () => {
      try {
        const [inquiriesRes, qaRes] = await Promise.allSettled([
          api.get<{ total?: number }>('/company/inquiries?limit=1', token),
          getQAThreads(token),
        ])
        setStats({
          inquiries: inquiriesRes.status === 'fulfilled'
            ? ((inquiriesRes.value as unknown as { pagination?: { total: number } })?.pagination?.total ?? 0)
            : 0,
          qaThreads: qaRes.status === 'fulfilled' ? qaRes.value.length : 0,
        })
      } catch {
        // Silently handle — stats are non-critical
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [token])

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-white rounded-2xl shadow-premium border border-brand-border p-8">
        <h2 className="text-2xl font-bold text-brand-navy">
          Welcome, {company?.contactPerson ?? 'User'}
        </h2>
        <p className="text-brand-muted mt-2 text-lg">
          {company?.companyName} - Company Dashboard
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-premium border border-brand-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-brand-muted">My Inquiries</p>
              <p className="text-3xl font-bold text-brand-navy">
                {loading ? '...' : stats.inquiries}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-premium border border-brand-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-brand-muted">Q&A Threads</p>
              <p className="text-3xl font-bold text-brand-navy">
                {loading ? '...' : stats.qaThreads}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Inquiries Tab ──────────────────────────────────────────────────────── */
interface InquiryItem {
  id: string
  createdAt: string
  inquirySubject?: string
  inquiryDescription?: string
  status: string
}

function InquiriesTab({ token }: { token: string | null }) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const fetch = async () => {
      try {
        const res = await api.get<InquiryItem[]>('/company/inquiries', token)
        const raw = res as unknown as { data: InquiryItem[] }
        setInquiries(raw.data ?? [])
      } catch {
        // Handle error silently
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-8 h-8 text-brand-teal" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-premium border border-brand-border p-12 text-center">
        <svg className="w-16 h-16 text-brand-muted/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-semibold text-brand-navy">No inquiries yet</p>
        <p className="text-brand-muted mt-1">Your submitted inquiries will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {inquiries.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-premium border border-brand-border p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-brand-navy truncate">
                {item.inquirySubject || 'No subject'}
              </h3>
              <p className="text-brand-muted text-sm mt-1 line-clamp-2">
                {item.inquiryDescription || 'No description'}
              </p>
              <p className="text-xs text-brand-muted mt-2">
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            <StatusBadge status={item.status} />
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    New: 'bg-blue-50 text-blue-700 border-blue-200',
    Reviewed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Contacted: 'bg-green-50 text-green-700 border-green-200',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  )
}

/* ─── Settings Tab ───────────────────────────────────────────────────────── */
function SettingsTab({ token }: { token: string | null }) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { dialCode: '+82' },
  })

  // Load profile
  const loadProfile = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const profile = await getCompanyProfile(token)
      reset({
        companyName: profile.companyName ?? '',
        contactPerson: profile.contactPerson ?? '',
        dialCode: profile.dialCode ?? '+82',
        telephone: profile.telephone ?? '',
        countryOfOrigin: profile.countryOfOrigin ?? '',
        industry: profile.industry ?? '',
      })
    } catch {
      setErrorMsg('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }, [token, reset])

  useEffect(() => { loadProfile() }, [loadProfile])

  const onSubmit = async (data: SettingsValues) => {
    if (!token) return
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const payload: Record<string, string | undefined> = {
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        dialCode: data.dialCode,
        telephone: data.telephone,
        countryOfOrigin: data.countryOfOrigin,
        industry: data.industry,
      }
      if (data.newPassword) {
        payload.currentPassword = data.currentPassword
        payload.newPassword = data.newPassword
      }
      await updateCompanyProfile(token, payload)
      setSuccessMsg('Profile updated successfully.')
      // Clear password fields
      setValue('currentPassword', '')
      setValue('newPassword', '')
      setValue('confirmNewPassword', '')
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-8 h-8 text-brand-teal" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-premium border border-brand-border overflow-hidden">
        <div className="px-8 py-6 border-b border-brand-border">
          <h2 className="text-xl font-bold text-brand-navy">Account Settings</h2>
          <p className="text-brand-muted text-sm mt-1">Update your company profile and password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-8 py-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-bold text-brand-navy mb-2">
                Company Name<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                {...register('companyName')}
                type="text"
                className={`w-full h-12 px-4 rounded-xl border-2 ${errors.companyName ? 'border-red-400' : 'border-gray-200'} focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors`}
              />
              {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>}
            </div>

            <div>
              <label className="block text-base font-bold text-brand-navy mb-2">
                Contact Person<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                {...register('contactPerson')}
                type="text"
                className={`w-full h-12 px-4 rounded-xl border-2 ${errors.contactPerson ? 'border-red-400' : 'border-gray-200'} focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors`}
              />
              {errors.contactPerson && <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>}
            </div>
          </div>

          <PhoneInput
            register={register}
            phoneName="telephone"
            dialCodeName="dialCode"
            watch={watch}
            setValue={setValue}
            phoneError={errors.telephone?.message}
            label="Telephone"
            className="[&_.form-input]:h-12 [&_.form-input]:rounded-xl [&_.form-input]:border-2"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CountrySelect
              register={register}
              name="countryOfOrigin"
              watch={watch}
              setValue={setValue}
              error={errors.countryOfOrigin?.message}
              label="Country"
              className="[&_.form-input]:h-12 [&_.form-input]:rounded-xl [&_.form-input]:border-2"
            />
            <div>
              <label className="block text-base font-bold text-brand-navy mb-2">Industry</label>
              <input
                {...register('industry')}
                type="text"
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Change Password section */}
          <div className="pt-4 border-t border-brand-border">
            <h3 className="text-lg font-bold text-brand-navy mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-navy mb-1.5">Current Password</label>
                <input
                  {...register('currentPassword')}
                  type="password"
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors"
                  autoComplete="current-password"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-brand-navy mb-1.5">New Password</label>
                  <input
                    {...register('newPassword')}
                    type="password"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-navy mb-1.5">Confirm New Password</label>
                  <input
                    {...register('confirmNewPassword')}
                    type="password"
                    className={`w-full h-12 px-4 rounded-xl border-2 ${errors.confirmNewPassword ? 'border-red-400' : 'border-gray-200'} focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors`}
                    autoComplete="new-password"
                  />
                  {errors.confirmNewPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="rounded-xl bg-red-50 border-2 border-red-200 px-5 py-3 text-sm text-red-700 font-medium">{errorMsg}</div>
          )}
          {successMsg && (
            <div className="rounded-xl bg-green-50 border-2 border-green-200 px-5 py-3 text-sm text-green-700 font-medium">{successMsg}</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[48px] text-base font-bold rounded-xl bg-brand-navy text-white hover:bg-brand-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
