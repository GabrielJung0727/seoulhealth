import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { SubmissionItem } from '@/utils/api'
import { SITE_CONFIG } from '@/config/site'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

type Status = 'New' | 'Reviewed' | 'Contacted'
type Tab = 'applications' | 'inquiries'

interface Props {
  isOpen: boolean
  onClose: () => void
  item: SubmissionItem | null
  type: Tab
  onStatusChange: (id: string, status: Status) => Promise<void>
}

const STATUS_MAP: Record<Status, { label: string; bg: string; ring: string; text: string }> = {
  New:       { label: SITE_CONFIG.admin.labels.statusNew,       bg: 'bg-blue-100 hover:bg-blue-200',   ring: 'ring-blue-500',   text: 'text-blue-800'   },
  Reviewed:  { label: SITE_CONFIG.admin.labels.statusReviewed,  bg: 'bg-amber-100 hover:bg-amber-200', ring: 'ring-amber-500',  text: 'text-amber-800'  },
  Contacted: { label: SITE_CONFIG.admin.labels.statusContacted, bg: 'bg-green-100 hover:bg-green-200', ring: 'ring-green-500',  text: 'text-green-800'  },
}

function toKoreanDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
      <dt className="text-xs sm:text-sm font-bold text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm sm:text-lg text-gray-900 whitespace-pre-wrap break-words">{value}</dd>
    </div>
  )
}

export default function DetailModal({ isOpen, onClose, item, type, onStatusChange }: Props) {
  const [confirmStatus, setConfirmStatus] = useState<Status | null>(null)
  const [updating, setUpdating] = useState(false)
  const L = SITE_CONFIG.admin.labels

  if (!item) return null

  const handleConfirm = async () => {
    if (!confirmStatus) return
    setUpdating(true)
    try {
      await onStatusChange(item.id, confirmStatus)
    } finally {
      setUpdating(false)
      setConfirmStatus(null)
    }
  }

  const appFields = (
    <>
      <Field label={L.fieldName} value={item.fullName} />
      <Field label={L.fieldEmail} value={item.email} />
      <Field label={L.fieldPhone} value={item.dialCode && item.telephone ? `${item.dialCode} ${item.telephone}` : item.telephone} />
      <Field label={L.fieldCountry} value={item.countryOfOrigin} />
      <Field label={L.fieldSpecialty} value={item.specialty} />
      <Field label={L.fieldEducation} value={item.education} />
      <Field label={L.fieldExperiences} value={item.experiences} />
    </>
  )

  const inqFields = (
    <>
      <Field label={L.fieldName} value={item.fullName} />
      <Field label={L.fieldEmail} value={item.email} />
      <Field label={L.fieldPhone} value={item.dialCode && item.telephone ? `${item.dialCode} ${item.telephone}` : item.telephone} />
      <Field label={L.fieldEmployment} value={item.currentEmployment} />
      <Field label={L.fieldExperiences} value={item.experiences ?? (item as Record<string, unknown>).professionalExperiences as string} />
      <Field label={L.fieldSubject} value={item.inquirySubject} />
      <Field label={L.fieldDescription} value={item.inquiryDescription} />
      <Field label={L.fieldComments} value={item.additionalComments} />
    </>
  )

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-premium-lg w-full max-w-3xl my-8"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-3 border-b border-gray-100 no-print">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{item.fullName}</h2>
                  <p className="text-sm sm:text-base text-gray-500 mt-1">{toKoreanDateTime(item.createdAt)}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-base font-bold ${STATUS_MAP[item.status].bg} ${STATUS_MAP[item.status].text}`}>
                  {STATUS_MAP[item.status].label}
                </div>
              </div>

              {/* Fields */}
              <div className="p-4 sm:p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {type === 'applications' ? appFields : inqFields}
                </dl>
              </div>

              {/* Status Change */}
              <div className="px-4 sm:px-6 pb-4 no-print">
                <p className="text-sm sm:text-base font-bold text-gray-700 mb-3">{L.changeStatus}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {(['New', 'Reviewed', 'Contacted'] as Status[]).map((s) => (
                    <button
                      key={s}
                      disabled={updating}
                      onClick={() => {
                        if (s !== item.status) setConfirmStatus(s)
                      }}
                      className={`min-h-[44px] sm:min-h-[56px] text-sm sm:text-lg font-bold rounded-xl border-2 transition-all ${STATUS_MAP[s].bg} ${STATUS_MAP[s].text} ${
                        s === item.status ? `ring-2 ring-offset-2 ${STATUS_MAP[s].ring} border-transparent` : 'border-gray-200'
                      } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {STATUS_MAP[s].label}
                      {s === item.status && ' ✓'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-100 no-print">
                <button
                  onClick={() => window.print()}
                  className="min-h-[44px] sm:min-h-[48px] px-4 sm:px-6 text-sm sm:text-base font-bold rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {L.print}
                </button>
                <div className="flex-1" />
                <button
                  onClick={onClose}
                  className="min-h-[44px] sm:min-h-[48px] px-6 sm:px-8 text-sm sm:text-base font-bold rounded-xl bg-brand-navy text-white hover:bg-brand-teal transition-colors"
                >
                  {L.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!confirmStatus}
        title={L.confirmTitle}
        message={L.confirmStatusChange}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmStatus(null)}
      />
    </>
  )
}
