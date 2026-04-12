import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCompanyAuthStore } from '@/store/companyAuthStore'
import {
  getQAThreads,
  getQAThread,
  createQAThread,
  replyToQAThread,
} from '@/utils/api'
import type { QAThread, QAThreadDetail, QAMessage } from '@/utils/api'
import { usePageTitle } from '@/hooks/usePageTitle'

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function CompanyQAPage() {
  usePageTitle('Q&A')
  const { token } = useCompanyAuthStore()
  const [threads, setThreads] = useState<QAThread[]>([])
  const [selectedThread, setSelectedThread] = useState<QAThreadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [threadLoading, setThreadLoading] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)

  /* ─── Load threads ────────────────────────────────────────────────────── */
  const loadThreads = useCallback(async () => {
    if (!token) return
    try {
      const data = await getQAThreads(token)
      setThreads(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadThreads() }, [loadThreads])

  /* ─── Select thread ───────────────────────────────────────────────────── */
  const handleSelectThread = useCallback(async (threadId: string) => {
    if (!token) return
    setThreadLoading(true)
    setShowNewForm(false)
    try {
      const detail = await getQAThread(token, threadId)
      setSelectedThread(detail)
    } catch {
      // silent
    } finally {
      setThreadLoading(false)
    }
  }, [token])

  /* ─── Create thread ───────────────────────────────────────────────────── */
  const handleCreateThread = useCallback(async (subject: string, content: string) => {
    if (!token) return
    try {
      const thread = await createQAThread(token, { subject, content })
      setThreads((prev) => [thread, ...prev])
      setShowNewForm(false)
      // Auto-select the new thread
      handleSelectThread(thread.id)
    } catch {
      throw new Error('Failed to create thread.')
    }
  }, [token, handleSelectThread])

  /* ─── Reply ───────────────────────────────────────────────────────────── */
  const handleReply = useCallback(async (content: string) => {
    if (!token || !selectedThread) return
    try {
      const message = await replyToQAThread(token, selectedThread.id, content)
      setSelectedThread((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, message],
      } : prev)
      // Update thread list message count
      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThread.id
            ? { ...t, messageCount: (t.messageCount ?? 0) + 1 }
            : t
        )
      )
    } catch {
      throw new Error('Failed to send reply.')
    }
  }, [token, selectedThread])

  return (
    <div className="admin-layout min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[0.6rem] font-bold tracking-[0.22em] uppercase text-brand-gold/80">
              SEOULINKHEALTH
            </p>
            <h1 className="text-xl font-bold mt-0.5">Q&A Board</h1>
          </div>
          <a
            href="/company/dashboard"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-200px)]">
          {/* Thread list */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-2xl shadow-premium border border-brand-border overflow-hidden">
              {/* Header with new question button */}
              <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
                <h2 className="font-bold text-brand-navy">Threads</h2>
                <button
                  onClick={() => { setShowNewForm(true); setSelectedThread(null) }}
                  className="px-3 py-1.5 rounded-lg bg-brand-navy text-white text-sm font-medium hover:bg-brand-teal transition-colors"
                >
                  + New Question
                </button>
              </div>

              {/* Thread items */}
              <div className="max-h-[600px] overflow-y-auto divide-y divide-brand-border">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin w-6 h-6 text-brand-teal" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : threads.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-brand-muted text-sm">No threads yet.</p>
                    <p className="text-brand-muted text-xs mt-1">Start by asking a new question.</p>
                  </div>
                ) : (
                  threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => handleSelectThread(thread.id)}
                      className={`w-full text-left px-5 py-4 hover:bg-brand-cream/50 transition-colors
                        ${selectedThread?.id === thread.id ? 'bg-brand-cream/80 border-l-3 border-l-brand-teal' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-brand-navy text-sm truncate flex-1">
                          {thread.subject}
                        </h3>
                        <QAStatusBadge status={thread.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-brand-muted">
                        <span>
                          {new Date(thread.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                          })}
                        </span>
                        <span>{thread.messageCount ?? 0} messages</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right panel: detail or new form */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {showNewForm ? (
                <motion.div key="new-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <NewQuestionForm
                    onSubmit={handleCreateThread}
                    onCancel={() => setShowNewForm(false)}
                  />
                </motion.div>
              ) : threadLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow-premium border border-brand-border flex items-center justify-center py-20"
                >
                  <svg className="animate-spin w-8 h-8 text-brand-teal" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </motion.div>
              ) : selectedThread ? (
                <motion.div key={selectedThread.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <ThreadDetail thread={selectedThread} onReply={handleReply} />
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow-premium border border-brand-border flex flex-col items-center justify-center py-20"
                >
                  <svg className="w-16 h-16 text-brand-muted/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-semibold text-brand-navy">Select a thread</p>
                  <p className="text-brand-muted text-sm mt-1">Choose a thread from the left or start a new question.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Q&A Status Badge ───────────────────────────────────────────────────── */
function QAStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Open: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    Answered: { bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
    Closed: { bg: 'bg-gray-100 border-gray-200', text: 'text-gray-500' },
  }
  const s = map[status] ?? map.Open
  return (
    <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border shrink-0 ${s.bg} ${s.text}`}>
      {status}
    </span>
  )
}

/* ─── New Question Form ──────────────────────────────────────────────────── */
function NewQuestionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (subject: string, content: string) => Promise<void>
  onCancel: () => void
}) {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !content.trim()) {
      setError('Please fill in both subject and content.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit(subject, content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-premium border border-brand-border overflow-hidden">
      <div className="px-6 py-5 border-b border-brand-border">
        <h2 className="text-lg font-bold text-brand-navy">Ask a New Question</h2>
        <p className="text-brand-muted text-sm mt-0.5">Our team will respond to your inquiry.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-bold text-brand-navy mb-1.5">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors"
            placeholder="Brief description of your question"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-brand-navy mb-1.5">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors resize-none"
            placeholder="Describe your question in detail..."
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-700 font-medium">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 min-h-[48px] text-base font-bold rounded-xl bg-brand-navy text-white hover:bg-brand-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Question'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 min-h-[48px] rounded-xl border-2 border-gray-200 text-brand-navy font-bold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

/* ─── Thread Detail View ─────────────────────────────────────────────────── */
function ThreadDetail({
  thread,
  onReply,
}: {
  thread: QAThreadDetail
  onReply: (content: string) => Promise<void>
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [replyContent, setReplyContent] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread.messages.length])

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    setSending(true)
    setError('')
    try {
      await onReply(replyContent)
      setReplyContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-premium border border-brand-border overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      {/* Thread header */}
      <div className="px-6 py-5 border-b border-brand-border shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-brand-navy">{thread.subject}</h2>
            <p className="text-xs text-brand-muted mt-1">
              Created {new Date(thread.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <QAStatusBadge status={thread.status} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {thread.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply input */}
      {thread.status !== 'Closed' && (
        <div className="shrink-0 border-t border-brand-border p-4">
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSendReply} className="flex gap-3">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="flex-1 h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-colors text-sm"
              placeholder="Type your reply..."
            />
            <button
              type="submit"
              disabled={sending || !replyContent.trim()}
              className="px-5 h-11 rounded-xl bg-brand-navy text-white text-sm font-bold hover:bg-brand-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

/* ─── Message Bubble ─────────────────────────────────────────────────────── */
function MessageBubble({ message }: { message: QAMessage }) {
  const isCompany = message.senderType === 'company'

  return (
    <div className={`flex ${isCompany ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3 ${
          isCompany
            ? 'bg-brand-navy text-white rounded-br-md'
            : 'bg-brand-gold/10 text-brand-navy border border-brand-gold/20 rounded-bl-md'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold ${isCompany ? 'text-white/70' : 'text-brand-gold'}`}>
            {isCompany ? 'You' : 'SEOULINKHEALTH'}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <p className={`text-[0.65rem] mt-2 ${isCompany ? 'text-white/40' : 'text-brand-muted'}`}>
          {new Date(message.createdAt).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
