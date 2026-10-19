import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from '@/components/ui/ScrollToTop'

/**
 * Main layout wrapper — shared by all public pages.
 *
 * Structure:
 *   <Header /> (fixed, z-50)
 *   <main>    (pt-16 lg:pt-24 to compensate for fixed header height)
 *     <Outlet />
 *   </main>
 *   <Footer />
 *
 * Scroll to top on route change.
 */
export default function Layout() {
  const { pathname, hash } = useLocation()

  // On route change: scroll to the #hash target if present (e.g. /network#join),
  // otherwise scroll to top. The target renders with the page, so wait a frame.
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/*
        pt-16 / pt-24 compensates for the fixed header height
        (must match the h-16 / lg:h-24 nav in Header.tsx):
        - Mobile:  h-16 = 4rem
        - Desktop: h-24 = 6rem
      */}
      <main id="main-content" className="flex-1 pt-16 lg:pt-24">
        <Outlet />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  )
}
