import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'
import { usePageTitle } from '@/hooks/usePageTitle'

/* ─── Animation Variants ──────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

/* ─── Domain Card Data ────────────────────────────────────────────────────── */
// @ts-ignore -- kept for future use
const DOMAIN_CARDS = [
  {
    id: 'care',
    label: 'K-HEALTH CARE',
    description:
      'Comprehensive advisory on Korea\'s world-class medical services, hospital systems, and patient care standards for global partners.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
        <path d="M20 12v16M12 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'industry',
    label: 'K-HEALTH INDUSTRY',
    description:
      'Strategic consulting for medical device manufacturing, healthcare supply chains, and industrial health ecosystem development.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
        <rect x="10" y="22" width="5" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="17.5" y="16" width="5" height="14" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="25" y="10" width="5" height="20" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'bio',
    label: 'K-BIO',
    description:
      'Expert guidance across Korea\'s biopharmaceutical sector — from R&D and clinical trials to regulatory pathways and commercialization.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
        <path
          d="M14 10c0 0 4 4 4 10s-4 10-4 10M26 10c0 0-4 4-4 10s4 10 4 10"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        />
        <line x1="12" y1="17" x2="28" y2="17" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" strokeDasharray="2 2" />
        <line x1="12" y1="23" x2="28" y2="23" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: 'food',
    label: 'K-HEALTH FOOD',
    description:
      'Dedicated support for functional food and nutraceutical enterprises seeking to leverage Korea\'s advanced health food standards globally.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
        <path
          d="M20 10c-5 0-8 4-8 8 0 6 8 12 8 12s8-6 8-12c0-4-3-8-8-8z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
        />
        <path d="M20 14v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
] as const

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function HomePage() {
  usePageTitle()

  return (
    <div className="overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">

        {/* Background — layered premium gradient */}
        <div className="absolute inset-0 z-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-[#0F2238] to-[#0A1520]" />

          {/* Subtle radial glow — top right */}
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-brand-teal/10 blur-3xl pointer-events-none" />

          {/* Subtle radial glow — bottom left */}
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-brand-gold/8 blur-3xl pointer-events-none" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #B8965A 1px, transparent 1px), linear-gradient(to bottom, #B8965A 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/5 to-transparent" />
        </div>

        {/* Content */}
        <div className="container-site relative z-10 py-28 lg:py-36">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl"
          >
            {/* Label */}
            <motion.div custom={0} variants={fadeUp} className="mb-6">
              <span className="inline-block text-[0.6rem] font-bold tracking-[0.28em] uppercase text-brand-gold/80 border border-brand-gold/25 px-4 py-1.5 rounded-sm">
                K-HEALTH BUSINESS PLATFORM
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              custom={0.1}
              variants={fadeUp}
              className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.05] tracking-[-0.02em] mb-6"
            >
              SEOUL
              <span className="text-brand-gold">LINK</span>
              HEALTH
            </motion.h1>

            {/* Domain subtitle */}
            <motion.p
              custom={0.2}
              variants={fadeUp}
              className="text-xs sm:text-sm lg:text-base font-semibold tracking-[0.12em] sm:tracking-[0.2em] text-brand-gold/70 uppercase mb-8"
            >
              {SITE_CONFIG.domains.join(' · ')}
            </motion.p>

            {/* Gold divider */}
            <motion.div
              custom={0.28}
              variants={fadeUp}
              className="w-14 h-px bg-brand-gold mb-8"
            />

            {/* Description */}
            <motion.p
              custom={0.35}
              variants={fadeUp}
              className="text-sm sm:text-base lg:text-lg text-white/65 leading-relaxed max-w-2xl mb-12"
            >
              {SITE_CONFIG.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              custom={0.45}
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/request" className="btn-primary">
                Request Now
              </Link>
              <Link to="/network#join" className="btn-ghost">
                Join Our Expert Network
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-navy to-transparent z-10" />
      </section>


      {/* ═══════════════════════════════════════════════════════
          INTRO / MISSION STRIP
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-brand-navy py-20 lg:py-24 relative overflow-hidden">
        {/* Subtle gold top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

        <div className="container-site relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="section-label text-brand-gold/70 mb-5 block">Our Mission</span>
            <blockquote className="text-white/90 text-lg sm:text-xl lg:text-2xl font-light leading-relaxed italic font-serif mb-8">
              "To connect global opportunities with Korea's world-class healthcare capabilities."
            </blockquote>
            <div className="section-divider bg-brand-gold/40" />
            <p className="text-white/50 text-sm mt-6 tracking-wide">
              J S Kim, Ph.D. — Founder &amp; CEO
            </p>
          </motion.div>
        </div>

        {/* Subtle bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════════ */}
      <section className="section-outer bg-brand-cream">
        <div className="container-site">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8
                       bg-white rounded-2xl shadow-premium p-6 sm:p-10 lg:p-14 border border-brand-border"
          >
            <div className="max-w-xl">
              <span className="section-label mb-3 block">Get Started</span>
              <h2 className="text-2xl lg:text-3xl font-bold text-brand-navy mb-3 leading-snug">
                Ready to engage with the K-Health ecosystem?
              </h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                Submit your inquiry, and our team of experts will respond as soon as possible.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link to="/request" className="btn-primary whitespace-nowrap">
                Submit an Inquiry
              </Link>
              <Link to="/about" className="btn-outline whitespace-nowrap">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
