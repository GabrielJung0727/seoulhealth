import { useEffect } from 'react'
import { SITE_CONFIG } from '@/config/site'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? SITE_CONFIG.seo.titleTemplate.replace('%s', title)
      : SITE_CONFIG.seo.defaultTitle

    // Point every copy of the page (e.g. the run.app URL) at the primary domain
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) canonical.href = `${SITE_CONFIG.website}${window.location.pathname}`
  }, [title])
}
