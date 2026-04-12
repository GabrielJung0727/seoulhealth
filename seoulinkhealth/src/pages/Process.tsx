import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
    subtitle: 'Confirmation & Initial Review',
    description:
      'Confirmation and initial review of the client\'s submitted inquiry.',
    detail:
      'Upon receiving your inquiry, our team conducts a thorough initial review to understand the nature, scope, and urgency of your request. We confirm receipt and assess which domain specialists are best suited to address your needs. A preliminary response is provided within two business days.',
  },
  {
    step: 2,
    title: 'IN-DEPTH CONSULTATION',
    subtitle: 'Scope Clarification & Alignment',
    description:
      'Detailed discussions to clarify scope, objectives, and expectations.',
    detail:
      'Our advisory team engages in structured dialogue with the client to fully understand the objectives, expected outcomes, constraints, and timeline. This collaborative phase ensures complete alignment before expert resources are mobilized, minimizing revision cycles and maximizing solution quality.',
  },
  {
    step: 3,
    title: 'PRIMARY EXPERT REVIEW',
    subtitle: 'Preliminary Analysis',
    description:
      'Preliminary analysis conducted by relevant subject-matter experts.',
    detail:
      'A curated group of primary experts from our network — selected based on their direct relevance to your inquiry — conducts an independent preliminary analysis. Their initial findings are compiled into a structured brief that forms the foundation for deeper specialist evaluation.',
  },
  {
    step: 4,
    title: 'SECONDARY EXPERT CONSULTATION',
    subtitle: 'In-Depth Domain Evaluation',
    description:
      'In-depth evaluation and assessment by domain specialists.',
    detail:
      'Domain-specific specialists conduct a rigorous, multi-dimensional review of the primary expert brief. This peer-review mechanism ensures intellectual rigor and cross-validates findings across different professional perspectives, producing a comprehensive and reliable knowledge base.',
  },
  {
    step: 5,
    title: 'CLIENT STRATEGY DISCUSSION',
    subtitle: 'Solution Validation & Refinement',
    description:
      'Collaborative discussion to validate and refine proposed solutions.',
    detail:
      'The refined advisory findings are presented to the client in a structured strategy session. This collaborative dialogue allows the client to provide real-time feedback, enabling our experts to tailor the solution with maximum precision to the client\'s specific operational context.',
  },
  {
    step: 6,
    title: 'REVIEW & REFINEMENT',
    subtitle: 'Enhancement & Optimization',
    description:
      'Further enhancement and optimization of the solution.',
    detail:
      'Incorporating all client feedback, our expert team undertakes a final comprehensive review and quality assurance process. The solution is stress-tested against practical implementation scenarios, and any remaining gaps are addressed to ensure a complete, actionable, and globally competitive advisory output.',
  },
  {
    step: 7,
    title: 'FINAL REPORT DELIVERY',
    subtitle: 'Comprehensive Report Submission',
    description:
      'Submission of a comprehensive report.',
    detail:
      'The completed advisory report — encompassing all findings, strategic recommendations, supporting evidence, and implementation guidance — is formally delivered to the client. The report is structured for immediate practical use and is accompanied by a briefing session to ensure full comprehension and seamless adoption.',
  },
]

/* ─── Page Component ─────────────────────────────────────────────────────── */
export default function ProcessPage() {
  usePageTitle('Our Process')

  return (
    <div className="overflow-x-hidden">

      {/* ═══ BANNER ════════════════════════════════════════════════════════ */}
      <section className="bg-brand-navy relative overflow-hidden py-24 lg:py-32">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right,#B8965A 1px,transparent 1px),linear-gradient(to bottom,#B8965A 1px,transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-teal/10 blur-3xl pointer-events-none" />

        <div className="container-site relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5">
              OUR PROCESS
            </h1>
            <div className="w-16 h-px bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-gold/80 text-sm font-bold tracking-[0.2em] uppercase">
              SMART SUPPORT SYSTEM FOR INNOVATIVE PROBLEM SOLVING
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" className="w-full">
            <path d="M0 48L0 24Q360 0 720 24Q1080 48 1440 16L1440 48Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══ VERTICAL TIMELINE ═════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-site max-w-4xl">

          <div className="relative">
            {/* Vertical line — centered on step numbers */}
            <div
              className="absolute left-5 lg:left-8 top-0 bottom-0 w-px bg-brand-border"
              aria-hidden="true"
            />

            {/* Steps */}
            <div className="space-y-0">
              {STEPS.map((s, index) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="relative flex gap-6 lg:gap-10 pb-12 last:pb-0"
                >
                  {/* Step number circle */}
                  <div className="relative z-10 shrink-0">
                    <div className="w-10 h-10 lg:w-16 lg:h-16 rounded-full bg-brand-navy border-4 border-white flex items-center justify-center shadow-sm">
                      <span className="text-sm lg:text-lg font-bold text-brand-gold">
                        {s.step}
                      </span>
                    </div>
                  </div>

                  {/* Content card */}
                  <div className="flex-1 border border-brand-border/60 rounded-xl p-6 lg:p-8 bg-white -mt-1">
                    <p className="text-xs font-bold tracking-[0.18em] uppercase text-brand-gold mb-2">
                      {s.subtitle}
                    </p>
                    <h3 className="text-lg lg:text-xl font-bold text-brand-navy uppercase tracking-wide mb-3">
                      {s.title}
                    </h3>
                    <p className="text-brand-navy/80 font-medium text-sm lg:text-base mb-3 leading-relaxed">
                      {s.description}
                    </p>
                    <p className="text-brand-muted text-sm leading-relaxed">
                      {s.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-brand-muted text-sm mb-5">
              Ready to begin your advisory journey?
            </p>
            <Link to="/request" className="btn-primary py-3 px-8 text-sm">
              Request Now
            </Link>
          </motion.div>

        </div>
      </section>
    </div>
  )
}
