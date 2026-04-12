import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useCountUp } from '@/hooks/useCountUp'

/* ─── Animation Variants ──────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

/* ─── Domain Card Data ────────────────────────────────────────────────────── */
const DOMAIN_CARDS = [
  {
    id: 'care',
    label: 'K-HEALTH CARE',
    description:
      'Comprehensive advisory on Korea\'s world-class medical services, hospital systems, and patient care standards for global partners.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12" aria-hidden="true">
        <path d="M24 8v32M8 24h32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'industry',
    label: 'K-HEALTH INDUSTRY',
    description:
      'Strategic consulting for medical device manufacturing, healthcare supply chains, and industrial health ecosystem development.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12" aria-hidden="true">
        <rect x="8" y="28" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="20" y="18" width="8" height="22" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="32" y="8" width="8" height="32" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'bio',
    label: 'K-BIO',
    description:
      'Expert guidance across Korea\'s biopharmaceutical sector — from R&D and clinical trials to regulatory pathways and commercialization.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12" aria-hidden="true">
        <path d="M16 8c0 0 5 5 5 16s-5 16-5 16M32 8c0 0-5 5-5 16s5 16 5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />
        <line x1="12" y1="28" x2="36" y2="28" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />
      </svg>
    ),
  },
  {
    id: 'food',
    label: 'K-HEALTH FOOD',
    description:
      'Dedicated support for functional food and nutraceutical enterprises seeking to leverage Korea\'s advanced health food standards globally.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12" aria-hidden="true">
        <path d="M24 8c-7 0-12 5-12 11 0 8 12 18 12 18s12-10 12-18c0-6-5-11-12-11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M24 14v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
] as const

/* ─── Stats Data ─────────────────────────────────────────────────────────── */
const STATS = [
  { end: 4, suffix: '', label: 'Expert Domains' },
  { end: 7, suffix: '-Step', label: 'Advisory Process' },
  { end: 100, suffix: '+', label: 'Network Professionals' },
  { end: 2, suffix: ' Days', label: 'Response Time' },
]

function StatItem({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(end)
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-5xl lg:text-6xl font-bold text-brand-navy tracking-tight">
        {count}<span className="text-brand-gold">{suffix}</span>
      </div>
      <div className="text-sm font-semibold tracking-[0.15em] uppercase text-brand-muted mt-3">{label}</div>
    </div>
  )
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function HomePage() {
  usePageTitle()

  return (
    <div className="overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════
          HERO — Atheneum-inspired center-aligned
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy via-[#0F2238] to-brand-navy" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-teal/5 blur-[120px] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #B8965A 1px, transparent 1px), linear-gradient(to bottom, #B8965A 1px, transparent 1px)',
              backgroundSize: '100px 100px',
            }}
          />
        </div>

        {/* Content — centered */}
        <div className="container-site relative z-10 text-center px-5 sm:px-6 py-24 sm:py-32 lg:py-40">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            {/* Main brand name */}
            <motion.h1
              custom={0}
              variants={fadeUp}
              className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-bold text-white leading-[1] tracking-[-0.02em] mb-4"
            >
              SEOUL<span className="text-brand-gold">LINK</span>HEALTH
            </motion.h1>

            {/* Platform subtitle */}
            <motion.p
              custom={0.15}
              variants={fadeUp}
              className="text-[0.6rem] sm:text-sm md:text-base font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-brand-gold/80 mb-8 sm:mb-10"
            >
              K-HEALTH BUSINESS PLATFORM
            </motion.p>

            {/* Subtitle */}
            <motion.p
              custom={0.3}
              variants={fadeUp}
              className="text-sm sm:text-lg lg:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-12 px-4 sm:px-0"
            >
              {SITE_CONFIG.description}
            </motion.p>

            {/* CTA */}
            <motion.div custom={0.45} variants={fadeUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link
                to="/request"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-brand-gold text-brand-navy text-xs sm:text-sm font-bold tracking-[0.1em] uppercase rounded-sm hover:bg-brand-gold/90 transition-colors"
              >
                Request Now
              </Link>
              <Link
                to="/network#join"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 border border-white/30 text-white text-xs sm:text-sm font-bold tracking-[0.1em] uppercase rounded-sm hover:bg-white/10 transition-colors"
              >
                Join Our Network
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[0.6rem] tracking-[0.2em] uppercase text-white/30">Scroll</span>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/30">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS SECTION — countup animation
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white border-b border-brand-border">
        <div className="container-site">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {STATS.map((s) => (
              <StatItem key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DOMAIN CARDS — minimal style
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container-site">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="section-label mb-3 block">Our Expertise</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-brand-navy mb-5">
              The K-Health Ecosystem
            </h2>
            <div className="section-divider" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {DOMAIN_CARDS.map((card, i) => (
              <motion.article
                key={card.id}
                custom={i * 0.1}
                variants={fadeUp}
                className="group relative bg-white border border-brand-border rounded-lg p-8 hover:border-brand-gold/50 transition-all duration-300"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-lg" />

                <div className="text-brand-navy/40 mb-6 group-hover:text-brand-gold transition-colors duration-300">
                  {card.icon}
                </div>

                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-navy mb-4">
                  {card.label}
                </h3>

                <p className="text-sm text-brand-muted leading-relaxed">
                  {card.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MISSION QUOTE
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-brand-navy py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

        <div className="container-site relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <blockquote className="text-white/90 text-2xl lg:text-3xl font-light leading-relaxed italic font-serif mb-10">
              "To connect global opportunities with Korea's world-class healthcare capabilities."
            </blockquote>
            <div className="w-12 h-px bg-brand-gold/50 mx-auto mb-6" />
            <p className="text-white/40 text-sm tracking-[0.15em] uppercase">
              J S Kim, Ph.D. — Founder &amp; CEO
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUSTED BY (logo placeholder strip)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-brand-cream border-b border-brand-border">
        <div className="container-site">
          <p className="text-center text-xs font-bold tracking-[0.25em] uppercase text-brand-muted/60 mb-10">
            Trusted by Leading Organizations
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 lg:gap-16 opacity-30">
            {['Partner A', 'Partner B', 'Partner C', 'Partner D', 'Partner E'].map((name) => (
              <div key={name} className="text-lg font-bold text-brand-navy tracking-wider">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container-site">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-5 leading-snug">
              Ready to engage with the
              <br />K-Health ecosystem?
            </h2>
            <p className="text-brand-muted text-base leading-relaxed mb-10">
              Submit your inquiry and our team of experts will respond within two business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/request"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-navy text-white text-sm font-bold tracking-[0.1em] uppercase rounded-sm hover:bg-brand-navy/90 transition-colors"
              >
                Submit an Inquiry
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-brand-navy text-brand-navy text-sm font-bold tracking-[0.1em] uppercase rounded-sm hover:bg-brand-navy hover:text-white transition-colors"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
