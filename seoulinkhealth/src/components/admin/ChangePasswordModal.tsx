import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { changeAdminPassword } from '@/utils/api'
import { useAuthStore } from '@/store/authStore'

interface Props {
  isOpen: boolean
  onClose: () => void
  onChanged: () => void
}

const MIN_LENGTH = 10

const inputClass =
  'w-full min-h-[48px] text-base rounded-xl border-2 border-gray-200 px-4 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors'

/**
 * Lets the signed-in admin replace the dashboard password.
 * The server checks the current password before storing the new one.
 */
export default function ChangePasswordModal({ isOpen, onClose, onChanged }: Props) {
  const token = useAuthStore((s) => s.token)!
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const close = () => {
    setCurrent('')
    setNext('')
    setConfirm('')
    setError('')
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (next.length < MIN_LENGTH) return setError(`새 비밀번호는 ${MIN_LENGTH}자 이상이어야 합니다.`)
    if (next !== confirm) return setError('새 비밀번호와 확인 값이 일치하지 않습니다.')
    if (next === current) return setError('현재 비밀번호와 다른 비밀번호를 입력해 주세요.')

    setSaving(true)
    setError('')
    try {
      await changeAdminPassword(token, current, next)
      onChanged()
      close()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(
        message.includes('incorrect')
          ? '현재 비밀번호가 올바르지 않습니다.'
          : message.includes('Too many')
            ? '시도 횟수가 너무 많습니다. 15분 후 다시 시도해 주세요.'
            : '비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onClick={close}
        >
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-premium-lg w-full max-w-md p-6 space-y-4"
            aria-labelledby="change-password-title"
          >
            <h2 id="change-password-title" className="text-xl font-bold text-gray-900">
              관리자 비밀번호 변경
            </h2>
            <p className="text-sm text-gray-500">
              변경 즉시 다음 로그인부터 새 비밀번호가 적용됩니다. ({MIN_LENGTH}자 이상)
            </p>

            <label className="block space-y-1">
              <span className="text-sm font-bold text-gray-700">현재 비밀번호</span>
              <input type="password" autoComplete="current-password" required value={current}
                onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-bold text-gray-700">새 비밀번호</span>
              <input type="password" autoComplete="new-password" required minLength={MIN_LENGTH} value={next}
                onChange={(e) => setNext(e.target.value)} className={inputClass} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-bold text-gray-700">새 비밀번호 확인</span>
              <input type="password" autoComplete="new-password" required value={confirm}
                onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
            </label>

            {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={close}
                className="flex-1 min-h-[48px] font-bold rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100">
                취소
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 min-h-[48px] font-bold rounded-xl bg-brand-navy text-white hover:bg-brand-teal disabled:opacity-50">
                {saving ? '변경 중…' : '변경'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
