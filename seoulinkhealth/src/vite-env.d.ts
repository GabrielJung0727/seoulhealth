/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMPANY_EMAIL: string
  readonly VITE_DIRECTOR_NAME: string
  readonly VITE_WEBSITE: string
  readonly VITE_LOGIN_ENABLED: string
  readonly VITE_AD_BANNER_ENABLED: string
  readonly VITE_AD_BANNER_LABEL?: string
  readonly VITE_AD_BANNER_MESSAGE?: string
  readonly VITE_AD_BANNER_HREF?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
