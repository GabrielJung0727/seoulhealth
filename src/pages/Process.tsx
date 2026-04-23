import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageTitle } from '@/hooks/usePageTitle'

/* ─── Step Data ──────────────────────────────────────────────────────────── */
interface Step {
  step: number
  title: string
  subtitle: string
  description: string
  detail: string
}

const STEPS: Step[] = [
  {
    step: 1,
    title: 'REQUEST INTAKE',
    subtitle: 'Confirmation and initial review of the client\'s submitted inquiry',
    description:
      'Confirmation and initial review of the client\'s submitted inquiry.',
    detail:
      'Upon receipt of the client\'s inquiry, we conduct a preliminary review. The submitted information is thoroughly examined for accuracy and relevance.',
  },
  {
    step: 2,
    title: 'IN-DEPTH CONSULTATION',
    subtitle: 'Detailed discussions to clarify scope, objectives, and expectations',
    description:
      'Detailed discussions to clarify scope, objectives, and expectations.',
    detail:
      'We conduct in-depth discussions to establish a clear understanding of the project scope. These interactive conversations facilitate alignment on core objectives and desired outcomes.',
  },
  {
    step: 3,
    title: 'PRIMARY EXPERT REVIEW',
    subtitle: 'Preliminary analysis conducted by relevant subject-matter experts',
    description:
      'Preliminary analysis conducted by relevant subject-matter experts.',
    detail:
      'Relevant subject-matter experts perform a preliminary analysis based on their specialized knowledge and experience. This process ensures an informed and accurate assessment of the matter at hand.',
  },
  {
    step: 4,
    title: 'SECONDARY EXPERT CONSULTATION',
    subtitle: 'In-depth evaluation and assessment by domain specialists',
    description:
      'In-depth evaluation and assessment by domain specialists.',
    detail:
      'With domain specialists, the matter extensively undergoes a secondary consultation. These experts conduct an in-depth evaluation based on their practically advanced expertise. Their assessment provides deeper insights and supports a practically comprehensive understanding of the issue.',
  },
  {
    step: 5,
    title: 'CLIENT STRATEGY DISCUSSION',
    subtitle: 'Collaborative discussion to validate and refine proposed solutions',
    description:
      'Collaborative discussion to validate and refine proposed solutions.',
    detail:
      'The client participates in a strategy discussion to review the proposed solutions. This collaborative exchange ensures to validate the direction and underlying assumptions. It also enables refinement of the solutions to better align with the client\'s needs and objectives.',
  },
  {
    step: 6,
    title: 'REVIEW & REFINEMENT',
    subtitle: 'Further enhancement and optimization of the solution',
    description:
      'Further enhancement and optimization of the solution.',
    detail:
      'Based on the outcomes of these collaborative discussions, additional enhancements are identified and implemented. This stage focuses on refining and optimizing the solution to achieve the best possible outcome.',
  },
  {
    step: 7,
    title: 'FINAL REPORT DELIVERY',
    subtitle: 'Submission of a comprehensive report',
    description:
      'Submission of a comprehensive report.',
    detail:
      'Finally, the completed report is delivered to the client. This completed advisory report encompasses all findings involving strategic recommendations and implementation guidance for the client\'s needs.',
  },
]

const TOTAL = STEPS.length

/* ─── Page Component ─────────────────────────────────────────────────────── */
export default function ProcessPage() {
  usePageTitle('Our Process')
  const [current, setCurrent] = useState(1)  // 1-indexed
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  const goTo = useCallback((next: number) => {
    if (next < 1 || next > TOTAL) return
    setDirection(next > current ? 'forward' : 'backward')
    setCurrent(next)
  }, [current])

  const prev = () => goTo(current - 1)
  const next = () => goTo(current + 1)

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [current])

  const activeStep = STEPS[current - 1]
  const progress = ((current - 1) / (TOTAL - 1)) * 100

  /* ── Slide variants ── */
  const slideVariants = {
    enter: (dir: string) => ({
      opacity: 0,
      x: dir === 'forward' ? 48 : -48,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    exit: (dir: string) => ({
      opacity: 0,
      x: dir === 'forward' ? -48 : 48,
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    }),
  }

  return (
    <div className="overflow-x-hidden">

      {/* ═══ BANNER ════════════════════════════════════════════════════════ */}
      <section className="bg-brand-navy relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right,#B8965A 1px,transparent 1px),linear-gradient(to bottom,#B8965A 1px,transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-teal/10 blur-3xl pointer-events-none" />

        <div className="container-site relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label text-brand-gold/80 mb-4 block">Our Process</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              How We Work
            </h1>
            <div className="w-14 h-px bg-brand-gold mb-6" />
            <p className="text-white/60 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mb-3">
              Our solutions platform directs you to top-tier experts in the fields of{' '}
              {['K-HEALTH CARE', 'K-HEALTH INDUSTRY', 'K-BIO', 'K-HEALTH FOOD'].join(', ')}.
            </p>
            <p className="text-white/45 text-sm">
              Through a structured systematic advisory framework, our experts deliver practical
              and globally competitive solutions tailored to your specific needs.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" className="w-full">
            <path d="M0 48L0 24Q360 0 720 24Q1080 48 1440 16L1440 48Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══ SMART SUPPORT SYSTEM LABEL ════════════════════════════════════ */}
      <section className="bg-brand-cream/70 border-b border-brand-border">
        <div className="container-site py-6">
          <p className="text-center text-[0.6rem] font-bold tracking-[0.22em] uppercase text-brand-muted">
            SMART SUPPORT SYSTEM FOR INNOVATIVE PROBLEM SOLVING — PROCESS WORKFLOW
          </p>
        </div>
      </section>

      {/* ═══ STEPPER NAVIGATOR ═════════════════════════════════════════════ */}
      <section className="section-outer bg-white">
        <div className="container-site">

          {/* ── Step dot indicators ── */}
          <div className="relative mb-12" role="tablist" aria-label="Process steps">
            {/* Progress bar track */}
            <div className="absolute top-4 left-0 right-0 h-px bg-brand-border" aria-hidden="true" />
            {/* Filled progress */}
            <motion.div
              className="absolute top-4 left-0 h-px bg-brand-gold origin-left"
              style={{ right: 0 }}
              animate={{ scaleX: progress / 100 }}
              initial={{ scaleX: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              aria-hidden="true"
            />

            {/* Dot grid */}
            <div className="relative flex justify-between px-0">
              {STEPS.map((s) => {
                const done    = s.step < current
                const active  = s.step === current
                return (
                  <button
                    key={s.step}
                    role="tab"
                    aria-selected={active}
                    aria-label={`Step ${s.step}: ${s.title}`}
                    onClick={() => goTo(s.step)}
                    className="flex flex-col items-center gap-2 group focus-visible:outline-none"
                  >
                    {/* Dot */}
                    <div
                      className={[
                        'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10',
                        active
                          ? 'bg-brand-navy border-brand-navy shadow-premium'
                          : done
                          ? 'bg-brand-gold border-brand-gold'
                          : 'bg-white border-brand-border group-hover:border-brand-teal group-hover:scale-105',
                      ].join(' ')}
                    >
                      {done ? (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                          <path d="M12.78 5.22a.75.75 0 010 1.06L7.25 11.81a.75.75 0 01-1.06 0L3.22 8.84a.75.75 0 011.06-1.06L6.72 10.25l5-5.03a.75.75 0 011.06 0z" />
                        </svg>
                      ) : (
                        <span className={[
                          'text-xs font-bold',
                          active ? 'text-white' : 'text-brand-muted group-hover:text-brand-teal',
                        ].join(' ')}>
                          {s.step}
                        </span>
                      )}
                    </div>

                    {/* Label — hidden on mobile, shown on lg */}
                    <span className={[
                      'hidden lg:block text-[0.55rem] font-bold tracking-wider uppercase max-w-[72px] text-center leading-tight transition-colors duration-200',
                      active ? 'text-brand-navy' : done ? 'text-brand-gold' : 'text-brand-muted group-hover:text-brand-teal',
                    ].join(' ')}>
                      {s.title.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Step Content Card ── */}
          <div className="max-w-4xl mx-auto">
            <div
              className="relative overflow-hidden bg-white rounded-2xl border border-brand-border shadow-premium min-h-[380px] flex flex-col"
              aria-live="polite"
              aria-atomic="true"
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex-1 p-5 sm:p-8 lg:p-12"
                >
                  {/* Step number + counter */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">{String(current).padStart(2, '0')}</span>
                      </div>
                      <div>
                        <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-brand-gold">
                          Step {current} of {TOTAL}
                        </p>
                        <p className="text-xs text-brand-muted mt-0.5">{activeStep.subtitle}</p>
                      </div>
                    </div>
                    {/* Mobile progress indicator */}
                    <span className="lg:hidden text-[0.6rem] font-bold tracking-widest uppercase
                                     text-brand-muted border border-brand-border px-2.5 py-1 rounded-full">
                      {current}/{TOTAL}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl lg:text-3xl font-bold text-brand-navy mb-3 leading-tight">
                    {activeStep.title}
                  </h2>

                  {/* Gold divider */}
                  <div className="w-12 h-px bg-brand-gold mb-5" />

                  {/* Short description */}
                  <p className="text-brand-navy/80 font-medium text-base mb-4 leading-snug">
                    {activeStep.description}
                  </p>

                  {/* Extended detail */}
                  <p className="text-brand-muted text-sm leading-relaxed">
                    {activeStep.detail}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Gold bottom accent */}
              <div className="h-1 bg-gradient-to-r from-brand-gold/0 via-brand-gold to-brand-gold/0 shrink-0" />
            </div>

            {/* ── Navigation Buttons ── */}
            <div className="flex items-center justify-between mt-6 gap-4">

              {/* Prev */}
              <button
                onClick={prev}
                disabled={current === 1}
                className={[
                  'flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border text-xs sm:text-sm font-semibold transition-all duration-200',
                  current === 1
                    ? 'border-brand-border text-brand-muted/40 cursor-not-allowed'
                    : 'border-brand-border text-brand-navy hover:bg-brand-cream hover:border-brand-navy',
                ].join(' ')}
                aria-label="Previous step"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M10.78 4.22a.75.75 0 010 1.06L7.06 9l3.72 3.72a.75.75 0 11-1.06 1.06L5.47 9.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z" />
                </svg>
                Previous
              </button>

              {/* Progress bar strip */}
              <div className="flex-1 hidden sm:flex items-center gap-1">
                {STEPS.map((s) => (
                  <button
                    key={s.step}
                    onClick={() => goTo(s.step)}
                    className={[
                      'h-1 flex-1 rounded-full transition-all duration-300',
                      s.step < current
                        ? 'bg-brand-gold'
                        : s.step === current
                        ? 'bg-brand-navy'
                        : 'bg-brand-border hover:bg-brand-muted/30',
                    ].join(' ')}
                    aria-label={`Go to step ${s.step}`}
                  />
                ))}
              </div>

              {/* Next */}
              <button
                onClick={next}
                disabled={current === TOTAL}
                className={[
                  'flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200',
                  current === TOTAL
                    ? 'bg-brand-border/60 text-brand-muted/40 cursor-not-allowed'
                    : 'bg-brand-navy text-white hover:bg-brand-teal shadow-card hover:shadow-premium',
                ].join(' ')}
                aria-label="Next step"
              >
                {current === TOTAL ? 'Completed' : 'Next'}
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M5.22 11.78a.75.75 0 010-1.06L8.94 7 5.22 3.28a.75.75 0 011.06-1.06l4.25 4.25a.75.75 0 010 1.06L6.28 11.78a.75.75 0 01-1.06 0z" />
                </svg>
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-xs text-brand-muted/50 mt-4 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M1 4.5A2.5 2.5 0 013.5 2h9A2.5 2.5 0 0115 4.5v7A2.5 2.5 0 0112.5 14h-9A2.5 2.5 0 011 11.5v-7zm2.5-1A1 1 0 002.5 4.5v7a1 1 0 001 1h9a1 1 0 001-1v-7a1 1 0 00-1-1h-9z" />
                <path d="M5.5 8a.5.5 0 01.5-.5h4a.5.5 0 010 1H6a.5.5 0 01-.5-.5z" />
              </svg>
              Use keyboard arrow keys to navigate steps
            </p>
          </div>

          {/* ── Step Overview Grid ── */}
          <div className="mt-20">
            <h3 className="text-center section-label mb-8">All Steps at a Glance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STEPS.map((s) => {
                const done   = s.step < current
                const active = s.step === current
                return (
                  <button
                    key={s.step}
                    onClick={() => goTo(s.step)}
                    className={[
                      'text-left p-5 rounded-xl border transition-all duration-250 group',
                      active
                        ? 'border-brand-navy bg-brand-navy text-white shadow-premium'
                        : done
                        ? 'border-brand-gold/30 bg-brand-gold/5 hover:bg-brand-gold/10'
                        : 'border-brand-border bg-white hover:border-brand-teal/40 hover:bg-brand-cream/50',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={[
                        'text-[0.6rem] font-bold tracking-widest',
                        active ? 'text-brand-gold' : done ? 'text-brand-gold' : 'text-brand-muted',
                      ].join(' ')}>
                        {String(s.step).padStart(2, '0')}
                      </span>
                      {done && !active && (
                        <svg className="w-3.5 h-3.5 text-brand-gold shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                          <path d="M12.78 5.22a.75.75 0 010 1.06L7.25 11.81a.75.75 0 01-1.06 0L3.22 8.84a.75.75 0 011.06-1.06L6.72 10.25l5-5.03a.75.75 0 011.06 0z" />
                        </svg>
                      )}
                    </div>
                    <p className={[
                      'text-[0.65rem] font-bold tracking-wider uppercase leading-tight',
                      active ? 'text-white' : 'text-brand-navy',
                    ].join(' ')}>
                      {s.title}
                    </p>
                    <p className={[
                      'text-[0.7rem] mt-1.5 leading-snug',
                      active ? 'text-white/60' : 'text-brand-muted',
                    ].join(' ')}>
                      {s.description}
                    </p>
                  </button>
                )
              })}

              {/* Last cell — CTA */}
              <div className="p-5 rounded-xl border border-dashed border-brand-border bg-brand-cream/40 flex flex-col items-center justify-center text-center gap-3">
                <p className="text-xs text-brand-muted leading-relaxed">
                  Ready to begin your advisory journey?
                </p>
                <Link to="/request" className="btn-primary py-2 px-5 text-[0.65rem]">
                  Request Now
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
