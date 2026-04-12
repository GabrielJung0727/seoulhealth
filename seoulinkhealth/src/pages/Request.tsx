import { useState } from 'react'
import { motion } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'
import InquiryFormModal from '@/components/modals/InquiryFormModal'
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

/* --- Service highlights -------------------------------------------------- */
const HIGHLIGHTS = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Response Time',
    value: 'Within 2 Business Days',
    description: 'Our team reviews every inquiry promptly and responds within two working days.',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
      </svg>
    ),
    label: 'Expert Review',
    value: 'Domain Specialists',
    description: 'Your request is matched with specialists who have deep domain expertise.',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Service Quality',
    value: 'Premier Advisory',
    description: 'Rigorous quality standards ensure reliable and actionable insights.',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.315-.6a35.504 35.504 0 013.502-2.272.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.087.75.75 0 01-.842 0A31.37 31.37 0 002.18 8.028a.75.75 0 01-.253-1.285 41.059 41.059 0 018.197-5.424zM3.037 11.066a31.5 31.5 0 016.4-3.541.75.75 0 01.527 0 31.5 31.5 0 016.399 3.54.75.75 0 01-.167 1.276 31.508 31.508 0 00-2.996 1.705V15a.75.75 0 01-.75.75h-5a.75.75 0 01-.75-.75v-1.956a31.508 31.508 0 00-2.997-1.704.75.75 0 01-.166-1.275z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Coverage',
    value: 'Full K-Health Spectrum',
    description: 'Comprehensive advisory across all four K-Health domains.',
  },
]

/* --- Page Component ------------------------------------------------------ */
export default function RequestPage() {
  usePageTitle('Request Now')
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
                REQUEST NOW
              </motion.h1>

              <motion.div custom={0.1} variants={fadeUp} className="w-12 h-px bg-brand-gold mx-auto mb-6" />

              <motion.p
                custom={0.2}
                variants={fadeUp}
                className="text-brand-gold/80 text-sm lg:text-base font-bold tracking-[0.2em] uppercase"
              >
                Begin Your K-Health Advisory Journey
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* === MAIN CONTENT: Two columns ================================== */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container-site">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">

              {/* Left: body copy + CTA */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={stagger}
              >
                <motion.span custom={0} variants={fadeUp} className="section-label mb-3 block">
                  Advisory Services
                </motion.span>
                <motion.h2 custom={0.05} variants={fadeUp} className="text-3xl lg:text-4xl font-bold text-brand-navy mb-5 leading-tight">
                  How Can We Help?
                </motion.h2>
                <motion.div custom={0.1} variants={fadeUp} className="w-12 h-px bg-brand-gold mb-8" />

                <motion.div custom={0.15} variants={fadeUp} className="space-y-5 text-brand-muted leading-relaxed text-base lg:text-lg">
                  <p>
                    Thank you for your interest in our services.
                  </p>
                  <p>
                    If you require our advisory services in relation to your business, please
                    complete the inquiry form and submit it to our Director,{' '}
                    <strong className="font-semibold text-brand-navy">{SITE_CONFIG.directorName}</strong>,
                    via the email address below.
                  </p>
                  <p>
                    Upon receipt of your request, we will contact you within two business days.
                  </p>
                  <p>
                    We sincerely appreciate your interest in SEOULINKHEALTH and look forward
                    to assisting you.
                  </p>
                </motion.div>

                {/* CTA Button */}
                <motion.div custom={0.25} variants={fadeUp} className="mt-10">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-gold text-brand-navy text-sm font-bold tracking-[0.1em] uppercase rounded-sm hover:bg-brand-gold/90 transition-colors"
                  >
                    INQUIRY FORM
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                  </button>
                </motion.div>

                {/* Contact info */}
                <motion.div custom={0.3} variants={fadeUp} className="mt-8 flex items-center gap-3">
                  <svg className="w-4 h-4 text-brand-gold shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-sm text-brand-muted">Contact:</span>
                  <a
                    href={`mailto:${SITE_CONFIG.companyEmail}`}
                    className="text-sm font-semibold text-brand-gold hover:text-brand-gold/80 transition-colors duration-200"
                  >
                    {SITE_CONFIG.companyEmail}
                  </a>
                </motion.div>
              </motion.div>

              {/* Right: highlight cards */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:mt-4"
              >
                {HIGHLIGHTS.map((h, i) => (
                  <motion.div
                    key={h.label}
                    custom={i * 0.08}
                    variants={fadeUp}
                    className="group relative border border-brand-border rounded-lg p-6 hover:border-brand-gold/50 transition-all duration-300"
                  >
                    {/* Top accent line on hover */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-lg" />

                    <div className="w-9 h-9 rounded-lg bg-brand-navy/5 flex items-center justify-center text-brand-navy/40 mb-4
                                    group-hover:text-brand-gold transition-colors duration-300">
                      {h.icon}
                    </div>

                    <p className="text-xs font-bold tracking-[0.15em] uppercase text-brand-navy mb-1">
                      {h.label}
                    </p>
                    <p className="text-sm font-semibold text-brand-navy leading-snug mb-2">{h.value}</p>
                    <p className="text-xs text-brand-muted leading-relaxed">{h.description}</p>
                  </motion.div>
                ))}
              </motion.div>

            </div>
          </div>
        </section>

        {/* === DOMAIN COVERAGE STRIP ====================================== */}
        <section className="bg-brand-navy py-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />

          <div className="container-site">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="text-white/40 text-xs font-bold tracking-[0.25em] uppercase mb-6">
                Advisory Coverage
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {SITE_CONFIG.domains.map((domain) => (
                  <span
                    key={domain}
                    className="inline-block text-[0.65rem] font-bold tracking-[0.2em] uppercase px-5 py-2 rounded-sm
                               border border-brand-gold/30 text-brand-gold/80
                               hover:border-brand-gold hover:text-brand-gold transition-colors duration-200 cursor-default"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
        </section>

      </div>

      {/* Inquiry Form Modal */}
      <InquiryFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
