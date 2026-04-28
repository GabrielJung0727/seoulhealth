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

            {/* Big K + 4 domain lines — animated connection */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.45, delayChildren: 0.3 },
                },
              }}
              className="flex items-center gap-3 sm:gap-5 lg:gap-6 mb-5"
            >
              {/* Big K — scales in */}
              <motion.span
                aria-hidden="true"
                variants={{
                  hidden: { opacity: 0, scale: 0.7 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
                  },
                }}
                className="font-bold text-brand-gold leading-none tracking-tighter
                           text-[6rem] sm:text-[9rem] lg:text-[12rem] select-none"
              >
                K
              </motion.span>

              {/* Bracket connector + domain list */}
              <motion.div
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.15 },
                  },
                }}
                className="relative flex flex-col justify-center py-2 pl-4 sm:pl-6 lg:pl-7"
              >
                {/* Vertical gold bar — grows from top */}
                <motion.span
                  aria-hidden="true"
                  variants={{
                    hidden: { scaleY: 0 },
                    visible: {
                      scaleY: 1,
                      transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
                    },
                  }}
                  style={{ transformOrigin: 'top' }}
                  className="absolute left-0 top-3 bottom-3 w-[3px] bg-brand-gold rounded-full"
                />

                {/* Pulsing energy dot at bar top — continuous loop (indicates live connection) */}
                <motion.span
                  aria-hidden="true"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0.9, 0.4, 0.9, 0.4],
                    scale: [0, 1, 1.35, 1, 1.35],
                  }}
                  transition={{
                    delay: 1.4,
                    duration: 2.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -left-[3px] top-[4px] w-[9px] h-[9px] rounded-full bg-brand-gold
                             shadow-[0_0_14px_rgba(184,150,90,0.9)]"
                />

                {/* Signal traveling down the bar — subtle, repeating */}
                <motion.span
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0.8, 0],
                    y: ['0%', '0%', '100%', '100%'],
                  }}
                  transition={{
                    delay: 1.8,
                    duration: 2.4,
                    times: [0, 0.15, 0.85, 1],
                    repeat: Infinity,
                    repeatDelay: 1.6,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-[-1px] top-3 h-8 w-[5px] rounded-full
                             bg-gradient-to-b from-brand-gold via-brand-gold to-transparent blur-[2px]"
                />

                {/* Domain list */}
                <motion.ul
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.14, delayChildren: 0.2 },
                    },
                  }}
                  className="flex flex-col gap-1.5 sm:gap-2 text-white font-bold uppercase
                             leading-tight tracking-wide
                             text-lg sm:text-2xl lg:text-3xl"
                >
                  {['HEALTH CARE', 'HEALTH INDUSTRY', 'BIO', 'HEALTH FOOD'].map((label) => (
                    <motion.li
                      key={label}
                      variants={{
                        hidden: { opacity: 0, x: -16 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                        },
                      }}
                      className="relative pl-4 sm:pl-5
                                 before:content-[''] before:absolute before:left-0 before:top-1/2
                                 before:-translate-y-1/2 before:w-3 sm:before:w-4
                                 before:h-[2px] before:bg-brand-gold"
                    >
                      {label}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            </motion.div>

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

      {/* CEO Signature */}
      <div className="mt-10 pt-8 border-t border-brand-border">
        <p className="text-brand-muted text-sm mb-2">Sincerely,</p>
        <p className="text-brand-navy font-bold text-lg tracking-wide">
          {SITE_CONFIG.founder.signature}
        </p>
        <p className="text-brand-gold text-[0.7rem] font-bold tracking-[0.18em] uppercase mt-1">
          {SITE_CONFIG.founder.title}
        </p>
      </div>

      {/* ── COO Message ──────────────────────────────────────────────────── */}
      <div className="mt-16 pt-12 border-t-2 border-brand-gold/20">
        <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-brand-gold mb-4">
          Message from the Chief Operating Officer
        </p>

        <div className="text-brand-muted text-sm sm:text-base leading-relaxed space-y-5">
          <p>Hello,</p>

          <p>
            The global health industry market is evolving at an unprecedented pace, and the
            Republic of Korea stands at the forefront of this transformation.
          </p>

          <p>
            During my tenure as Head of Future Policy Headquarters at the Korea Health
            Industry Development Institute and as Executive Director of the Health Policy
            Research Institute at the Health Insurance Review and Assessment Service, I had
            the privilege of contributing to the advancement and global competitiveness of
            Korea's healthcare sector.
          </p>

          <p>
            As a COO, I am truly delighted to have the opportunity to share my experience
            and insights with a global audience those who have a keen interest in Korea's
            health industry.
          </p>

          <p>Thank you.</p>
        </div>

        {/* COO Signature */}
        <div className="mt-8 pt-6 border-t border-brand-border">
          <p className="text-brand-muted text-sm mb-2">Sincerely,</p>
          <p className="text-brand-navy font-bold text-lg tracking-wide">
            Youn-Tae Lee, Ph.D.
          </p>
          <p className="text-brand-gold text-[0.7rem] font-bold tracking-[0.18em] uppercase mt-1">
            Chief Operating Officer
          </p>
        </div>
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
interface EndorsementCategory {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  letter?: {
    greeting?: string
    paragraphs?: string[]
    closing?: string
    signatureImage?: string
    signerInitials?: string
    signerName?: string
    signerCredentials?: string
    signerRole?: string
  }
}

const ENDORSEMENT_CATEGORIES: EndorsementCategory[] = [
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
    letter: {
      greeting: 'Hello,',
      paragraphs: [
        'I am CHIN YOUB CHUNG, and I had the distinct privilege of serving as the Minister of Health and Welfare under the 18th President of the Republic of Korea, President Park Geun-Hye.',
        "As is widely recognized, Korea's healthcare system, health industry, pharmaceutical sector, and health-related food industries have been experiencing remarkable growth, firmly establishing themselves at the forefront of the global marketplace.",
        "During my tenure, I often noted — with a degree of concern — the relative shortage of highly qualified professionals capable of providing precise, reliable, and strategic guidance to foreign enterprises seeking entry into the Korean healthcare market, as well as to those endeavoring to adapt and implement Korea's advanced healthcare systems within their own countries.",
        "It is therefore my great pleasure to offer this recommendation for Dr. J. S. Kim, an exceptionally qualified and capable expert in this field. Dr. Kim served as the Presidential Secretary for Health and Welfare during my time in office and has made significant contributions to the development and advancement of Korea's national healthcare policies. His expertise and dedication are widely recognized.",
        "I am confident that numerous individuals and organizations will greatly benefit from his insight and counsel, and that his endeavors will serve as a vital bridge in advancing Korea's healthcare excellence on the global stage.",
      ],
      closing: 'Sincerely Yours,',
      signatureImage: '/endorsements/chin-signature.gif',
      signerInitials: 'CYC',
      signerName: 'CHIN YOUB CHUNG',
      signerCredentials: 'MD, PhD.',
      signerRole: 'Former Minister of Health and Welfare, Republic of Korea',
    },
  },
  {
    id: 'assembly',
    title: 'Former Member of the National Assembly',
    subtitle: 'Former President, Korea Health Industry Development Institute',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
        <path d="M16 4l3 9h9l-7.5 5.5 3 9L16 22l-7.5 5.5 3-9L4 13h9L16 4z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    letter: {
      greeting: 'Hello,',
      paragraphs: [
        'My name is Kyung-Hwa Ko, and I had the honor of serving as a Member of the National Assembly of the Republic of Korea, where I was actively engaged in the Health and Welfare Committee. Following the completion of my parliamentary tenure, I served as President of the Korea Health Industry Development Institute.',
        "Today, Korea’s healthcare sector has grown to a level that commands significant international attention and recognition.",
        "In this context, I am particularly delighted that Dr. Jinsoo Kim and Dr. Youn-Tae Lee — both distinguished professionals with extensive expertise in Korea’s healthcare sector — have established a platform dedicated to delivering valuable insights and knowledge to a global audience.",
        "I am confident that this initiative will serve as a highly valuable resource for stakeholders with a strong interest in Korea’s healthcare industry, and I stand ready to extend my full support whenever it may be required.",
        'Thank you.',
      ],
      closing: 'Sincerely,',
      signerInitials: 'KHK',
      signerName: 'Kyung-Hwa Ko',
      signerCredentials: 'Ph.D.',
      signerRole: 'Former Member of the National Assembly / Former President, Korea Health Industry Development Institute, Republic of Korea',
    },
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
    letter: {},
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
    letter: {},
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

      <div className="mt-8 space-y-6">
        {ENDORSEMENT_CATEGORIES.map((cat) => (
          <LetterheadCard key={cat.id} cat={cat} />
        ))}
      </div>
    </article>
  )
}

/* ─── Ornamental rule: thin line with centered gold diamond ─────────────── */
function OrnamentalRule({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-gold/35 to-brand-gold/50" />
      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-brand-gold/70 shrink-0" fill="currentColor">
        <path d="M6 0 L7.2 4.8 L12 6 L7.2 7.2 L6 12 L4.8 7.2 L0 6 L4.8 4.8 Z" />
      </svg>
      <span className="flex-1 h-px bg-gradient-to-l from-transparent via-brand-gold/35 to-brand-gold/50" />
    </div>
  )
}

/* ─── Corner flourish: small L-shaped gold bracket ──────────────────────── */
function CornerFlourish({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const pos = {
    tl: 'top-4 left-4 border-t border-l rounded-tl-md',
    tr: 'top-4 right-4 border-t border-r rounded-tr-md',
    bl: 'bottom-4 left-4 border-b border-l rounded-bl-md',
    br: 'bottom-4 right-4 border-b border-r rounded-br-md',
  }[position]
  return (
    <span
      aria-hidden="true"
      className={`absolute w-5 h-5 border-brand-gold/45 pointer-events-none ${pos}`}
    />
  )
}

/* ─── Full letterhead card (published or forthcoming) ───────────────────── */
function LetterheadCard({ cat }: { cat: EndorsementCategory }) {
  const letter = cat.letter ?? {}
  const hasContent = (letter.paragraphs?.length ?? 0) > 0
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="relative rounded-2xl bg-white border border-brand-border shadow-premium overflow-hidden"
    >
      {/* Subtle parchment warmth */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 10%, #B8965A 0%, transparent 45%), radial-gradient(circle at 85% 95%, #1B3A5B 0%, transparent 50%)',
        }}
      />

      {/* Corner flourishes */}
      <CornerFlourish position="tl" />
      <CornerFlourish position="tr" />
      <CornerFlourish position="bl" />
      <CornerFlourish position="br" />

      {/* Main content */}
      <div className="relative px-6 sm:px-12 lg:px-20 py-10 sm:py-14 lg:py-16">

        {/* ─── Ceremonial header ─── */}
        <header className="text-center mb-8 lg:mb-10">
          <OrnamentalRule className="mb-6" />
          <p className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-brand-gold mb-3">
            Official Endorsement
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-brand-navy leading-tight mb-2.5 font-serif">
            {cat.title}
          </h3>
          <p className="text-[0.7rem] sm:text-xs font-semibold tracking-[0.22em] text-brand-muted uppercase">
            {cat.subtitle}
          </p>
          <OrnamentalRule className="mt-6" />
        </header>

        {/* ─── Signatory preview — only when letter is signed ─── */}
        {letter.signerName && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative w-12 h-12 rounded-full
                            ring-1 ring-brand-gold/50 ring-offset-2 ring-offset-white shrink-0
                            bg-gradient-to-br from-brand-navy to-[#0F2238]
                            flex items-center justify-center">
              <span className="text-[0.65rem] font-bold text-brand-gold font-serif tracking-[0.15em]">
                {letter.signerInitials}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[0.55rem] font-bold tracking-[0.22em] uppercase text-brand-gold mb-0.5">
                Signed by
              </p>
              <p className="text-sm font-bold text-brand-navy font-serif leading-tight">
                {letter.signerName},{' '}
                <span className="text-brand-gold">{letter.signerCredentials}</span>
              </p>
            </div>
          </div>
        )}

        {/* ─── Status chip for forthcoming ─── */}
        {!hasContent && (
          <div className="flex justify-center mb-6">
            <span className="text-[0.6rem] font-bold tracking-[0.22em] uppercase
                             px-3 py-1.5 rounded-full border border-brand-gold/30
                             text-brand-gold/80 bg-brand-gold/5">
              Forthcoming
            </span>
          </div>
        )}

        {/* ─── Expand/collapse toggle ─── */}
        <div className="flex justify-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={`letter-${cat.id}`}
            className="group flex items-center gap-2.5 px-6 py-3 rounded-full
                       border border-brand-gold/40 bg-white hover:bg-brand-cream
                       text-[0.65rem] font-bold tracking-[0.22em] uppercase text-brand-navy
                       transition-all duration-300 shadow-sm hover:shadow-card
                       hover:border-brand-gold focus-visible:outline-2 focus-visible:outline-brand-teal"
          >
            <span>
              {expanded
                ? hasContent ? 'Collapse Letter' : 'Hide Details'
                : hasContent ? 'Read Full Letter' : 'View Details'}
            </span>
            <motion.svg
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="w-3.5 h-3.5 text-brand-gold"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.47 5.22a.75.75 0 011.06 0L8 8.69l3.47-3.47a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z" />
            </motion.svg>
          </button>
        </div>

        {/* ─── Collapsible body ─── */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.section
              id={`letter-${cat.id}`}
              key="letter-body"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open:      { opacity: 1, height: 'auto' },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.45, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              {hasContent ? (
                <FullLetterBody letter={letter} />
              ) : (
                <ForthcomingBody cat={cat} />
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ─── Full letter body ──────────────────────────────────────────────────── */
function FullLetterBody({
  letter,
}: {
  letter: NonNullable<EndorsementCategory['letter']>
}) {
  return (
    <div className="pt-10 lg:pt-12">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

        {/* Left: Avatar + identity */}
        <aside className="lg:w-48 shrink-0">
          <div className="sticky top-8 flex flex-col items-center lg:items-start">
            <div className="relative w-24 h-24 rounded-full
                            bg-gradient-to-br from-brand-navy to-[#0F2238]
                            flex items-center justify-center
                            ring-1 ring-brand-gold/50 ring-offset-[3px] ring-offset-white">
              <span className="text-xl font-bold text-brand-gold font-serif tracking-[0.15em]">
                {letter.signerInitials}
              </span>
            </div>

            <div className="mt-6 text-center lg:text-left">
              <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-brand-gold mb-1.5">
                Signatory
              </p>
              <p className="text-sm font-bold text-brand-navy leading-tight font-serif">
                {letter.signerName}
              </p>
              <p className="text-xs text-brand-muted tracking-wide mt-0.5">
                {letter.signerCredentials}
              </p>
              <div className="w-8 h-px bg-brand-gold/50 my-4 mx-auto lg:mx-0" />
              <p className="text-[0.7rem] text-brand-muted/90 leading-relaxed">
                {letter.signerRole}
              </p>
            </div>
          </div>
        </aside>

        {/* Right: Letter text */}
        <div className="flex-1 min-w-0">
          <p className="font-serif text-brand-navy text-base sm:text-lg mb-5">
            {letter.greeting}
          </p>

          <div className="space-y-5 font-serif text-[0.95rem] sm:text-base leading-[1.85] text-brand-navy/85">
            {letter.paragraphs?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <p className="mt-10 font-serif text-brand-navy text-base">
            {letter.closing}
          </p>

          {letter.signatureImage && (
            <div className="mt-3 -ml-1">
              <img
                src={letter.signatureImage}
                alt={`Signature of ${letter.signerName}`}
                className="h-14 sm:h-16 w-auto select-none pointer-events-none"
                style={{ mixBlendMode: 'multiply' }}
                draggable={false}
              />
            </div>
          )}

          <div className="mt-3">
            <p className="text-base font-bold text-brand-navy tracking-wide font-serif">
              {letter.signerName},{' '}
              <span className="text-brand-gold">{letter.signerCredentials}</span>
            </p>
            <p className="text-xs text-brand-muted mt-1 tracking-wide">
              {letter.signerRole}
            </p>
          </div>
        </div>
      </div>

      <OrnamentalRule className="mt-12 lg:mt-14" />
    </div>
  )
}

/* ─── Forthcoming placeholder body ──────────────────────────────────────── */
function ForthcomingBody({ cat }: { cat: EndorsementCategory }) {
  return (
    <div className="pt-10 lg:pt-12">
      <div className="max-w-xl mx-auto text-center">
        {/* Icon in dignified circle */}
        <div className="inline-flex w-16 h-16 rounded-full
                        bg-gradient-to-br from-brand-navy to-[#0F2238]
                        ring-1 ring-brand-gold/40 ring-offset-[3px] ring-offset-white
                        items-center justify-center text-brand-gold/80 mb-6">
          {cat.icon}
        </div>

        <p className="text-[0.65rem] font-bold tracking-[0.22em] uppercase text-brand-gold mb-3">
          Endorsement Forthcoming
        </p>

        <p className="font-serif text-base sm:text-lg text-brand-navy leading-relaxed mb-4">
          An official endorsement letter from a <strong>{cat.title}</strong> is
          currently being prepared.
        </p>

        <p className="text-sm text-brand-muted leading-relaxed">
          Once received, the letter will be published here along with the
          signatory's credentials and a verified signature.
        </p>

        {/* Skeleton preview lines */}
        <div className="mt-10 space-y-3 max-w-md mx-auto">
          <div className="h-2 bg-brand-border/60 rounded-full w-full" />
          <div className="h-2 bg-brand-border/60 rounded-full w-11/12 mx-auto" />
          <div className="h-2 bg-brand-border/60 rounded-full w-10/12 mx-auto" />
          <div className="h-2 bg-brand-border/60 rounded-full w-9/12 mx-auto" />
        </div>
      </div>

      <OrnamentalRule className="mt-12 lg:mt-14" />
    </div>
  )
}
