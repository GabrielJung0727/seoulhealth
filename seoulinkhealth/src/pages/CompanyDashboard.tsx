import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useCompanyAuthStore, type CompanyInfo } from '@/store/companyAuthStore'
import { useToast } from '@/store/toastStore'
import { api, companyUploadFiles, companyGetFiles, companyDownloadFile, companyDeleteFile, type FileItem } from '@/utils/api'

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Tab = 'overview' | 'inquiries' | 'files' | 'settings'

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
    { key: 'files', label: 'Documents' },
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
              SEOU<span className="text-[#C45C4A]">L</span><span className="text-brand-gold">IN</span><span className="text-[#C45C4A]">K</span>HEALTH
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
          {activeTab === 'files' && (
            <motion.div key="files" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
              <FilesTab token={token} />
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
          'bg-white rounded-xl shadow-sm border-2 border-dashed p-8 text-center transition-all cursor-pointer',
          dragOver ? 'border-brand-teal bg-brand-teal/5' : 'border-brand-border hover:border-brand-teal/40',
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
              <p className="text-sm font-semibold text-brand-navy">Uploading...</p>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-brand-teal">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-brand-navy">
                  Drag & drop files here, or <span className="text-brand-teal underline">click to browse</span>
                </p>
                <p className="text-xs text-brand-muted mt-1">
                  Max {MAX_SIZE_MB}MB per file, up to 5 files at once
                </p>
                <p className="text-xs text-brand-muted mt-0.5">
                  PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, ZIP, TXT
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-brand-navy tracking-wide uppercase">Uploaded Documents</h3>
          <span className="text-xs text-brand-muted">{files.length} file(s)</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-brand-muted text-sm">Loading...</div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-brand-muted text-sm">No files uploaded yet.</div>
        ) : (
          <ul className="divide-y divide-brand-border">
            {files.map((file) => {
              const icon = getFileIcon(file.mimeType)
              return (
                <li key={file.id} className="p-4 hover:bg-brand-cream/30 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* File type icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0 ${FILE_ICON_COLORS[icon]}`}>
                      {icon}
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-navy truncate">{file.originalName}</p>
                      <p className="text-xs text-brand-muted mt-0.5">
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
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
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
