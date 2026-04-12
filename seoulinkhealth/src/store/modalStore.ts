import { create } from 'zustand'
import type { ModalType } from '@/types'

/**
 * Modal Store — manages which modal (if any) is currently open.
 * Used by Application Form and Inquiry Form triggers.
 */
interface ModalStore {
  activeModal: ModalType
  openModal: (type: ModalType) => void
  closeModal: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  activeModal: null,
  openModal: (type) => set({ activeModal: type }),
  closeModal: () => set({ activeModal: null }),
}))
