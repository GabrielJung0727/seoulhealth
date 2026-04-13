import { motion } from 'framer-motion'
import { usePageTitle } from '@/hooks/usePageTitle'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] },
  }),
}

export default function TermsOfServicePage() {
  usePageTitle('Terms of Service')

  return (
    <div className="overflow-x-hidden">
      {/* Hero Banner */}
      <section className="bg-brand-navy py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-[#0F2238] to-[#0A1520]" />
        <div className="container-site relative z-10 text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fadeUp}
            className="text-white/60 text-sm sm:text-base"
          >
            Please read these terms carefully before using our services
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container-site max-w-3xl">
          {/* Draft Disclaimer */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fadeUp}
            className="mb-10 p-4 bg-amber-50 border border-amber-300 rounded-lg text-center"
          >
            <p className="text-amber-800 font-bold text-sm tracking-wide uppercase">
              DRAFT — This document is a preliminary draft and is subject to revision.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.3}
            variants={fadeUp}
            className="prose prose-brand max-w-none space-y-8"
          >
            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">1. Acceptance of Terms</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                By accessing or using the SEOULINKHEALTH platform and services, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must not access or use our services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">2. Description of Services</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                SEOULINKHEALTH provides a K-Health business platform connecting global partners with Korea's healthcare ecosystem. Our services include expert consultation, inquiry management, and professional networking across the domains of K-Health Care, K-Health Industry, K-Bio, and K-Health Food.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">3. User Accounts</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                When you create an account, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">4. Intellectual Property</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                All content, trademarks, and intellectual property on this platform are owned by or licensed to SEOULINKHEALTH. You may not reproduce, distribute, or create derivative works without our express written consent.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">5. Limitation of Liability</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                SEOULINKHEALTH shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you for services in the twelve months preceding the claim.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">6. Governing Law</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of the Republic of Korea. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of the Republic of Korea.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">7. Contact Information</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                For questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:contact@seoulinkhealth.com" className="text-brand-teal hover:underline">
                  contact@seoulinkhealth.com
                </a>.
              </p>
            </div>

            <div className="pt-4 border-t border-brand-border">
              <p className="text-brand-muted text-xs">
                Last updated: April 2026
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
