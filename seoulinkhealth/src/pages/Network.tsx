import { useState } from 'react'
import { motion } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'
import ApplicationFormModal from '@/components/modals/ApplicationFormModal'
import { usePageTitle } from '@/hooks/usePageTitle'

/* ─── Page Component ─────────────────────────────────────────────────────── */
export default function NetworkPage() {
  usePageTitle('Our Expert Network')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="overflow-x-hidden">

        {/* ═══ BANNER ═════════════════════════════════════════════════════ */}
        <section className="bg-brand-navy relative overflow-hidden py-16 sm:py-20 lg:py-24">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right,#B8965A 1px,transparent 1px),linear-gradient(to bottom,#B8965A 1px,transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-teal/10 blur-3xl pointer-events-none" />

          <div className="container-site relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="section-label text-brand-gold/80 mb-4 block">Our Expert Network</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                Distinguished Professionals.<br className="hidden lg:block" />
                <span className="text-brand-gold/80"> Global Reach.</span>
              </h1>
              <div className="w-14 h-px bg-brand-gold mb-6" />
              <p className="text-white/60 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
                Our expert network is composed of a distinguished group of professionals who
                possess both deep theoretical knowledge and extensive practical experience in
                the fields of K-HEALTH CARE, K-HEALTH INDUSTRY, K-BIO, and K-HEALTH FOOD.
              </p>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 48" fill="none" className="w-full">
              <path d="M0 48L0 24Q360 0 720 24Q1080 48 1440 16L1440 48Z" fill="white" />
            </svg>
          </div>
        </section>


        {/* ═══ JOIN US SECTION ════════════════════════════════════════════ */}
        <section id="join" className="bg-brand-cream py-16 sm:py-20 lg:py-28">
          <div className="container-site">
            <div className="max-w-3xl mx-auto">

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
              >
                <span className="section-label mb-3 block">Join the Network</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-4 leading-tight">
                  JOIN US
                </h2>
                <div className="accent-line" />

                <div className="mt-7 space-y-5 text-brand-muted leading-relaxed text-[0.95rem]">
                  <p>
                    We sincerely appreciate your interest in joining our expert network.
                  </p>
                  <p>
                    Our network is open to leading professionals around the world who are
                    interested in sharing their expertise to the global K-Health ecosystem.
                    If you are interested in sharing your expertise in our network as a
                    professional expert in K-HEALTH CARE, K-HEALTH INDUSTRY, K-BIO, or K-HEALTH FOOD,
                    please complete the application form and submit.
                  </p>
                  <p>
                    Upon receipt of your application, our team will promptly contact you with
                    further details regarding the next steps.
                  </p>
                  <p>We once again thank you for your interest.</p>
                </div>

                {/* Email display */}
                <div className="mt-8 flex items-center gap-3 p-4 bg-white rounded-xl border border-brand-border shadow-card">
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
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="btn-primary"
                  >
                    APPLICATION FORM
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </div>

      {/* Application Form Modal */}
      <ApplicationFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
