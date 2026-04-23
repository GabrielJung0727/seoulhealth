import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'

/**
 * SEOULINKHEALTH — Main Header / Navigation Bar
 *
 * Features:
 * - Scroll detection: transparent → white + shadow
 * - Framer Motion hover underline animation (desktop)
 * - Framer Motion AnimatePresence slide-down mobile drawer
 * - Active link highlight via useLocation()
 * - Conditional LOGIN menu via SITE_CONFIG.loginEnabled
 */
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const closeMobile = () => setMobileOpen(false)

  const isActive = (href: string) => location.pathname === href

  return (
    <header
      role="banner"
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        'bg-brand-navy shadow-lg border-b border-brand-navy',
      ].join(' ')}
    >
      {/* Skip-to-content for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-brand-navy focus:text-white focus:rounded-lg focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>

      <nav aria-label="Main navigation" className="container-site flex items-center justify-between h-16 lg:h-20">
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link
          to="/"
          className="flex flex-col leading-none group shrink-0"
          aria-label="SEOULINKHEALTH — Home"
          onClick={closeMobile}
        >
          <motion.span
            className="text-sm sm:text-base lg:text-lg font-bold tracking-[0.06em] sm:tracking-[0.1em] transition-colors duration-300 text-white"
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            SEOU<span className="text-[#D4C4A8]">L</span><span className="text-brand-gold">INK</span>HEALTH
          </motion.span>
          <span className="text-[0.5rem] sm:text-[0.55rem] lg:text-[0.6rem] tracking-[0.18em] sm:tracking-[0.25em] text-brand-gold font-bold uppercase mt-0.5">
            K-HEALTH BUSINESS PLATFORM
          </span>
        </Link>

        {/* ── Desktop Navigation ───────────────────────────────────────────── */}
        <ul className="hidden lg:flex items-center gap-8" role="navigation">
          {SITE_CONFIG.navLinks.map((link) => (
            <li key={link.href}>
              <DesktopNavLink
                to={link.href}
                label={link.label}
                active={isActive(link.href)}
              />
            </li>
          ))}

          <li>
              <NavLink
                to="/company/login"
                className={({ isActive: a }) =>
                  [
                    'px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border transition-all duration-300 rounded-sm',
                    a
                      ? 'bg-brand-gold text-brand-navy border-brand-gold'
                      : 'border-white/60 text-white hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold',
                  ].join(' ')
                }
              >
                LOGIN
              </NavLink>
            </li>
        </ul>

        {/* ── Mobile Hamburger ─────────────────────────────────────────────── */}
        <button
          className="lg:hidden flex flex-col justify-center gap-[5px] p-2 w-10 h-10"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <motion.span
            className="block w-6 h-0.5 bg-white origin-center rounded-full"
            animate={mobileOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />
          <motion.span
            className="block w-6 h-0.5 bg-white rounded-full"
            animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-6 h-0.5 bg-white origin-center rounded-full"
            animate={mobileOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />
        </button>
      </nav>

      {/* ── Mobile Drawer ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden overflow-hidden bg-white border-t border-brand-border shadow-premium"
          >
            <ul className="container-site py-5 flex flex-col gap-1">
              {SITE_CONFIG.navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                >
                  <NavLink
                    to={link.href}
                    onClick={closeMobile}
                    className={({ isActive: a }) =>
                      [
                        'block py-3 px-2 text-sm font-bold tracking-[0.15em] uppercase border-b border-brand-border/50',
                        'transition-colors duration-200',
                        a ? 'text-brand-gold' : 'text-brand-navy hover:text-brand-gold',
                      ].join(' ')
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.li>
              ))}

              <motion.li
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: SITE_CONFIG.navLinks.length * 0.06,
                    duration: 0.25,
                  }}
                  className="pt-3"
                >
                  <NavLink
                    to="/company/login"
                    onClick={closeMobile}
                    className={({ isActive: a }) =>
                      [
                        'inline-block w-full text-center py-2.5 px-5 text-xs font-bold tracking-[0.15em] uppercase border transition-all duration-200 rounded-sm',
                        a
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white',
                      ].join(' ')
                    }
                  >
                    LOGIN
                  </NavLink>
                </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ─── Desktop Nav Link with Framer Motion hover underline ──────────────────── */
interface DesktopNavLinkProps {
  to: string
  label: string
  active: boolean
}

function DesktopNavLink({ to, label, active }: DesktopNavLinkProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <NavLink
      to={to}
      className="relative inline-flex flex-col items-center group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={[
          'text-[0.7rem] font-bold tracking-[0.15em] uppercase transition-colors duration-200',
          active ? 'text-brand-gold' : 'text-white/80 group-hover:text-brand-gold',
        ].join(' ')}
      >
        {label}
      </span>

      {/* Animated underline */}
      <motion.span
        className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-brand-gold rounded-full origin-left"
        initial={false}
        animate={{
          scaleX: active || hovered ? 1 : 0,
          opacity: active ? 1 : hovered ? 0.85 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      />
    </NavLink>
  )
}
