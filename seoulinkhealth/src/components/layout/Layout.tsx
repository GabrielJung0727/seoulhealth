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
 *   <main>    (pt-16 lg:pt-20 to compensate for fixed header height)
 *     <Outlet />
 *   </main>
 *   <Footer />
 *
 * Scroll to top on route change.
 */
export default function Layout() {
  const { pathname } = useLocation()

  // Scroll to top whenever the route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/*
        pt-16 / pt-20 compensates for the fixed header height:
        - Mobile:  h-16 = 4rem
        - Desktop: h-20 = 5rem
      */}
      <main id="main-content" className={`flex-1 ${pathname === '/' ? '' : 'pt-16 lg:pt-20'}`}>
        <Outlet />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  )
}
