import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'
import { usePageTitle } from '@/hooks/usePageTitle'

/* ─── Tab Definition ─────────────────────────────────────────────────────── */
type TabId = 'greetings' | 'founder' | 'endorsement'

interface Tab {
  id: TabId
  label: string
}

const TABS: Tab[] = [
  { id: 'greetings',   label: 'GREETINGS' },
  { id: 'founder',     label: 'OUR FOUNDER' },
  { id: 'endorsement', label: 'ENDORSEMENT' },
]

/* ─── Page Component ─────────────────────────────────────────────────────── */
export default function AboutPage() {
  usePageTitle('About Us')
  const [activeTab, setActiveTab] = useState<TabId>('greetings')

  return (
    <div className="overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════
          PAGE BANNER
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-brand-navy relative overflow-hidden py-24 lg:py-32">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #B8965A 1px, transparent 1px), linear-gradient(to bottom, #B8965A 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-teal/10 blur-3xl pointer-events-none" />

        <div className="container-site relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5">
              ABOUT US
            </h1>
            <div className="w-16 h-px bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-gold/80 text-sm font-bold tracking-[0.2em] uppercase mb-6">
              {SITE_CONFIG.domains.join(' \u00B7 ')}
            </p>
            <p className="text-white/50 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              {SITE_CONFIG.description}
            </p>
          </motion.div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 16 L1440 48 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SIDEBAR + CONTENT LAYOUT
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-site">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

            {/* ── Left Sidebar Navigation ──────────────────────── */}
            <aside className="lg:w-52 shrink-0">
              <nav aria-label="About Us sections">
                <ul className="flex flex-row lg:flex-col gap-1">
                  {TABS.map((tab) => (
                    <li key={tab.id} className="flex-1 lg:flex-none">
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={[
                          'relative w-full text-left px-5 py-3.5 rounded-lg transition-all duration-250',
                          'text-sm font-bold tracking-[0.15em] uppercase',
                          'focus-visible:outline-2 focus-visible:outline-brand-teal',
                          activeTab === tab.id
                            ? 'bg-brand-navy text-white'
                            : 'text-brand-navy/60 hover:text-brand-navy',
                        ].join(' ')}
                        aria-current={activeTab === tab.id ? 'true' : undefined}
                      >
                        {/* Active gold left indicator */}
                        {activeTab === tab.id && (
                          <motion.span
                            layoutId="tab-indicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-gold rounded-full"
                          />
                        )}
                        <span className="relative pl-1">{tab.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* ── Right Content Area ───────────────────────────── */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                >
                  {activeTab === 'greetings'   && <GreetingsContent />}
                  {activeTab === 'founder'     && <FounderContent />}
                  {activeTab === 'endorsement' && <EndorsementContent />}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 1 — GREETINGS
═══════════════════════════════════════════════════════════════════════════ */
function GreetingsContent() {
  return (
    <article className="max-w-2xl">
      <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-3 leading-tight">
        Welcome to SEOULINKHEALTH
      </h2>
      <div className="w-12 h-px bg-brand-gold mb-10" />

      <div className="space-y-6 text-brand-muted leading-relaxed text-base lg:text-lg">
        <p>Welcome and thank you for visiting SEOULINKHEALTH.</p>

        <p>
          As global interest in Korea's advanced healthcare ecosystem continues to grow, an
          increasing number of organizations and professionals are seeking reliable and strategic
          pathways to engage with Korea's healthcare services, medical industry, biopharmaceutical
          sector, and health food innovations.
        </p>

        <p>
          Our platform was established to serve as a strategic gateway for international partners
          who wish to enter the Korean market or adopt Korea's proven healthcare systems globally.
        </p>

        <p>
          We provide expert-driven consulting designed to deliver clear insights, practical
          guidance, and efficient solutions across the full spectrum of the K-Health sector.
        </p>

        {/* Pull quote */}
        <blockquote className="border-l-2 border-brand-gold pl-8 py-4 my-12">
          <p className="text-brand-navy font-medium text-xl lg:text-2xl leading-relaxed italic">
            "Our mission is simple: to connect global opportunities with Korea's world-class
            healthcare capabilities."
          </p>
        </blockquote>

        <p>
          We look forward to becoming your trusted partner in building successful global
          collaborations.
        </p>
      </div>

      {/* Signature */}
      <div className="mt-14 pt-10 border-t border-brand-border/50">
        <p className="text-brand-muted text-sm mb-3 tracking-wide">Sincerely,</p>
        <p className="text-brand-navy font-bold text-xl tracking-wide">
          {SITE_CONFIG.founder.signature}
        </p>
        <p className="text-brand-gold text-xs font-bold tracking-[0.18em] uppercase mt-2">
          {SITE_CONFIG.founder.title}
        </p>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 2 — OUR FOUNDER
═══════════════════════════════════════════════════════════════════════════ */
const PROFESSIONAL_EXPERIENCE = [
  {
    role: 'Secretary for Health and Welfare',
    org: 'Office for 18th President Park Geun-Hye Administration, Republic of Korea',
  },
  {
    role: 'Member',
    org: '18th Presidential Transition Committee for Health and Welfare',
  },
  {
    role: 'Senior Research Fellow',
    org: 'Korea Institute for Health and Social Affairs',
  },
  {
    role: 'Director of Research Coordination',
    org: 'Institute for Health Insurance Policy, National Health Insurance Corporation',
  },
  {
    role: 'Research Fellow',
    org: 'Research Institute, Health Insurance Review & Assessment Service',
  },
]

const EDUCATION = [
  { degree: 'Ph.D. in Economics', institution: 'University of Houston' },
  { degree: 'M.A. in Economics',  institution: 'North Carolina State University' },
  { degree: 'B.A. in Economics',  institution: 'Long Island University' },
]

function FounderContent() {
  return (
    <article>
      <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-3 leading-tight">
        {SITE_CONFIG.founder.name}
      </h2>
      <div className="w-12 h-px bg-brand-gold mb-10" />

      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start gap-8 mb-12">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-brand-navy/5 border-2 border-brand-gold/30 flex items-center justify-center shrink-0">
          <span className="text-3xl font-bold text-brand-navy/25 font-serif">
            {SITE_CONFIG.founder.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-brand-navy">
            {SITE_CONFIG.founder.name}
          </h3>
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-brand-gold mt-1">
            {SITE_CONFIG.founder.title}
          </p>
          <p className="text-sm text-brand-muted mt-3 leading-relaxed">
            Former Secretary for Health &amp; Welfare, Republic of Korea
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-brand-border/50 mb-12" />

      {/* Professional Experience */}
      <div className="mb-12">
        <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-brand-gold mb-6">
          Professional Experience
        </h3>
        <ul className="space-y-5">
          {PROFESSIONAL_EXPERIENCE.map((exp, i) => (
            <li key={i} className="flex gap-4 items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
              <div>
                <p className="text-sm font-semibold text-brand-navy">{exp.role}</p>
                <p className="text-sm text-brand-muted mt-1 leading-relaxed">{exp.org}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full h-px bg-brand-border/50 mb-12" />

      {/* Education */}
      <div>
        <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-brand-gold mb-6">
          Education
        </h3>
        <ul className="space-y-5">
          {EDUCATION.map((edu, i) => (
            <li key={i} className="flex gap-4 items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
              <div>
                <p className="text-sm font-semibold text-brand-navy">{edu.degree}</p>
                <p className="text-sm text-brand-muted mt-1">{edu.institution}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 3 — ENDORSEMENT
═══════════════════════════════════════════════════════════════════════════ */
const ENDORSEMENT_CATEGORIES = [
  {
    id: 'minister',
    title: 'Former Minister-level Officials',
    subtitle: 'Ministry of Health and Welfare, Republic of Korea',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
        <path d="M16 4l3 9h9l-7.5 5.5 3 9L16 22l-7.5 5.5 3-9L4 13h9L16 4z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'vice-minister',
    title: 'Vice Minister-level Officials',
    subtitle: 'Ministry of Health and Welfare & Related Ministries',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
        <circle cx="16" cy="11" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 27c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'food-agency',
    title: 'Food-related Agency Heads & Commissioners',
    subtitle: 'Ministry of Food and Drug Safety & Associated Bodies',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
        <rect x="4" y="8" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 13h24" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4M22 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 19h6M9 23h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

function EndorsementContent() {
  return (
    <article>
      <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-3 leading-tight">
        Distinguished Endorsements
      </h2>
      <div className="w-12 h-px bg-brand-gold mb-10" />

      <p className="text-brand-muted text-base lg:text-lg leading-relaxed mb-12 max-w-2xl">
        This section features endorsements from distinguished officials and agency leaders who
        have reviewed and recognized the expertise and credibility of SEOULINKHEALTH's advisory
        platform. Endorsement content will be added upon completion of the review process.
      </p>

      <div className="space-y-6">
        {ENDORSEMENT_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="border border-brand-border/60 rounded-xl p-8 flex flex-col sm:flex-row gap-6 items-start"
          >
            {/* Icon */}
            <div className="shrink-0 w-14 h-14 rounded-xl border border-brand-border/40
                            flex items-center justify-center text-brand-gold">
              {cat.icon}
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-brand-navy mb-1">
                {cat.title}
              </h3>
              <p className="text-xs font-bold tracking-[0.1em] text-brand-gold uppercase mb-4">
                {cat.subtitle}
              </p>

              {/* Placeholder content area */}
              <div className="border border-dashed border-brand-border/60 rounded-lg px-5 py-4">
                <p className="text-sm text-brand-muted/60 italic">
                  Endorsement content will be added here.
                </p>
              </div>
            </div>

            {/* Status badge */}
            <span className="shrink-0 self-start text-[0.65rem] font-bold tracking-wider uppercase
                             px-3 py-1.5 rounded-full border border-brand-gold/30
                             text-brand-gold/70 whitespace-nowrap">
              Forthcoming
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}
