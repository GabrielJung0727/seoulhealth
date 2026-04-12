import { useModalStore } from '@/store/modalStore'
import type { ModalType } from '@/types'

/**
 * Convenience hook for modal open/close actions.
 */
export function useModal() {
  const { activeModal, openModal, closeModal } = useModalStore()

  return {
    activeModal,
    openModal: (type: ModalType) => openModal(type),
    closeModal,
    isOpen: (type: ModalType) => activeModal === type,
    isAnyOpen: activeModal !== null,
  }
}
