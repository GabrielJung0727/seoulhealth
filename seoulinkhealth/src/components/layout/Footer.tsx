import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'

export default function Footer() {
  const { address } = SITE_CONFIG

  const col = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    }),
  }

  return (
    <footer className="bg-brand-navy text-white">
      <div className="h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

      <div className="container-site py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">

          {/* Brand */}
          <motion.div custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={col}>
            <Link to="/" className="inline-block mb-6">
              <div className="text-lg font-bold tracking-[0.1em] text-white">
                SEOUL<span className="text-brand-gold">LINK</span>HEALTH
              </div>
              <div className="text-[0.5rem] tracking-[0.25em] text-white/30 font-semibold uppercase mt-1">
                K-Health Business Platform
              </div>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-[280px]">
              {SITE_CONFIG.description}
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={col}>
            <h3 className="text-[0.6rem] tracking-[0.25em] uppercase font-bold text-brand-gold/70 mb-6">
              Navigation
            </h3>
            <ul className="space-y-3">
              {SITE_CONFIG.navLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-[0.6rem] tracking-[0.25em] uppercase font-bold text-brand-gold/70 mb-4 mt-8">
              Legal
            </h3>
            <ul className="space-y-2">
              {SITE_CONFIG.quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={col}>
            <h3 className="text-[0.6rem] tracking-[0.25em] uppercase font-bold text-brand-gold/70 mb-6">
              Contact
            </h3>
            <address className="not-italic space-y-5">
              <div>
                <p className="text-[0.55rem] tracking-widest uppercase text-white/25 mb-1.5 font-semibold">Address</p>
                <div className="text-sm text-white/50 leading-relaxed">
                  <p>{address.postalCode}</p>
                  <p>{address.line1}</p>
                  <p>{address.line2}</p>
                  <p>{address.line3}</p>
                </div>
              </div>
              <div>
                <p className="text-[0.55rem] tracking-widest uppercase text-white/25 mb-1.5 font-semibold">Email</p>
                <a href={`mailto:${SITE_CONFIG.companyEmail}`} className="text-sm text-brand-gold hover:text-brand-gold/80 transition-colors">
                  {SITE_CONFIG.companyEmail}
                </a>
              </div>
              <div>
                <p className="text-[0.55rem] tracking-widest uppercase text-white/25 mb-1.5 font-semibold">Website</p>
                <a href={SITE_CONFIG.website} target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors">
                  www.seoulinkhealth.com
                </a>
              </div>
            </address>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 mt-16 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/20">
          <p>&copy; {new Date().getFullYear()} SEOULINKHEALTH. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div id="google_translate_element" />
            <p className="tracking-wider uppercase">Gyeonggi-do, South Korea</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
