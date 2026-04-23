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
      <section className="bg-brand-navy relative overflow-hidden py-16 sm:py-20 lg:py-24">
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

        <div className="container-site relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className="section-label text-brand-gold/80 mb-4 block">About Us</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
              {SITE_CONFIG.domains.join(' · ')}
            </h1>
            <div className="w-14 h-px bg-brand-gold mb-6" />
            <p className="text-white/60 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
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
      <section className="section-outer bg-white">
        <div className="container-site">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

            {/* ── Left Sidebar Navigation ──────────────────────── */}
            <aside className="lg:w-56 shrink-0">
              <nav aria-label="About Us sections">
                <p className="section-label mb-5">Sections</p>
                <ul className="flex flex-row lg:flex-col gap-2">
                  {TABS.map((tab) => (
                    <li key={tab.id} className="flex-1 lg:flex-none">
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={[
                          'relative w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-250',
                          'text-[0.6rem] sm:text-[0.7rem] font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase',
                          'group focus-visible:outline-2 focus-visible:outline-brand-teal',
                          activeTab === tab.id
                            ? 'bg-brand-navy text-white shadow-card'
                            : 'text-brand-navy hover:bg-brand-cream hover:text-brand-teal',
                        ].join(' ')}
                        aria-current={activeTab === tab.id ? 'true' : undefined}
                      >
                        {/* Active gold indicator — bottom on mobile, left on desktop */}
                        {activeTab === tab.id && (
                          <motion.span
                            layoutId="tab-indicator"
                            className="absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-0.5 lg:h-5
                                       bottom-0 left-1/2 -translate-x-1/2 lg:translate-x-0 w-5 h-0.5 lg:bottom-auto
                                       bg-brand-gold rounded-full"
                          />
                        )}
                        <span className="relative pl-0 lg:pl-2 text-center lg:text-left">{tab.label}</span>
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
    <article>
      <span className="section-label mb-3 block">Greetings</span>
      <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-2 leading-tight">
        Welcome to SEOULINKHEALTH
      </h2>
      <div className="accent-line" />

      <div className="prose-site mt-8 space-y-5 text-brand-muted leading-relaxed text-[0.95rem]">
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
        <blockquote className="border-l-2 border-brand-gold pl-6 py-2 my-8 bg-brand-cream/50 rounded-r-lg pr-6">
          <p className="text-brand-navy font-medium text-base lg:text-lg leading-relaxed italic not-italic">
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
      <div className="mt-10 pt-8 border-t border-brand-border">
        <p className="text-brand-muted text-sm mb-2">Sincerely,</p>
        <p className="text-brand-navy font-bold text-lg tracking-wide">
          {SITE_CONFIG.founder.signature}
        </p>
        <p className="text-brand-gold text-[0.7rem] font-bold tracking-[0.18em] uppercase mt-1">
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
    role: 'Committee Member',
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
      <span className="section-label mb-3 block">Our Founder</span>
      <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-2 leading-tight">
        {SITE_CONFIG.founder.name}
      </h2>
      <div className="accent-line" />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* ── Profile Card ── */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            {/* Avatar placeholder */}
            <div className="w-24 h-24 rounded-full bg-brand-navy/10 border-2 border-brand-gold/30 mx-auto mb-5 flex items-center justify-center">
              <span className="text-3xl font-bold text-brand-navy/30 font-serif">
                {SITE_CONFIG.founder.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <h3 className="text-lg font-bold text-brand-navy">
              {SITE_CONFIG.founder.name}
            </h3>
            <p className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-brand-gold mt-1">
              {SITE_CONFIG.founder.title}
            </p>
            <div className="w-10 h-px bg-brand-border mx-auto my-4" />
            <p className="text-xs text-brand-muted leading-relaxed">
              Former Secretary for Health &amp; Welfare, Republic of Korea
            </p>
          </div>
        </div>

        {/* ── Details ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Professional Experience */}
          <div>
            <h3 className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-brand-gold mb-5">
              Professional Experience
            </h3>
            <ul className="space-y-4">
              {PROFESSIONAL_EXPERIENCE.map((exp, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">{exp.role}</p>
                    <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">{exp.org}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-brand-gold mb-5">
              Education
            </h3>
            <ul className="space-y-4">
              {EDUCATION.map((edu, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">{edu.degree}</p>
                    <p className="text-xs text-brand-muted mt-0.5">{edu.institution}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
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
    title: 'Former Minister of Health and Welfare',
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
    title: 'Former Vice Minister of Health and Welfare',
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
    title: 'Former Commissioner of Food and Drug Safety',
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
      <span className="section-label mb-3 block">Endorsement</span>
      <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-2 leading-tight">
        Distinguished Endorsements
      </h2>
      <div className="accent-line" />

      <div className="mt-8 space-y-5">
        {ENDORSEMENT_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="card p-7 flex flex-col sm:flex-row gap-5 items-start"
          >
            {/* Icon */}
            <div className="shrink-0 w-14 h-14 rounded-xl bg-brand-cream border border-brand-border
                            flex items-center justify-center text-brand-gold">
              {cat.icon}
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-brand-navy mb-0.5">
                {cat.title}
              </h3>
              <p className="text-[0.7rem] font-semibold tracking-wide text-brand-gold uppercase mb-3">
                {cat.subtitle}
              </p>

              {/* Placeholder content area */}
              <div className="bg-brand-cream/60 border border-dashed border-brand-border rounded-lg px-5 py-4">
                <p className="text-xs text-brand-muted/70 italic">
                  Endorsement content will be added here.
                </p>
              </div>
            </div>

            {/* Status badge */}
            <span className="shrink-0 self-start text-[0.6rem] font-bold tracking-wider uppercase
                             px-2.5 py-1 rounded-full border border-brand-gold/30
                             text-brand-gold/70 bg-brand-gold/5 whitespace-nowrap">
              Forthcoming
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}
