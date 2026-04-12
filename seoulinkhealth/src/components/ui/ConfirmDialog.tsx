import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
}

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-premium-lg p-8 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-base text-gray-600 mb-8 leading-relaxed">{message}</p>
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 min-h-[48px] text-lg font-bold rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 min-h-[48px] text-lg font-bold rounded-xl bg-brand-navy text-white hover:bg-brand-teal transition-colors"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
