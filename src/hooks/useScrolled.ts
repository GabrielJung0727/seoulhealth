import { useState, useEffect } from 'react'

/**
 * Detects whether the page has been scrolled past a threshold.
 * Used by the Header to switch from transparent to opaque background.
 *
 * @param threshold - scroll distance in px before triggering (default: 20)
 */
export function useScrolled(threshold = 20): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold)
    }

    // Check on mount in case page is already scrolled
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolled
}
