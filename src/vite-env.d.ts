/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMPANY_EMAIL: string
  readonly VITE_DIRECTOR_NAME: string
  readonly VITE_WEBSITE: string
  readonly VITE_LOGIN_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
