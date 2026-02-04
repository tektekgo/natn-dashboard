/// <reference types="vite/client" />

// Build-time constants injected by Vite define
declare const __APP_VERSION__: string
declare const __BUILD_NUMBER__: string
declare const __BUILD_TIME__: string

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
