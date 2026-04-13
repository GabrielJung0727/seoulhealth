import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageTitle } from '@/hooks/usePageTitle'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] },
  }),
}

interface FAQItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is SEOULINKHEALTH?',
    answer:
      'SEOULINKHEALTH is a K-Health business platform that connects global partners with Korea\'s world-class healthcare ecosystem. We provide expert consultation and advisory services across four key domains: K-Health Care, K-Health Industry, K-Bio, and K-Health Food.',
  },
  {
    question: 'How do I submit an inquiry?',
    answer:
      'You can submit an inquiry by navigating to the "Request Now" page from the main menu. Fill out the inquiry form with your details and a description of your needs, and our team will review and respond to your request promptly.',
  },
  {
    question: 'How long does it take to get a response?',
    answer:
      'Our team strives to respond to all inquiries within 2-3 business days. Complex inquiries that require expert consultation may take additional time. You will receive a confirmation email upon submission and be notified when your inquiry is being reviewed.',
  },
  {
    question: 'Is my information secure?',
    answer:
      'Yes, we take data security very seriously. All data transmissions are encrypted using industry-standard SSL/TLS protocols. We implement strict access controls and follow best practices for data protection in compliance with applicable privacy regulations.',
  },
  {
    question: 'How do I join the expert network?',
    answer:
      'Professionals with expertise in Korean healthcare sectors can apply to join our expert network through the "Our Expert Network" page. Submit your application with your qualifications and experience, and our team will review your profile.',
  },
  {
    question: 'What domains do you cover?',
    answer:
      'We cover four primary domains: K-Health Care (medical services, hospital systems, patient care), K-Health Industry (medical devices, supply chains, health ecosystem), K-Bio (biopharmaceuticals, R&D, clinical trials, regulatory pathways), and K-Health Food (functional food, nutraceuticals, health food standards).',
  },
]

function AccordionItem({ item, index }: { item: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={0.3 + index * 0.08}
      variants={fadeUp}
      className="border border-brand-border rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-brand-cream/50 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base font-semibold text-brand-navy pr-4">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-brand-gold"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6">
              <p className="text-brand-muted text-sm leading-relaxed">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQPage() {
  usePageTitle('FAQ')

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
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fadeUp}
            className="text-white/60 text-sm sm:text-base"
          >
            Find answers to common questions about our services
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

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
