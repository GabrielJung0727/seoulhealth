import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useCompanyAuthStore } from '@/store/companyAuthStore'
import { useToast } from '@/store/toastStore'
import { api } from '@/utils/api'

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface QAMessage {
  id: string
  sender: 'company' | 'admin'
  content: string
  createdAt: string
}

interface QAThread {
  id: string
  subject: string
  status: 'Open' | 'Answered' | 'Closed'
  createdAt: string
  updatedAt: string
  messages: QAMessage[]
}

/* ─── Animation ──────────────────────────────────────────────────────────── */

export default function CompanyQAPage() {
  usePageTitle('Q&A')
  const { token, company } = useCompanyAuthStore()
  const toast = useToast()

  const [threads, setThreads] = useState<QAThread[]>([])
  const [selectedThread, setSelectedThread] = useState<QAThread | null>(null)
  const [loading, setLoading] = useState(false)
  const [showNewThread, setShowNewThread] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [creatingThread, setCreatingThread] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch threads
  useEffect(() => {
    if (!token) return
    fetchThreads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchThreads = async () => {
    setLoading(true)
    try {
      const res = await api.get<QAThread[]>('/company/qa/threads', token!)
      const raw = res as unknown as Record<string, unknown>
      const threads = raw.data ?? res.data
      setThreads(Array.isArray(threads) ? threads as QAThread[] : [])
    } catch {
      // empty state
    } finally {
      setLoading(false)
    }
  }

  const fetchThread = async (id: string) => {
    try {
      const res = await api.get<QAThread>(`/company/qa/threads/${id}`, token!)
      const raw = res as unknown as Record<string, unknown>
      const thread = (raw.data ?? res.data) as QAThread
      setSelectedThread(thread)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      toast.error('Failed to load thread.')
    }
  }

  const handleCreateThread = async () => {
    if (!newSubject.trim() || !newMessage.trim()) {
      toast.error('Please provide a subject and message.')
      return
    }
    setCreatingThread(true)
    try {
      await api.post(
        '/company/qa/threads',
        { subject: newSubject, message: newMessage },
        token!
      )
      toast.success('Thread created successfully.')
      setShowNewThread(false)
      setNewSubject('')
      setNewMessage('')
      await fetchThreads()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create thread.')
    } finally {
      setCreatingThread(false)
    }
  }

  const handleReply = async () => {
    if (!replyText.trim() || !selectedThread) return
    setSendingReply(true)
    try {
      await api.post(
        `/company/qa/threads/${selectedThread.id}/reply`,
        { message: replyText },
        token!
      )
      setReplyText('')
      await fetchThread(selectedThread.id)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reply.')
    } finally {
      setSendingReply(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleReply()
    }
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
            <span className="hidden sm:inline text-sm text-white/60">{company?.companyName}</span>
            <Link
              to="/company/dashboard"
              className="text-xs font-bold text-white/70 hover:text-white tracking-wide uppercase"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-brand-navy tracking-wide">Q&A Threads</h1>
          <button
            onClick={() => setShowNewThread(true)}
            className="btn-primary text-xs"
          >
            New Thread
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '60vh' }}>
          {/* Thread List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
            <div className="p-4 border-b border-brand-border">
              <h2 className="text-xs font-bold text-brand-navy tracking-widest uppercase">Threads</h2>
            </div>
            {loading ? (
              <div className="p-6 text-center text-brand-muted text-sm">Loading...</div>
            ) : threads.length === 0 ? (
              <div className="p-6 text-center text-brand-muted text-sm">No threads yet.</div>
            ) : (
              <ul className="divide-y divide-brand-border max-h-[500px] overflow-y-auto">
                {threads.map((thread) => (
                  <li key={thread.id}>
                    <button
                      onClick={() => fetchThread(thread.id)}
                      className={[
                        'w-full text-left p-4 transition-colors duration-150',
                        selectedThread?.id === thread.id
                          ? 'bg-brand-cream border-l-2 border-brand-gold'
                          : 'hover:bg-brand-cream/50',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-brand-navy truncate flex-1">
                          {thread.subject}
                        </p>
                        <StatusBadge status={thread.status} />
                      </div>
                      <p className="text-xs text-brand-muted mt-1">
                        {new Date(thread.updatedAt).toLocaleDateString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Thread Detail / Messages */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden flex flex-col">
            {selectedThread ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-brand-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-brand-navy">{selectedThread.subject}</h2>
                    <StatusBadge status={selectedThread.status} />
                  </div>
                  <p className="text-xs text-brand-muted mt-1">
                    Created: {new Date(selectedThread.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
                  {selectedThread.messages?.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'company' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={[
                          'max-w-[75%] rounded-2xl px-4 py-3',
                          msg.sender === 'company'
                            ? 'bg-brand-navy text-white rounded-br-sm'
                            : 'bg-brand-cream text-brand-navy rounded-bl-sm',
                        ].join(' ')}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={`text-[0.6rem] mt-1.5 ${
                            msg.sender === 'company' ? 'text-white/50' : 'text-brand-muted'
                          }`}
                        >
                          {msg.sender === 'company' ? 'You' : 'Admin'} ·{' '}
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                {selectedThread.status !== 'Closed' && (
                  <div className="p-4 border-t border-brand-border">
                    <div className="flex gap-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your reply..."
                        className="form-input flex-1 min-h-[44px] max-h-32 resize-y"
                        rows={1}
                      />
                      <button
                        onClick={handleReply}
                        disabled={sendingReply || !replyText.trim()}
                        className="btn-primary shrink-0 disabled:opacity-50"
                      >
                        {sendingReply ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-brand-muted text-sm">
                Select a thread to view messages
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Thread Modal */}
      <AnimatePresence>
        {showNewThread && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={() => setShowNewThread(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-premium-lg w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-brand-navy mb-4">New Thread</h2>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="form-input"
                    placeholder="Thread subject..."
                  />
                </div>
                <div>
                  <label className="form-label">Message</label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="form-input min-h-[100px] resize-y"
                    placeholder="Describe your question or issue..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewThread(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateThread}
                  disabled={creatingThread}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {creatingThread ? 'Creating...' : 'Create Thread'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  }

  return (
    <span
      className={`inline-block text-[0.6rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shrink-0
        ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {status}
    </span>
  )
}
