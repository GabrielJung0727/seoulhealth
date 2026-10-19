import { useCallback, useEffect, useRef, useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import './Process.css'

const COPY = [
  [
    'REQUEST INTAKE',
    "Confirmation and initial review of the client's submitted inquiry.",
    "Upon receipt of the client's inquiry, we conduct a preliminary review. The submitted information is thoroughly examined for accuracy and relevance.",
  ],
  [
    'IN-DEPTH CONSULTATION',
    'Detailed discussions to clarify scope, objectives, and expectations.',
    'We conduct in-depth discussions to establish a clear understanding of the project scope and align core objectives and desired outcomes.',
  ],
  [
    'PRIMARY EXPERT REVIEW',
    'Preliminary analysis conducted by relevant subject-matter experts.',
    'Relevant subject-matter experts perform a preliminary analysis based on their specialized knowledge and experience, ensuring an informed and accurate assessment.',
  ],
  [
    'SECONDARY EXPERT CONSULTATION',
    'In-depth evaluation and assessment by domain specialists.',
    'Domain specialists conduct a secondary consultation and practical evaluation, adding deeper insight and supporting a comprehensive understanding of the issue.',
  ],
  [
    'CLIENT STRATEGY DISCUSSION',
    'Collaborative discussion to validate and refine proposed solutions.',
    "We review the proposed solutions with the client, validate the direction and assumptions, and refine the strategy around the client's needs and objectives.",
  ],
  [
    'REVIEW & REFINEMENT',
    'Further enhancement and optimization of the solution.',
    'Based on the collaborative review, additional enhancements are identified and implemented to optimize the solution and achieve the best possible outcome.',
  ],
  [
    'FINAL REPORT DELIVERY',
    'Submission of a comprehensive advisory report.',
    "The completed report is delivered with findings, strategic recommendations, and practical implementation guidance tailored to the client's needs.",
  ],
]
const LABELS = [
  'REQUEST|INTAKE',
  'IN-DEPTH|CONSULTATION',
  'PRIMARY|EXPERT',
  'SECONDARY|EXPERT',
  'CLIENT|STRATEGY',
  'REVIEW &|REFINE',
  'FINAL|REPORT',
]
const IMAGE_DESCRIPTIONS = [
  'Inquiry documents and a navy portfolio on a professional desk',
  'Adviser and client discussing the scope of an engagement',
  'Specialist reviewing research and supporting documents',
  'Multidisciplinary experts evaluating a project together',
  'Client and adviser working through a strategic plan',
  'Hands reviewing and refining an advisory report',
  'A finished navy report folder being presented to a client',
]
const STEPS = COPY.map(([title, description, detail], index) => ({
  step: index + 1,
  title,
  description,
  detail,
  image: `/images/process/step-0${index + 1}.png`,
  imageAlt: IMAGE_DESCRIPTIONS[index],
}))
const initialStep = () => Number(location.hash.match(/^#step-([1-7])$/)?.[1] || 1)

export default function ProcessPage() {
  usePageTitle('Our Process')
  const [current, setCurrent] = useState(initialStep)
  const goTo = useCallback((value: number) => {
    if (value < 1 || value > 7) return
    setCurrent(value)
    history.replaceState(history.state, '', `#step-${value}`)
  }, [])
  useEffect(() => {
    const onHash = () => setCurrent(initialStep())
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement)?.closest('input,textarea,select,[contenteditable="true"]') ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey
      )
        return
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        goTo(current + (e.key === 'ArrowRight' ? 1 : -1))
      }
    }
    addEventListener('hashchange', onHash)
    addEventListener('popstate', onHash)
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('hashchange', onHash)
      removeEventListener('popstate', onHash)
      removeEventListener('keydown', onKey)
    }
  }, [current, goTo])
  const active = STEPS[current - 1]
  return (
    <div className="process-page">
      <ProcessIntro />
      <WorkflowBand />
      <section className="process-workflow">
        <ProcessStepper current={current} goTo={goTo} />
        <ProcessDecoration />
        <div className="process-stage">
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            Step {current} of 7: {active.title}
          </div>
          <ProcessDetailCard active={active} goTo={goTo} />
          <ProcessControls current={current} goTo={goTo} />
        </div>
      </section>
    </div>
  )
}

function ProcessHeroVisual() {
  return (
    <div className="process-hero-visual" aria-hidden="true">
      <img src="/images/seoulinkhealth-hero.png" alt="" />
      <svg viewBox="0 0 500 400" preserveAspectRatio="none">
        <path d="M170 420 Q230 5 500 5" />
      </svg>
    </div>
  )
}

function ProcessIntro() {
  return (
    <section className="process-intro">
      <ProcessHeroVisual />
      <div className="container-site process-intro__inner">
        <div>
          <span className="process-eyebrow">OUR PROCESS</span>
          <h1>How We Work</h1>
          <i />
          <p>
            Our solutions platform directs you to top-tier experts in the fields of K-HEALTH CARE,
            K-HEALTH INDUSTRY, K-BIO, K-HEALTH FOOD, and K-BEAUTY.
          </p>
          <p>
            Through a structured systematic advisory framework, our experts deliver practical and
            globally competitive solutions tailored to your specific needs.
          </p>
        </div>
        <aside className="process-intro__aside">
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
          <i />
          <div className="process-intro__mark">
            <span>7</span>
            <small>
              CONNECTED
              <br />
              STAGES
            </small>
          </div>
        </aside>
      </div>
      <svg
        className="process-divider"
        viewBox="0 0 1440 65"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="#d4b576" opacity=".7" d="M0 12 Q220 90 510 41 T980 37 Q1190 85 1440 12V65H0Z" />
        <path fill="#faf9f6" d="M0 36 Q170 75 350 48 T780 48 Q1100 85 1440 28V65H0Z" />
      </svg>
    </section>
  )
}

function WorkflowBand() {
  return (
    <div className="process-bridge">
      <span>SMART SUPPORT SYSTEM FOR INNOVATIVE PROBLEM SOLVING</span>
      <b>PROCESS WORKFLOW</b>
    </div>
  )
}

type NavigationProps = { current: number; goTo: (step: number) => void }
function ProcessStepper({ current, goTo }: NavigationProps) {
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const nav = navRef.current
    const button = nav?.querySelector<HTMLElement>('[aria-current="step"]')
    if (!nav || !button || nav.scrollWidth <= nav.clientWidth) return
    const navRect = nav.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    // Only move the horizontal rail; keep the user's vertical reading position.
    nav.scrollLeft += buttonRect.left - navRect.left - (nav.clientWidth - buttonRect.width) / 2
  }, [current])
  return (
    <nav ref={navRef} className="process-stepper" aria-label="Process steps">
      <div className="process-stepper__line" aria-hidden="true" />
      {STEPS.map((step, index) => (
        <button
          key={step.step}
          onClick={() => goTo(step.step)}
          aria-label={`Step ${step.step}: ${step.title}`}
          aria-current={current === step.step ? 'step' : undefined}
          className={current === step.step ? 'active' : ''}
        >
          <span className="process-stepper__number">{step.step}</span>
          <span className="process-stepper__label">
            {LABELS[index].split('|').map((x) => (
              <span key={x}>{x}</span>
            ))}
          </span>
        </button>
      ))}
    </nav>
  )
}

function ProcessDetailCard({
  active,
  goTo,
}: {
  active: (typeof STEPS)[number]
  goTo: (step: number) => void
}) {
  const current = active.step
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  return (
    <article
      className="process-card"
      aria-labelledby={`process-title-${current}`}
      onTouchStart={(event) => {
        const touch = event.touches[0]
        touchStart.current = event.touches.length === 1 && window.matchMedia('(max-width: 767px)').matches
          ? { x: touch.clientX, y: touch.clientY, time: Date.now() }
          : null
      }}
      onTouchMove={(event) => {
        const start = touchStart.current
        if (!start) return
        const touch = event.touches[0]
        // A vertical scroll or pinch must never turn a page.
        if (event.touches.length !== 1 || Math.abs(touch.clientY - start.y) > 40) {
          touchStart.current = null
        }
      }}
      onTouchCancel={() => { touchStart.current = null }}
      onTouchEnd={(event) => {
        const start = touchStart.current
        touchStart.current = null
        if (!start || event.touches.length || !event.changedTouches[0]) return
        const touch = event.changedTouches[0]
        const dx = touch.clientX - start.x
        const dy = touch.clientY - start.y
        if (Date.now() - start.time < 900 && Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          goTo(current + (dx < 0 ? 1 : -1))
        }
      }}
    >
      <aside className="process-card__identity">
        <div>{String(current).padStart(2, '0')}</div>
        <i />
        <span>
          {LABELS[current - 1].split('|').map((x) => (
            <small key={x}>{x}</small>
          ))}
        </span>
      </aside>
      <div className="process-card__content-stack">
      {STEPS.map((step) => <div key={step.step} className="process-card__copy" aria-hidden={step.step !== current} style={{ visibility: step.step === current ? 'visible' : 'hidden' }}>
        <span>STEP {step.step} OF 7</span>
        <h2 id={`process-title-${step.step}`}>{step.title}</h2>
        <i aria-hidden="true" />
        <h3>{step.description}</h3>
        <p>{step.detail}</p>
      </div>)}
      </div>
      <figure className="process-card__visual">
        {STEPS.map((step) => <img key={step.step} src={step.image} alt={step.step === current ? step.imageAlt : ''} aria-hidden={step.step !== current} draggable={false} style={{ visibility: step.step === current ? 'visible' : 'hidden' }} />)}
      </figure>
    </article>
  )
}

function ProcessControls({ current, goTo }: NavigationProps) {
  return (
    <>
      <p className="process-swipehint">Swipe left or right, or use the buttons below</p>
      <div className="process-controls">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 1}
          aria-label="Previous step"
        >
          <span className="process-arrow" aria-hidden="true">
            ‹
          </span>
          <span>Previous</span>
        </button>
        <div className="process-controls__segments">
          {STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => goTo(s.step)}
              className={s.step === current ? 'active' : s.step < current ? 'done' : ''}
              aria-current={s.step === current ? 'step' : undefined}
              aria-label={`Go to step ${s.step}`}
            />
          ))}
        </div>
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === 7}
          aria-label={current === 7 ? 'Process completed' : 'Next step'}
        >
          <span>{current === 7 ? 'Completed' : 'Next'}</span>
          <span className="process-arrow" aria-hidden="true">
            ›
          </span>
        </button>
      </div>
      <p className="process-keyhint">
        <svg
          width="19"
          height="14"
          viewBox="0 0 24 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          aria-hidden="true"
        >
          <rect x="1" y="1" width="22" height="16" rx="3" />
          <path d="M5 5h2m2 0h2m2 0h2m2 0h2M5 8h2m2 0h2m2 0h2m2 0h2M6 12h12" />
        </svg>
        Use keyboard arrow keys to navigate steps
      </p>
    </>
  )
}

function ProcessDecoration() {
  return (
    <div className="process-decoration" aria-hidden="true">
      <svg className="process-contours" viewBox="0 0 1440 240" preserveAspectRatio="none">
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            d={`M-50 ${170 + i * 7} Q190 ${10 + i * 8} 440 ${155 + i * 5} T950 ${155 + i * 5} T1500 ${90 + i * 9}`}
          />
        ))}
      </svg>
      <svg className="process-leaf" viewBox="0 0 180 300">
        <path d="M174 300Q119 216 124 35M143 247Q40 251 18 190Q92 176 143 247ZM128 205Q164 170 172 119Q117 135 128 205ZM125 155Q61 150 43 89Q104 100 125 155ZM126 107Q157 53 138 10Q106 55 126 107Z" />
        <path d="M18 190L143 247M43 89L125 155M172 119L128 205M138 10L126 107M42 194L117 235M57 201L121 237M65 109L118 148M153 151L131 191" />
      </svg>
    </div>
  )
}
