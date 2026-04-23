import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'

/**
 * SEOULINKHEALTH — Footer
 *
 * Sections:
 * - Brand (logo + description)
 * - Navigation links
 * - Contact (address, email, website)
 * - Bottom bar (copyright)
 *
 * Layout: 1 column (mobile) → 3 columns (desktop)
 */
export default function Footer() {
  const { address } = SITE_CONFIG

  const columnVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    }),
  }

  return (
    <footer className="bg-brand-navy text-white">
      {/* ── Gold top accent line ── */}
      <div className="h-0.5 bg-gradient-to-r from-brand-gold/0 via-brand-gold to-brand-gold/0" />

      <div className="container-site py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">

          {/* ── Column 1: Brand ─────────────────────────────────────────────── */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={columnVariants}
          >
            <Link to="/" className="inline-block mb-5 group" aria-label="SEOULINKHEALTH Home">
              <div className="text-base font-bold tracking-[0.12em] text-white group-hover:text-brand-gold transition-colors duration-300">
                SEOU<span className="text-[#D4C4A8]">L</span><span className="text-brand-gold">INK</span>HEALTH
              </div>
              <div className="text-[0.55rem] tracking-[0.28em] text-brand-gold font-bold uppercase mt-1">
                K-HEALTH BUSINESS PLATFORM
              </div>
            </Link>

            <p className="text-sm text-white/55 leading-relaxed max-w-[260px]">
              {SITE_CONFIG.description}
            </p>

            {/* Domain tags */}
            <div className="flex flex-wrap gap-2 mt-5">
              {SITE_CONFIG.domains.map((d) => (
                <span
                  key={d}
                  className="text-[0.6rem] font-bold tracking-wider px-2.5 py-1 border border-brand-gold/25 text-brand-gold/70 rounded-sm uppercase"
                >
                  {d}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── Column 2: Navigation ────────────────────────────────────────── */}
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={columnVariants}
          >
            <h3 className="text-[0.6rem] tracking-[0.22em] uppercase font-bold text-brand-gold mb-6">
              Navigation
            </h3>
            <ul className="space-y-3.5">
              {SITE_CONFIG.navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 hover-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                  <Link
                    to="/company/login"
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 hover-underline"
                  >
                    LOGIN
                  </Link>
                </li>
            </ul>

            {/* Quick Links */}
            <h3 className="text-[0.6rem] tracking-[0.22em] uppercase font-bold text-brand-gold mb-4 mt-8">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {SITE_CONFIG.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 hover-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Column 3: Contact ───────────────────────────────────────────── */}
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={columnVariants}
          >
            <h3 className="text-[0.6rem] tracking-[0.22em] uppercase font-bold text-brand-gold mb-6">
              Contact
            </h3>

            <address className="not-italic space-y-4">
              {/* Address */}
              <div>
                <p className="text-[0.6rem] tracking-widest uppercase text-white/35 mb-1.5 font-semibold">
                  Address
                </p>
                <div className="text-sm text-white/60 leading-relaxed">
                  <p>{address.postalCode}</p>
                  <p>{address.line1}</p>
                  <p>{address.line2}</p>
                  <p>{address.line3}</p>
                </div>
              </div>

              {/* Email */}
              <div>
                <p className="text-[0.6rem] tracking-widest uppercase text-white/35 mb-1.5 font-semibold">
                  Email
                </p>
                <a
                  href={`mailto:${SITE_CONFIG.companyEmail}`}
                  className="text-sm text-brand-gold hover:text-brand-gold-light transition-colors duration-200"
                >
                  {SITE_CONFIG.companyEmail}
                </a>
              </div>

              {/* Website */}
              <div>
                <p className="text-[0.6rem] tracking-widest uppercase text-white/35 mb-1.5 font-semibold">
                  Website
                </p>
                <a
                  href={SITE_CONFIG.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                >
                  www.seoulinkhealth.com
                </a>
              </div>
            </address>
          </motion.div>
        </div>

        {/* ── Bottom Bar ───────────────────────────────────────────────────── */}
        <div className="border-t border-white/8 mt-14 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/30">
          <p>© {new Date().getFullYear()} SEOULINKHEALTH. All rights reserved.</p>
          <p className="tracking-wider">GYEONGGI-DO, REPUBLIC OF KOREA</p>
        </div>
      </div>
    </footer>
  )
}
