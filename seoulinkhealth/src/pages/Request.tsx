import { useState } from 'react'
import { motion } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'
import InquiryFormModal from '@/components/modals/InquiryFormModal'
import { usePageTitle } from '@/hooks/usePageTitle'

/* ─── Animation helpers ──────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: d, ease: [0.4, 0, 0.2, 1] },
  }),
}

/* ─── Page Component ─────────────────────────────────────────────────────── */
export default function RequestPage() {
  usePageTitle('Request Now')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="overflow-x-hidden">

        {/* ═══ BANNER ═════════════════════════════════════════════════════ */}
        <section className="bg-brand-navy relative overflow-hidden py-16 sm:py-20 lg:py-24">
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right,#B8965A 1px,transparent 1px),linear-gradient(to bottom,#B8965A 1px,transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
          {/* Glow accents */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-brand-teal/10 blur-3xl pointer-events-none" />

          <div className="container-site relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="section-label text-brand-gold/80 mb-4 block">Request Now</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                Begin Your K-Health<br className="hidden lg:block" />
                <span className="text-brand-gold/80"> Advisory Journey.</span>
              </h1>
              <div className="w-14 h-px bg-brand-gold mb-6" />
              <p className="text-white/60 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
                Our expert team is ready to provide accurate, reliable, and timely solutions
                tailored to your specific needs across the full K-Health ecosystem.
              </p>
            </motion.div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 48" fill="none" className="w-full">
              <path d="M0 48L0 24Q360 0 720 24Q1080 48 1440 16L1440 48Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ═══ MAIN CONTENT + HIGHLIGHTS ══════════════════════════════════ */}
        <section className="section-outer bg-white">
          <div className="container-site">
            <div className="max-w-2xl">

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              >
                <motion.span custom={0} variants={fadeUp} className="section-label mb-3 block">
                  Advisory Services
                </motion.span>
                <motion.h2 custom={0.05} variants={fadeUp} className="text-3xl lg:text-4xl font-bold text-brand-navy mb-4 leading-tight">
                  REQUEST NOW
                </motion.h2>
                <motion.div custom={0.1} variants={fadeUp} className="accent-line" />

                <motion.div custom={0.15} variants={fadeUp} className="mt-7 space-y-5 text-brand-muted leading-relaxed text-[0.95rem]">
                  <p>
                    Thank you for your interest in our services.
                  </p>
                  <p>
                    If you require our advisory services, please complete the inquiry form
                    and submit.
                  </p>
                  <p>
                    We will contact you as soon as possible.
                  </p>
                  <p>
                    We sincerely appreciate your interest in SEOULINKHEALTH and look forward
                    to assisting you.
                  </p>
                </motion.div>

                {/* Email display */}
                <motion.div
                  custom={0.2}
                  variants={fadeUp}
                  className="mt-8 flex items-center gap-3 p-4 bg-brand-cream rounded-xl border border-brand-border shadow-card"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-navy/5 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-brand-teal" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-bold tracking-widest uppercase text-brand-muted mb-0.5">
                      Director Contact
                    </p>
                    <a
                      href={`mailto:${SITE_CONFIG.companyEmail}`}
                      className="text-sm font-semibold text-brand-teal hover:text-brand-navy transition-colors duration-200"
                    >
                      {SITE_CONFIG.companyEmail}
                    </a>
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.div custom={0.25} variants={fadeUp} className="mt-8">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="btn-primary"
                  >
                    INQUIRY FORM
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                  </button>
                </motion.div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ═══ DOMAIN COVERAGE STRIP ══════════════════════════════════════ */}
        <section className="bg-brand-navy py-14">
          <div className="container-site">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="text-white/50 text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-6">
                Advisory Coverage
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {SITE_CONFIG.domains.map((domain) => (
                  <span
                    key={domain}
                    className="domain-badge border border-brand-gold/30 text-brand-gold/80
                               hover:border-brand-gold hover:text-brand-gold transition-colors duration-200 cursor-default"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

      </div>

      {/* Inquiry Form Modal */}
      <InquiryFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
