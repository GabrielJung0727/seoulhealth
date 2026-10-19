import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { INDUSTRIES } from '@/data/industries'
import { SITE_CONFIG } from '@/config/site'
import { usePageTitle } from '@/hooks/usePageTitle'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] },
  }),
}

export default function HomePage() {
  usePageTitle()

  return (
    <div className="home-page overflow-x-hidden">
      <section className="hero-premium" aria-labelledby="home-title">
        <div className="hero-premium__image" aria-hidden="true" />
        <div className="hero-premium__overlay" aria-hidden="true" />

        <motion.div initial="hidden" animate="visible" className="hero-premium__content">
          <motion.p custom={0} variants={fadeUp} className="hero-premium__eyebrow">
            <span aria-hidden="true" />{SITE_CONFIG.tagline}
          </motion.p>
          <motion.h1 id="home-title" custom={0.1} variants={fadeUp} className="hero-premium__title">
            <span>SEOU</span><span className="hero-premium__gold">LINK</span><span>HEALTH</span>
          </motion.h1>
          <motion.div custom={0.18} variants={fadeUp} className="hero-premium__chips" aria-label="Industry coverage">
            {INDUSTRIES.map((industry) => <span key={industry.slug}>{industry.label}</span>)}
          </motion.div>
          <motion.p custom={0.25} variants={fadeUp} className="hero-premium__description">
            Our network of professional experts provides<br className="hidden sm:block" /> accurate, reliable, and timely solutions to your inquiries.
          </motion.p>
          <motion.div custom={0.35} variants={fadeUp} className="hero-premium__actions">
            <Link to="/request" className="hero-premium__primary">REQUEST NOW <span aria-hidden="true">→</span></Link>
            <Link to="/network#join" className="hero-premium__secondary">JOIN OUR EXPERT NETWORK <span aria-hidden="true">→</span></Link>
          </motion.div>
        </motion.div>
        <a href="#industries" className="hero-premium__scroll" aria-label="Scroll to industry coverage">
          <span>SCROLL</span><i aria-hidden="true" />
        </a>
      </section>

      <section id="industries" className="industry-strip" aria-label="K-Health industry categories">
        {INDUSTRIES.map((industry) => (
          <Link key={industry.slug} to="/request" className="industry-card">
            <span className="industry-card__image" style={{ backgroundPosition: `${industry.position} center` }} aria-hidden="true" />
            <span className="industry-card__shade" aria-hidden="true" />
            <span className="industry-card__content">
              <span className="industry-card__number">{industry.id}</span>
              <strong>{industry.label}</strong>
              <span className="industry-card__arrow" aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="mission-premium">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7 }} className="mission-premium__inner">
          <div>
            <p className="mission-premium__label"><span aria-hidden="true" /> OUR MISSION</p>
            <h2>Connecting People,<br />Industries, and <em>Innovations</em></h2>
          </div>
          <p className="mission-premium__copy">
            We create opportunities across K-HEALTH CARE, K-HEALTH INDUSTRY, K-BIO, K-HEALTH FOOD, and K-BEAUTY, building a healthier and more sustainable future through trusted expertise and collaboration.
          </p>
        </motion.div>
      </section>

      {/*
        Partner section is intentionally hidden during the initial business phase.
        Keep the optional advertising slot directly below that future section so it
        can be enabled later without changing the Home page structure.
      */}
      {SITE_CONFIG.adBanner.enabled && (
        <aside id="partner-ad-slot" className="campaign-banner" aria-label="Partner advertisement">
          <span>{SITE_CONFIG.adBanner.label}</span>
          <p>{SITE_CONFIG.adBanner.message}</p>
          <Link to={SITE_CONFIG.adBanner.href}>LEARN MORE <span aria-hidden="true">→</span></Link>
        </aside>
      )}

      <section className="home-cta">
        <div><p>GET STARTED</p><h2>Ready to engage with the K-Health ecosystem?</h2><span>Submit your inquiry, and our team of experts will respond as soon as possible.</span></div>
        <Link to="/request">SUBMIT AN INQUIRY <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  )
}
