import { create } from 'zustand'
import type { Submission, SubmissionStatus } from '@/types'

/**
 * Submission Store — in-memory store for form submissions.
 * Day 5: connect to a real backend / database.
 */
interface SubmissionStore {
  submissions: Submission[]
  addSubmission: (submission: Submission) => void
  updateStatus: (id: string, status: SubmissionStatus) => void
  getByType: (type: Submission['type']) => Submission[]
}

export const useSubmissionStore = create<SubmissionStore>((set, get) => ({
  submissions: [],

  addSubmission: (submission) =>
    set((state) => ({
      submissions: [submission, ...state.submissions],
    })),

  updateStatus: (id, status) =>
    set((state) => ({
      submissions: state.submissions.map((s) => (s.id === id ? { ...s, status } : s)),
    })),

  getByType: (type) => get().submissions.filter((s) => s.type === type),
}))
