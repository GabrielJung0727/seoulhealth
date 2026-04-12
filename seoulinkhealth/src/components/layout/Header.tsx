import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'
import { useScrolled } from '@/hooks/useScrolled'
import { useCompanyAuthStore } from '@/store/companyAuthStore'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrolled = useScrolled(50)
  const location = useLocation()
  const companyAuth = useCompanyAuthStore()

  const closeMobile = () => setMobileOpen(false)
  const isActive = (href: string) => location.pathname === href

  const isHome = location.pathname === '/'
  const transparent = isHome && !scrolled

  const isCompanyLoggedIn = companyAuth.isAuthenticated()

  return (
    <header
      role="banner"
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        transparent
          ? 'bg-transparent border-b border-white/10'
          : 'bg-brand-navy shadow-lg border-b border-brand-navy',
      ].join(' ')}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-brand-gold focus:text-brand-navy focus:rounded-lg focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>

      <nav aria-label="Main navigation" className="container-site flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <Link to="/" className="flex flex-col leading-none group shrink-0" onClick={closeMobile}>
          <span className="text-base lg:text-lg font-bold tracking-[0.1em] text-white">
            SEOUL<span className="text-brand-gold">LINK</span>HEALTH
          </span>
          <span className="text-[0.5rem] lg:text-[0.55rem] tracking-[0.25em] text-white/40 font-semibold uppercase mt-0.5">
            K-Health Business Platform
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-10">
          {SITE_CONFIG.navLinks.map((link) => (
            <li key={link.href}>
              <DesktopNavLink to={link.href} label={link.label} active={isActive(link.href)} />
            </li>
          ))}

          {/* Company Login / My Page */}
          <li>
            {isCompanyLoggedIn ? (
              <NavLink
                to="/company/dashboard"
                className={({ isActive: a }) =>
                  [
                    'flex items-center gap-2 px-5 py-2 text-xs font-bold tracking-[0.1em] uppercase border transition-all duration-300 rounded-sm',
                    a
                      ? 'bg-brand-gold text-brand-navy border-brand-gold'
                      : 'border-brand-gold/50 text-brand-gold hover:bg-brand-gold hover:text-brand-navy',
                  ].join(' ')
                }
              >
                <span>{companyAuth.company?.companyName ?? 'MY PAGE'}</span>
                {companyAuth.company?.contactPerson && (
                  <span className="opacity-60 font-normal normal-case">({companyAuth.company.contactPerson})</span>
                )}
              </NavLink>
            ) : (
              <NavLink
                to="/company/login"
                className={({ isActive: a }) =>
                  [
                    'px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border transition-all duration-300 rounded-sm',
                    a
                      ? 'bg-brand-gold text-brand-navy border-brand-gold'
                      : 'border-white/30 text-white hover:bg-white/10',
                  ].join(' ')
                }
              >
                LOGIN
              </NavLink>
            )}
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex flex-col justify-center gap-[5px] p-2 w-10 h-10"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <motion.span className="block w-6 h-0.5 bg-white origin-center rounded-full"
            animate={mobileOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }} />
          <motion.span className="block w-6 h-0.5 bg-white rounded-full"
            animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.2 }} />
          <motion.span className="block w-6 h-0.5 bg-white origin-center rounded-full"
            animate={mobileOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }} />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden overflow-hidden bg-brand-navy border-t border-white/10"
          >
            <ul className="container-site py-5 flex flex-col gap-1">
              {SITE_CONFIG.navLinks.map((link, i) => (
                <motion.li key={link.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}>
                  <NavLink to={link.href} onClick={closeMobile}
                    className={({ isActive: a }) =>
                      ['block py-3 px-2 text-sm font-bold tracking-[0.15em] uppercase border-b border-white/10 transition-colors',
                       a ? 'text-brand-gold' : 'text-white/70 hover:text-white'].join(' ')
                    }>
                    {link.label}
                  </NavLink>
                </motion.li>
              ))}

              <motion.li initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: SITE_CONFIG.navLinks.length * 0.06, duration: 0.25 }}
                className="pt-3">
                {isCompanyLoggedIn ? (
                  <NavLink to="/company/dashboard" onClick={closeMobile}
                    className="inline-block w-full text-center py-2.5 px-5 text-xs font-bold tracking-[0.15em] uppercase border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition-all rounded-sm">
                    MY PAGE
                  </NavLink>
                ) : (
                  <div className="flex gap-2">
                    <NavLink to="/company/login" onClick={closeMobile}
                      className="flex-1 text-center py-2.5 px-5 text-xs font-bold tracking-[0.15em] uppercase border border-white/30 text-white hover:bg-white/10 transition-all rounded-sm">
                      LOGIN
                    </NavLink>
                    <NavLink to="/company/register" onClick={closeMobile}
                      className="flex-1 text-center py-2.5 px-5 text-xs font-bold tracking-[0.15em] uppercase bg-brand-gold text-brand-navy hover:bg-brand-gold/90 transition-all rounded-sm">
                      REGISTER
                    </NavLink>
                  </div>
                )}
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ─── Desktop Nav Link ──────────────────────────────────────────────────── */
function DesktopNavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <NavLink to={to} className="relative inline-flex flex-col items-center group"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      aria-current={active ? 'page' : undefined}>
      <span className={['text-[0.7rem] font-bold tracking-[0.18em] uppercase transition-colors duration-200',
        active ? 'text-brand-gold' : 'text-white/70 group-hover:text-white'].join(' ')}>
        {label}
      </span>
      <motion.span
        className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-brand-gold rounded-full origin-left"
        initial={false}
        animate={{ scaleX: active || hovered ? 1 : 0, opacity: active ? 1 : hovered ? 0.7 : 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      />
    </NavLink>
  )
}
