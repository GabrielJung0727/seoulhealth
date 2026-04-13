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

export default function PrivacyPolicyPage() {
  usePageTitle('Privacy Policy')

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
            Privacy Policy
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fadeUp}
            className="text-white/60 text-sm sm:text-base"
          >
            How we collect, use, and protect your information
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
              <h2 className="text-xl font-bold text-brand-navy mb-3">1. Data Collection</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                We collect personal information that you voluntarily provide when you use our services, submit inquiries, or register on our platform. This may include your name, email address, phone number, company name, and other professional details relevant to your inquiry.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">2. Use of Information</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                The information we collect is used to process and respond to your inquiries, connect you with relevant experts in our network, improve our services, and communicate important updates. We do not sell your personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">3. Cookies</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                Our website may use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from. You can control cookie settings through your browser preferences.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">4. Third-Party Services</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                We may use third-party service providers to assist in operating our platform, conducting business, or servicing you. These third parties have access to your personal information only to perform specific tasks on our behalf and are obligated to protect your information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">5. Data Security</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data transmissions are encrypted using industry-standard SSL/TLS protocols.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-3">6. Contact Information</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                If you have any questions or concerns regarding this privacy policy or our data practices, please contact us at{' '}
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
