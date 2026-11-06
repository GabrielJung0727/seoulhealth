import { Outlet, useLocation } from 'react-router-dom'
import { Suspense, useEffect } from 'react'
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
  // otherwise scroll to top. Pages load on demand, so keep checking for the
  // target for up to ~3s (180 frames) while the route chunk arrives.
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    const id = decodeURIComponent(hash.slice(1))
    let frame = 0
    let attempts = 0
    const findTarget = () => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' })
        return
      }
      if (attempts === 0) window.scrollTo({ top: 0, behavior: 'instant' })
      if (++attempts < 180) frame = requestAnimationFrame(findTarget)
    }
    frame = requestAnimationFrame(findTarget)
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
        {/* Keeps Header/Footer mounted while a route chunk loads */}
        <Suspense fallback={<div className="min-h-screen" />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  )
}
