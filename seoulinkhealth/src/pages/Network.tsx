import { useState } from 'react'
import { SITE_CONFIG } from '@/config/site'
import { INDUSTRIES } from '@/data/industries'
import ApplicationFormModal from '@/components/modals/ApplicationFormModal'
import { usePageTitle } from '@/hooks/usePageTitle'
import './Network.css'

export default function NetworkPage() {
  usePageTitle('Our Expert Network')
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <>
      <div className="network-page">
        <NetworkHero />
        <JoinNetworkSection onApply={() => setModalOpen(true)} />
        <NetworkValues />
      </div>
      <ApplicationFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}

function NetworkHero() {
  return (
    <section className="network-hero">
      <img className="network-hero__image" src="/images/seoulinkhealth-hero.png" alt="" />
      <div className="container-site network-hero__inner">
        <div className="network-hero__copy">
          <span className="network-eyebrow">OUR EXPERT NETWORK</span>
          <h1>
            Distinguished
            <br />
            Professionals.
            <br />
            <em>Global Reach.</em>
          </h1>
          <p>
            Our expert network is composed of a distinguished group of professionals who possess
            both deep theoretical knowledge and extensive practical experience in the fields of
            K-HEALTH CARE, K-HEALTH INDUSTRY, K-BIO, K-HEALTH FOOD, and K-BEAUTY.
          </p>
        </div>
        <aside className="network-hero__note">
          <p>
            GLOBAL
            <br />
            EXPERTISE
            <br />
            FOR A<br />
            HEALTHIER
            <br />
            TOMORROW
          </p>
          <div className="network-stats">
            <strong>{INDUSTRIES.length}</strong>
            <span>
              KEY
              <br />
              SECTORS
            </span>
          </div>
        </aside>
      </div>
      <svg
        className="network-wave"
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 16Q280 100 630 38T1440 19V70H0Z" fill="#c7a461" opacity=".65" />
        <path d="M0 38Q230 78 570 47T1040 46Q1240 68 1440 33V70H0Z" fill="#faf9f6" />
      </svg>
    </section>
  )
}

function JoinNetworkSection({ onApply }: { onApply: () => void }) {
  return (
    <section className="network-join" id="join">
      <div className="container-site network-join__grid">
        <div>
          <span className="network-eyebrow">JOIN THE NETWORK</span>
          <h2>Join Us</h2>
          <p className="network-join__lead">
            We sincerely appreciate your interest in joining our expert network.
          </p>
          <p>
            Our network is open to leading professionals around the world who are interested in
            sharing their expertise to the global K-Health ecosystem. If you are interested in
            sharing your expertise in our network as a professional expert in K-HEALTH CARE,
            K-HEALTH INDUSTRY, K-BIO, K-HEALTH FOOD, or K-BEAUTY, please complete the application
            form and submit.
          </p>
          <p>
            Upon receipt of your application, our team will promptly contact you with further
            details regarding the next steps.
          </p>
          <p>We once again thank you for your interest.</p>
          <div className="network-actions">
            <button onClick={onApply} className="network-button">
              APPLICATION FORM <span aria-hidden="true">→</span>
            </button>
            <a
              href={`mailto:${SITE_CONFIG.companyEmail}`}
              className="network-button network-button--secondary"
            >
              CONTACT US
            </a>
          </div>
          <div className="network-contact">
            <span>DIRECTOR CONTACT</span>
            <a href={`mailto:${SITE_CONFIG.companyEmail}`}>{SITE_CONFIG.companyEmail}</a>
          </div>
        </div>
        <GlobalNetworkGraphic />
      </div>
    </section>
  )
}

function GlobalNetworkGraphic() {
  return (
    <figure className="network-globe">
      <svg
        viewBox="0 0 560 520"
        role="img"
        aria-labelledby="network-globe-title network-globe-desc"
      >
        <title id="network-globe-title">Connecting expertise through Seoul</title>
        <desc id="network-globe-desc">
          A conceptual global network connecting Seoul with Asia, Europe, and North America. Not a
          map of confirmed service locations.
        </desc>
        <g fill="none" stroke="#c5b68f" strokeWidth=".8">
          <circle cx="280" cy="250" r="195" />
          <ellipse cx="280" cy="250" rx="130" ry="195" />
          <ellipse cx="280" cy="250" rx="58" ry="195" />
          <ellipse cx="280" cy="250" rx="195" ry="65" />
          <ellipse cx="280" cy="250" rx="195" ry="130" />
          <path d="M85 250H475M280 55V445" />
          <circle cx="280" cy="250" r="218" strokeDasharray="2 9" opacity=".5" />
        </g>
        <g fill="none" stroke="#af853d" strokeWidth="1.4">
          <path d="M390 208Q248 41 150 205M390 208Q330 77 273 153M390 208Q461 275 335 330" />
        </g>
        <g fill="#0b2742">
          <circle cx="150" cy="205" r="4" />
          <circle cx="273" cy="153" r="4" />
          <circle cx="335" cy="330" r="4" />
        </g>
        <circle cx="390" cy="208" r="17" fill="#c99a3d" opacity=".12" />
        <circle cx="390" cy="208" r="6" fill="#a87927" />
        <g fill="#526071" fontFamily="Inter, sans-serif" fontSize="13" letterSpacing="2">
          <text x="58" y="186">
            NORTH AMERICA
          </text>
          <text x="250" y="135">
            EUROPE
          </text>
          <text x="350" y="352">
            ASIA
          </text>
          <text x="412" y="208" fill="#875d20" fontWeight="700">
            SEOUL
          </text>
          <text x="280" y="496" textAnchor="middle">
            GLOBAL NETWORK · SHARED EXPERTISE
          </text>
        </g>
      </svg>
      <figcaption>
        Expertise without borders.
        <br />
        <span>A shared commitment to better health.</span>
      </figcaption>
    </figure>
  )
}

const VALUES = [
  {
    title: 'GLOBAL NETWORK',
    text: 'Collaborate with experts across countries',
    path: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18ZM3 12h18M12 3c-6 6-6 12 0 18c6-6 6-12 0-18',
  },
  {
    title: 'KNOWLEDGE EXCHANGE',
    text: 'Share and grow expertise together',
    path: 'M12 6Q7 2 3 5v14q5-3 9 0q4-3 9 0V5q-4-3-9 1ZM12 6v13',
  },
  {
    title: 'REAL IMPACT',
    text: 'Contribute to a healthier global society',
    path: 'M9 18h6M9 21h6M9 15c0-2-4-3-4-7a7 7 0 0 1 14 0c0 4-4 5-4 7M12 6v5M10 9h4',
  },
  {
    title: 'DIVERSE OPPORTUNITIES',
    text: 'Engage in projects across K-Health sectors',
    path: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18ZM16 8l-2 6-6 2 2-6 6-2Z',
  },
]
function NetworkValues() {
  return (
    <section className="network-values" aria-label="The value of our network">
      <svg
        className="network-values__lines"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d={`M0 ${150 + i * 8}Q320 ${35 + i * 10} 700 ${160 + i * 6}T1440 ${80 + i * 8}`}
          />
        ))}
      </svg>
      <svg className="network-values__leaf" viewBox="0 0 150 230" aria-hidden="true">
        <path d="M145 230Q70 140 100 15M111 174Q36 175 14 119Q86 126 111 174ZM92 119Q136 87 133 42Q86 66 92 119ZM92 79Q40 68 47 24Q95 35 92 79ZM14 119L111 174M133 42L92 119M47 24L92 79" />
      </svg>
      <div className="container-site network-values__grid">
        {VALUES.map((v, i) => (
          <article key={v.title}>
            <div className="network-values__icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={v.path} />
              </svg>
              <span>0{i + 1}</span>
            </div>
            <h3>{v.title}</h3>
            <p>{v.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
