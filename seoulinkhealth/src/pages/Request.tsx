import { useEffect, useState } from 'react'
import { SITE_CONFIG } from '@/config/site'
import InquiryFormModal from '@/components/modals/InquiryFormModal'
import { usePageTitle } from '@/hooks/usePageTitle'
import './Request.css'

/* ─── Page Component ─────────────────────────────────────────────────────── */
export default function RequestPage() {
  usePageTitle('Request Now')
  const [modalOpen, setModalOpen] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#inquiry'
  )

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#inquiry') {
        setModalOpen(true)
      }
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  return (
    <>
      <div className="request-page">
        <RequestHero />
        <RequestContent onInquire={() => setModalOpen(true)} />
        <RequestValues />
      </div>

      {/* Inquiry Form Modal */}
      <InquiryFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function RequestHero() {
  return (
    <section className="request-hero">
      {/* Seoul skyline with N Seoul Tower at dusk — decorative background */}
      <img
        className="request-hero__image"
        src="/images/seoulinkhealth-hero.png"
        alt=""
        aria-hidden="true"
      />
      <div className="container-site request-hero__inner">
        <div className="request-hero__copy">
          <span className="request-eyebrow">ADVISORY SERVICES</span>
          <h1>
            Begin Your
            <br />
            K-Health
            <br />
            <em>Advisory Journey.</em>
          </h1>
          <i className="request-hero__rule" aria-hidden="true" />
          <p>
            Our expert team is ready to provide accurate, reliable, and timely solutions tailored to
            your specific needs across the full K-Health ecosystem.
          </p>
        </div>
        <aside className="request-hero__note">
          <p>
            STRATEGIC
            <br />
            ADVISORY
            <br />
            FOR A
            <br />
            HEALTHIER
            <br />
            TOMORROW
          </p>
        </aside>
      </div>
      <svg
        className="request-wave"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 22Q300 96 700 44T1440 22V80H0Z" fill="#c7a461" opacity=".7" />
        <path d="M0 44Q260 88 620 56T1100 52Q1280 70 1440 38V80H0Z" fill="#faf9f6" />
      </svg>
    </section>
  )
}

/* ─── Request content ────────────────────────────────────────────────────── */
function RequestContent({ onInquire }: { onInquire: () => void }) {
  return (
    <section className="request-content" aria-labelledby="request-now-title">
      <div className="container-site request-content__grid">
        <div className="request-content__copy">
          <span className="request-eyebrow">ADVISORY SERVICES</span>
          <h2 id="request-now-title">REQUEST NOW</h2>
          <i className="request-content__rule" aria-hidden="true" />
          <p className="request-content__lead">Thank you for your interest in our services.</p>
          <p>
            If you require our advisory services, please complete the inquiry form and submit.
          </p>
          <p>We will contact you as soon as possible.</p>
          <p>
            We sincerely appreciate your interest in SEOULINKHEALTH and look forward to assisting
            you.
          </p>

          <div className="request-contact">
            <span className="request-contact__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
                <path d="M3.5 6.5 12 13l8.5-6.5" />
              </svg>
            </span>
            <span className="request-contact__body">
              <span className="request-contact__label">DIRECTOR CONTACT</span>
              <a href={`mailto:${SITE_CONFIG.companyEmail}`}>{SITE_CONFIG.companyEmail}</a>
            </span>
          </div>

          <button type="button" onClick={onInquire} className="request-button">
            INQUIRY FORM <span aria-hidden="true">→</span>
          </button>
        </div>

        <AdvisoryGlobe />
      </div>
    </section>
  )
}

/* ─── Seoul-centred global advisory visual ───────────────────────────────── */
const REGIONS = [
  { name: 'NORTH AMERICA', node: [165, 205], label: [70, 186], arc: 'M440 212Q300 40 165 205' },
  { name: 'EUROPE', node: [298, 162], label: [256, 144], arc: 'M440 212Q372 104 298 162' },
  { name: 'MIDDLE EAST', node: [338, 262], label: [252, 292], arc: 'M440 212Q404 276 338 262' },
  { name: 'OCEANIA', node: [462, 370], label: [480, 375], arc: 'M440 212Q512 292 462 370' },
] as const

function AdvisoryGlobe() {
  return (
    <figure className="request-globe">
      <div className="request-globe__copy" aria-hidden="true">
        <i />
        <p>
          GLOBAL
          <br />
          INSIGHTS.
          <br />
          LOCAL
          <br />
          IMPACT.
        </p>
      </div>
      <svg viewBox="0 0 600 520" role="img" aria-labelledby="request-globe-title request-globe-desc">
        <title id="request-globe-title">Global insights, local impact — advising from Seoul</title>
        <desc id="request-globe-desc">
          A conceptual advisory network with Seoul as the primary hub, connected to North America,
          Europe, the Middle East and Oceania. Not a map of confirmed office locations.
        </desc>
        <g className="request-globe__grid">
          <circle cx="320" cy="260" r="210" />
          <ellipse cx="320" cy="260" rx="140" ry="210" />
          <ellipse cx="320" cy="260" rx="62" ry="210" />
          <ellipse cx="320" cy="260" rx="210" ry="70" />
          <ellipse cx="320" cy="260" rx="210" ry="140" />
          <path d="M110 260H530M320 50V470" />
          <circle cx="320" cy="260" r="234" className="request-globe__orbit" />
        </g>
        <g className="request-globe__arcs">
          {REGIONS.map((r) => (
            <path key={r.name} d={r.arc} pathLength={1} />
          ))}
        </g>
        <g className="request-globe__nodes">
          {REGIONS.map((r) => (
            <circle key={r.name} cx={r.node[0]} cy={r.node[1]} r="4" />
          ))}
        </g>
        <g className="request-globe__hub">
          <circle cx="440" cy="212" r="26" className="request-globe__halo" />
          <circle cx="440" cy="212" r="14" className="request-globe__glow" />
          <circle cx="440" cy="212" r="6.5" />
        </g>
        <g className="request-globe__labels">
          {REGIONS.map((r) => (
            <text key={r.name} x={r.label[0]} y={r.label[1]}>
              {r.name}
            </text>
          ))}
          <text x="466" y="206" className="request-globe__seoul">
            SEOUL
          </text>
          <text x="466" y="224" className="request-globe__sub">
            PRIMARY HUB
          </text>
          <text x="320" y="508" textAnchor="middle" className="request-globe__sub">
            SEOUL-CENTERED ADVISORY NETWORK
          </text>
        </g>
      </svg>
    </figure>
  )
}

/* ─── Value strip ────────────────────────────────────────────────────────── */
const VALUES = [
  {
    title: 'GLOBAL PERSPECTIVE',
    text: 'Insights across markets',
    path: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18ZM3 12h18M12 3c-5 5-5 13 0 18c5-5 5-13 0-18',
  },
  {
    title: 'TAILORED STRATEGY',
    text: 'Solutions for unique needs',
    path: 'M4 20h16M6 20v-6M11 20V9M16 20v-9M5 11l5-4 4 3 5-5M15 5h4v4',
  },
  {
    title: 'EXPERT COLLABORATION',
    text: 'Work with industry leaders',
    path: 'M8.5 10a3 3 0 1 0 0-6a3 3 0 0 0 0 6ZM16.5 11a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5ZM3 20c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6M14 14.4c.8-.3 1.6-.4 2.5-.4c2.5 0 4.5 2 4.5 5',
  },
  {
    title: 'MEASURABLE IMPACT',
    text: 'Drive sustainable growth',
    path: 'M7 4h10l4 5-9 11L3 9l4-5ZM3 9h18M9.5 4 8 9l4 11 4-11-1.5-5',
  },
]

function RequestValues() {
  return (
    <section className="request-values" aria-label="Why work with SEOULINKHEALTH">
      <svg
        className="request-values__lines"
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M-40 ${70 + i * 9}Q300 ${200 + i * 6} 760 ${110 + i * 7}T1480 ${160 + i * 8}`}
          />
        ))}
      </svg>
      <svg className="request-values__leaf" viewBox="0 0 170 260" aria-hidden="true">
        <path d="M160 260Q96 170 112 18M126 214Q44 220 16 168Q84 158 126 214ZM110 170Q150 140 160 92Q110 104 110 170ZM108 126Q52 122 34 70Q92 80 108 126ZM110 84Q140 44 124 6Q94 40 110 84Z" />
        <path d="M16 168L126 214M34 70L108 126M160 92L110 170M124 6L110 84M40 172L104 204M58 84L100 118" />
      </svg>
      <div className="container-site request-values__grid">
        {VALUES.map((v) => (
          <article key={v.title}>
            <svg
              className="request-values__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={v.path} />
            </svg>
            <h3>{v.title}</h3>
            <p>{v.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
