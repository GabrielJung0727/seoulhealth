import { motion } from 'framer-motion'
import { INDUSTRIES, type Industry } from '@/data/industries'

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.4, 0, 0.2, 1] },
  }),
}

export default function AboutCoreSectorsSection() {
  return (
    <section className="about-sectors" aria-labelledby="about-sectors-title">
      <div className="about-sectors__texture" aria-hidden="true" />
      <div className="about-sectors__glow about-sectors__glow--one" aria-hidden="true" />
      <div className="about-sectors__glow about-sectors__glow--two" aria-hidden="true" />

      <div className="about-sectors__inner">
        <SectionIntro />
        <SectorGrid />
      </div>
      <div className="about-sectors__curve" aria-hidden="true" />
    </section>
  )
}

function SectionIntro() {
  return (
    <motion.div initial="hidden" animate="visible" className="about-sectors__intro">
      <motion.p custom={0} variants={reveal} className="about-sectors__eyebrow">ABOUT US</motion.p>
      <motion.h1 id="about-sectors-title" custom={0.08} variants={reveal}>
        <span>Our Core</span>
        <strong>Sectors</strong>
      </motion.h1>
      <motion.p custom={0.16} variants={reveal} className="about-sectors__description">
        SeoulLinkHealth connects global opportunities across the full spectrum of K-health,
        through our network of trusted experts and industry insights.
      </motion.p>
      <motion.a custom={0.24} variants={reveal} href="#about-details" className="about-sectors__cta">
        LEARN MORE <span aria-hidden="true">→</span>
      </motion.a>
    </motion.div>
  )
}

function SectorGrid() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="about-sectors__grid"
      aria-label="SEOULINKHEALTH core sectors"
    >
      {INDUSTRIES.map((sector, index) => (
        <SectorCard key={sector.slug} sector={sector} index={index} />
      ))}
    </motion.div>
  )
}

function SectorCard({ sector, index }: { sector: Industry; index: number }) {
  return (
    <motion.article
      custom={0.12 + index * 0.07}
      variants={reveal}
      className={`sector-card${'featured' in sector && sector.featured ? ' sector-card--featured' : ''}`}
    >
      <div
        className="sector-card__image"
        style={{ backgroundPosition: `${sector.position} center` }}
        role="img"
        aria-label={`${sector.label} representative imagery`}
      />
      <div className="sector-card__overlay" aria-hidden="true" />
      <div className="sector-card__content">
        <div className="sector-card__meta">
          <SectorIcon name={sector.icon} />
          <span>{sector.id}</span>
        </div>
        <div className="sector-card__copy">
          <h2>{sector.label}</h2>
          <p>{sector.description}</p>
        </div>
      </div>
    </motion.article>
  )
}

function SectorIcon({ name }: { name: Industry['icon'] }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 } as const

  return (
    <span className="sector-card__icon" aria-hidden="true">
      {name === 'medical-cross' && <svg {...common}><path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5V4Z" /></svg>}
      {name === 'industry' && <svg {...common}><path d="M4 20V9l6 3V8l6 3V5h4v15H4Z" /><path d="M8 16h2m3 0h2m3 0h2" /></svg>}
      {name === 'dna' && <svg {...common}><path d="M7 3c0 6 10 6 10 12 0 3-2 5-4 6M17 3c0 6-10 6-10 12 0 3 2 5 4 6M8 7h8m-8 10h8" /></svg>}
      {name === 'leaf' && <svg {...common}><path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-7 10-16Z" /><path d="M4 21c3-6 7-9 13-12" /></svg>}
      {name === 'beauty' && <svg {...common}><path d="M12 21c-1-5-5-6-7-9 4 0 6 1 7 4 1-3 3-4 7-4-2 3-6 4-7 9Z" /><path d="M12 16c-4-3-4-7 0-12 4 5 4 9 0 12Z" /></svg>}
    </span>
  )
}
