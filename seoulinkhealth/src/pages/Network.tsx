import { useState } from 'react'
import { motion } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'
import ApplicationFormModal from '@/components/modals/ApplicationFormModal'
import { usePageTitle } from '@/hooks/usePageTitle'

/* --- Animation helpers --------------------------------------------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: d, ease: [0.25, 0.1, 0.25, 1] },
  }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }

/* --- Domain card data ---------------------------------------------------- */
const NETWORK_DOMAINS = [
  {
    id: 'care',
    label: 'K-HEALTH CARE',
    detail:
      'Specialists in Korean medical services, hospital management, health insurance policy, and patient-centered care systems.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12" aria-hidden="true">
        <path d="M24 8v32M8 24h32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'industry',
    label: 'K-HEALTH INDUSTRY',
    detail:
      'Experts in medical device manufacturing, health technology commercialization, regulatory compliance, and industrial healthcare strategy.',
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
    detail:
      'Leaders in biopharmaceutical R&D, clinical research, drug approval pathways, biotech investment, and international licensing.',
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
    detail:
      'Authorities on functional food science, nutraceuticals, dietary supplement regulation, and Korea\'s global health food brand strategy.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12" aria-hidden="true">
        <path d="M24 8c-7 0-12 5-12 11 0 8 12 18 12 18s12-10 12-18c0-6-5-11-12-11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M24 14v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

/* --- Page Component ------------------------------------------------------ */
export default function NetworkPage() {
  usePageTitle('Our Expert Network')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="overflow-x-hidden">

        {/* === BANNER ===================================================== */}
        <section className="bg-brand-navy relative overflow-hidden py-24 lg:py-32">
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right,#B8965A 1px,transparent 1px),linear-gradient(to bottom,#B8965A 1px,transparent 1px)',
              backgroundSize: '100px 100px',
            }}
          />

          <div className="container-site relative z-10 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.h1
                custom={0}
                variants={fadeUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-[-0.02em] mb-6"
              >
                OUR EXPERT NETWORK
              </motion.h1>

              <motion.div custom={0.1} variants={fadeUp} className="w-12 h-px bg-brand-gold mx-auto mb-6" />

              <motion.p
                custom={0.2}
                variants={fadeUp}
                className="text-brand-gold/80 text-sm lg:text-base font-bold tracking-[0.2em] uppercase"
              >
                {SITE_CONFIG.domains.join('  /  ')}
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* === DESCRIPTION ================================================ */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container-site">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="max-w-3xl mx-auto text-center"
            >
              <p className="text-lg lg:text-xl text-brand-muted leading-relaxed">
                Our expert network is composed of{' '}
                {SITE_CONFIG.domains.join(', ')}. Each domain is supported by a distinguished
                group of professionals who possess both deep theoretical knowledge and extensive
                practical experience.
              </p>
              <div className="w-12 h-px bg-brand-gold/40 mx-auto mt-10" />
            </motion.div>
          </div>
        </section>

        {/* === DOMAIN CARDS =============================================== */}
        <section className="pb-24 lg:pb-32 bg-white">
          <div className="container-site">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="section-label mb-3 block">Our Domains</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-5">
                Four Pillars of Expertise
              </h2>
              <div className="section-divider" />
              <p className="text-brand-muted mt-5 leading-relaxed max-w-2xl mx-auto">
                Our experts are committed to delivering the most effective and tailored solutions
                to meet your specific needs across all four K-Health domains.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {NETWORK_DOMAINS.map((d, i) => (
                <motion.article
                  key={d.id}
                  custom={i * 0.1}
                  variants={fadeUp}
                  className="group relative bg-white border border-brand-border rounded-lg p-8 hover:border-brand-gold/50 transition-all duration-300"
                >
                  {/* Top accent line on hover */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-lg" />

                  <div className="text-brand-navy/40 mb-6 group-hover:text-brand-gold transition-colors duration-300">
                    {d.icon}
                  </div>

                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-navy mb-4">
                    {d.label}
                  </h3>

                  <p className="text-sm text-brand-muted leading-relaxed">
                    {d.detail}
                  </p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* === JOIN US ===================================================== */}
        <section id="join" className="bg-brand-navy py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />

          <div className="container-site relative z-10">
            <div className="max-w-3xl mx-auto text-center">

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={stagger}
              >
                <motion.h2
                  custom={0}
                  variants={fadeUp}
                  className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight"
                >
                  JOIN US
                </motion.h2>

                <motion.div custom={0.05} variants={fadeUp} className="w-12 h-px bg-brand-gold mx-auto mb-10" />

                <motion.div custom={0.1} variants={fadeUp} className="space-y-5 text-white/60 leading-relaxed text-base lg:text-lg text-left lg:text-center">
                  <p>
                    We sincerely appreciate your interest in joining our expert network.
                  </p>
                  <p>
                    Our network is open to leading professionals around the world who are
                    interested in contributing their expertise to the global K-Health ecosystem.
                    If you are interested in contributing your expertise in our network as a
                    professional expert, please complete the application form and submit it to
                    our Director,{' '}
                    <strong className="font-semibold text-white">{SITE_CONFIG.directorName}</strong>,
                    via the email address provided below.
                  </p>
                  <p>
                    Upon receipt of your application, our team will promptly contact you with
                    further details regarding the next steps.
                  </p>
                  <p>We once again thank you for your interest.</p>
                </motion.div>

                {/* Email */}
                <motion.div custom={0.2} variants={fadeUp} className="mt-10">
                  <p className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase mb-2">
                    Director Contact
                  </p>
                  <a
                    href={`mailto:${SITE_CONFIG.companyEmail}`}
                    className="text-brand-gold text-lg font-semibold hover:text-brand-gold/80 transition-colors duration-200"
                  >
                    {SITE_CONFIG.companyEmail}
                  </a>
                </motion.div>

                {/* CTA Button */}
                <motion.div custom={0.3} variants={fadeUp} className="mt-10">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-gold text-brand-navy text-sm font-bold tracking-[0.1em] uppercase rounded-sm hover:bg-brand-gold/90 transition-colors"
                  >
                    APPLICATION FORM
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
        </section>

      </div>

      {/* Application Form Modal */}
      <ApplicationFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
