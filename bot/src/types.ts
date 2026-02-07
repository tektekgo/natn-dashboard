/**
 * Shared types for the trading bot.
 * Mirrors the dashboard engine types for compatibility.
 */

// ---------------------------------------------------------------------------
// Market Data
// ---------------------------------------------------------------------------

export interface OHLCV {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface FundamentalData {
  symbol: string
  peRatio: number | null
  eps: number | null
  epsGrowth: number | null
  beta: number | null
  dividendYield: number | null
  marketCap: number | null
  reportDate: string
}

export interface SentimentData {
  symbol: string
  score: number        // 0-100 normalized (50 = neutral)
  rawScore: number     // -1 to +1
  label: 'bullish' | 'bearish' | 'neutral'
  articleCount: number
  fetchedAt: string
}

// ---------------------------------------------------------------------------
// Strategy Config (matches dashboard FullStrategyConfig)
// ---------------------------------------------------------------------------

export interface TechnicalConfig {
  rsiPeriod: number
  rsiOverbought: number
  rsiOversold: number
  smaShortPeriod: number
  smaLongPeriod: number
  smaTrendPeriod: number
}

export interface FundamentalConfig {
  peRatioMax: number
  peRatioMin: number
  epsGrowthMin: number
  betaMax: number
  dividendYieldMin: number
  marketCapMin: number
}

export interface SentimentConfig {
  enabled: boolean
  newsScoreThreshold: number
  socialScoreThreshold: number
}

export interface RiskConfig {
  takeProfitPercent: number
  stopLossPercent: number
  maxPositionSizePercent: number
  maxOpenPositions: number
  maxPortfolioRiskPercent: number
}

export interface SignalWeights {
  technical: number
  fundamental: number
  sentiment: number
}

export interface FullStrategyConfig {
  name: string
  description: string
  symbols: string[]
  technical: TechnicalConfig
  fundamental: FundamentalConfig
  sentiment: SentimentConfig
  risk: RiskConfig
  weights: SignalWeights
  initialCapital: number
}

// ---------------------------------------------------------------------------
// Signal Results
// ---------------------------------------------------------------------------

export type SignalAction = 'buy' | 'sell' | 'hold'

export interface TechnicalSignalResult {
  action: SignalAction
  score: number
  rsiValue: number
  smaShort: number
  smaLong: number
  smaTrend: number
  currentPrice: number
  reasons: string[]
}

export interface FundamentalSignalResult {
  action: SignalAction
  score: number
  peRatio: number | null
  eps: number | null
  epsGrowth: number | null
  beta: number | null
  reasons: string[]
}

export interface SentimentSignalResult {
  action: SignalAction
  score: number
  sentimentLabel: 'bullish' | 'bearish' | 'neutral'
  articleCount: number
  reasons: string[]
}

export interface CombinedSignal {
  action: SignalAction
  totalScore: number
  technicalScore: number
  fundamentalScore: number
  technicalWeight: number
  fundamentalWeight: number
  technicalAction: SignalAction
  fundamentalAction: SignalAction
  reasons: string[]
  vetoed: boolean
  vetoReason?: string
}

// ---------------------------------------------------------------------------
// Alpaca API Types
// ---------------------------------------------------------------------------

export interface AlpacaAccount {
  id: string
  equity: string
  portfolio_value: string
  cash: string
  buying_power: string
  last_equity: string
  status: string
}

export interface AlpacaPosition {
  symbol: string
  qty: string
  market_value: string
  unrealized_pl: string
  unrealized_plpc: string
  avg_entry_price: string
  current_price: string
  side: string
}

export interface AlpacaOrder {
  id: string
  symbol: string
  qty: string
  side: string
  type: string
  status: string
  filled_at: string | null
  filled_avg_price: string | null
  created_at: string
}

export interface AlpacaBar {
  t: string
  o: number
  h: number
  l: number
  c: number
  v: number
  n: number
  vw: number
}

// ---------------------------------------------------------------------------
// Bot Execution (matches Supabase schema)
// ---------------------------------------------------------------------------

export type ExecutionStatus = 'running' | 'success' | 'error' | 'halted'
export type DetailAction = 'buy' | 'sell_tp' | 'sell_sl' | 'skip' | 'error'

export interface RiskCheckResult {
  dailyTrades: number
  dailyTradeLimit: number
  dailyTradeLimitOk: boolean
  dailyPlPercent: number
  dailyLossLimitPercent: number
  dailyLossLimitOk: boolean
  totalExposure: number
  maxExposure: number
  exposureLimitOk: boolean
  allChecksPassed: boolean
}

export interface SymbolResult {
  symbol: string
  action: DetailAction
  signals: {
    technical?: TechnicalSignalResult
    fundamental?: FundamentalSignalResult
    sentiment?: SentimentSignalResult
    combined?: CombinedSignal
  }
  combinedScore: number | null
  outcome: string | null
  orderId: string | null
  price: number | null
  quantity: number | null
  reason: string
}

// ---------------------------------------------------------------------------
// Strategy from Supabase
// ---------------------------------------------------------------------------

export interface StrategyRow {
  id: string
  user_id: string
  name: string
  config: FullStrategyConfig
  trading_mode: 'none' | 'paper' | 'live'
}
