/**
 * Bot configuration — loaded from environment variables.
 * Fails fast with clear error messages if required vars are missing.
 */

import 'dotenv/config'

function required(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing required env var: ${name}`)
  return val
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback
}

export const config = {
  // Supabase — service_role key bypasses RLS (bot writes execution logs)
  supabase: {
    url: required('SUPABASE_URL'),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  },

  // Alpaca — paper trading by default
  alpaca: {
    apiKey: required('ALPACA_API_KEY'),
    apiSecret: required('ALPACA_API_SECRET'),
    baseUrl: optional('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets'),
    dataUrl: 'https://data.alpaca.markets/v2',
  },

  // Data providers
  fmp: {
    apiKey: required('FMP_API_KEY'),
    baseUrl: 'https://financialmodelingprep.com/stable',
  },

  alphaVantage: {
    apiKey: required('ALPHAVANTAGE_API_KEY'),
    baseUrl: 'https://www.alphavantage.co/query',
  },

  // Telegram
  telegram: {
    botToken: optional('TELEGRAM_BOT_TOKEN', ''),
    chatId: optional('TELEGRAM_CHAT_ID', ''),
    get enabled() {
      return Boolean(this.botToken && this.chatId)
    },
  },

  // Bot behavior
  dryRun: optional('DRY_RUN', 'false') === 'true',
  userId: optional('USER_ID', ''),

  // Execution context (set by GitHub Actions workflow, defaults for local runs)
  botEnv: optional('BOT_ENV', 'development') as 'development' | 'production',
  botTrigger: optional('BOT_TRIGGER', 'local') as 'local' | 'cron' | 'manual',
} as const
