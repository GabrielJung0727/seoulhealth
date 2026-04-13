import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SITE_CONFIG } from '@/config/site'

/**
 * SEOULINKHEALTH — Top Navigation Bar
 * - Desktop: horizontal nav links
 * - Mobile: hamburger menu
 * - Login item: shown only when SITE_CONFIG.loginEnabled is true
 */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-200',
      isActive
        ? 'text-brand-gold border-b border-brand-gold pb-0.5'
        : 'text-brand-navy hover:text-brand-teal',
    ].join(' ')

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brand-border shadow-sm">
      <nav className="container-site flex items-center justify-between h-16 lg:h-20">
        {/* ── Brand ── */}
        <Link
          to="/"
          className="flex flex-col leading-none group"
          aria-label="SEOULINKHEALTH Home"
        >
          <span className="text-base lg:text-lg font-bold tracking-[0.1em] text-brand-navy group-hover:text-brand-teal transition-colors duration-200">
            SEOUL<span className="text-brand-gold">INK</span>HEALTH
          </span>
          <span className="text-[0.55rem] lg:text-[0.6rem] tracking-[0.25em] text-brand-gold font-semibold uppercase mt-0.5">
            K-HEALTH BUSINESS PLATFORM
          </span>
        </Link>

        {/* ── Desktop Navigation ── */}
        <ul className="hidden lg:flex items-center gap-8">
          {SITE_CONFIG.navLinks.map((link) => (
            <li key={link.href}>
              <NavLink to={link.href} className={navLinkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}

          {SITE_CONFIG.loginEnabled && (
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  [
                    'px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase border rounded transition-all duration-200',
                    isActive
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white',
                  ].join(' ')
                }
              >
                LOGIN
              </NavLink>
            </li>
          )}
        </ul>

        {/* ── Mobile Hamburger ── */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2 group"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span
            className={`block w-6 h-0.5 bg-brand-navy transition-all duration-300 ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`block w-6 h-0.5 bg-brand-navy transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block w-6 h-0.5 bg-brand-navy transition-all duration-300 ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </nav>

      {/* ── Mobile Dropdown ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-brand-border bg-white animate-slide-down">
          <ul className="container-site py-4 flex flex-col gap-4">
            {SITE_CONFIG.navLinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  className={navLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {SITE_CONFIG.loginEnabled && (
              <li>
                <NavLink
                  to="/login"
                  className="text-xs font-semibold tracking-[0.15em] uppercase text-brand-navy"
                  onClick={() => setMobileOpen(false)}
                >
                  LOGIN
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}
