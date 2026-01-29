/**
 * Application constants - API URLs, default values, configuration.
 */

// -----------------------------------------------------------------------------
// App Version — update this when releasing
// -----------------------------------------------------------------------------

export const APP_VERSION = '0.1.0'

// -----------------------------------------------------------------------------
// API Base URLs
// -----------------------------------------------------------------------------

export const ALPACA_DATA_BASE_URL = 'https://data.alpaca.markets/v2'
export const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3'
export const ALPHAVANTAGE_BASE_URL = 'https://www.alphavantage.co/query'

// -----------------------------------------------------------------------------
// Default Configuration Values
// -----------------------------------------------------------------------------

export const DEFAULT_TIMEFRAME = '1Day'
export const DEFAULT_INITIAL_CAPITAL = 100_000
export const RISK_FREE_RATE = 0.05  // 5% annual risk-free rate for Sharpe calculation
export const TRADING_DAYS_PER_YEAR = 252

// -----------------------------------------------------------------------------
// Cache Settings
// -----------------------------------------------------------------------------

export const FUNDAMENTAL_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000  // 7 days
export const PRICE_CACHE_STALENESS_DAYS = 1  // Re-fetch if last day cached is older than this

// -----------------------------------------------------------------------------
// API Pagination
// -----------------------------------------------------------------------------

export const ALPACA_MAX_BARS_PER_REQUEST = 10_000

// -----------------------------------------------------------------------------
// Signal Thresholds (defaults from n8n workflow)
// -----------------------------------------------------------------------------

export const FUNDAMENTAL_BUY_SCORE_THRESHOLD = 50
export const COMBINED_BUY_SCORE_THRESHOLD = 50
export const MAJORITY_VOTE_THRESHOLD = 1  // At least 1 buy signal needed (out of 2 in backtest mode)
