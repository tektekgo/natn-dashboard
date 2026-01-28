/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_ENV: 'development' | 'production'
  readonly VITE_ALPACA_API_KEY: string
  readonly VITE_ALPACA_API_SECRET: string
  readonly VITE_FMP_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
