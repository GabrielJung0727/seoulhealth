import { useEffect } from 'react'
import { SITE_CONFIG } from '@/config/site'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? SITE_CONFIG.seo.titleTemplate.replace('%s', title)
      : SITE_CONFIG.seo.defaultTitle
  }, [title])
}
