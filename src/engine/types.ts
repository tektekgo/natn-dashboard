/**
 * Core engine types for backtesting computation.
 * NO React or Supabase imports allowed in this file.
 */

// -----------------------------------------------------------------------------
// Market Data
// -----------------------------------------------------------------------------

export interface OHLCV {
  date: string       // YYYY-MM-DD
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
  reportDate: string  // YYYY-MM-DD: when this data was reported/available
}

// -----------------------------------------------------------------------------
// Signal Results
// -----------------------------------------------------------------------------

export type SignalAction = 'buy' | 'sell' | 'hold'

export interface TechnicalSignalResult {
  action: SignalAction
  score: number       // 0-100
  rsiValue: number
  smaShort: number
  smaLong: number
  smaTrend: number
  currentPrice: number
  reasons: string[]
}

export interface FundamentalSignalResult {
  action: SignalAction
  score: number       // 0-100
  peRatio: number | null
  eps: number | null
  epsGrowth: number | null
  beta: number | null
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

// -----------------------------------------------------------------------------
// Positions & Trades
// -----------------------------------------------------------------------------

export interface Position {
  id: string
  symbol: string
  entryDate: string
  entryPrice: number
  quantity: number
  side: 'long'
  signalAtEntry: CombinedSignal
}

export interface ClosedTrade {
  id: string
  symbol: string
  entryDate: string
  entryPrice: number
  exitDate: string
  exitPrice: number
  quantity: number
  side: 'long'
  pnl: number
  pnlPercent: number
  holdingDays: number
  exitReason: 'take_profit' | 'stop_loss' | 'signal_sell' | 'end_of_period'
  signalAtEntry: CombinedSignal
}

// -----------------------------------------------------------------------------
// Portfolio Snapshots
// -----------------------------------------------------------------------------

export interface PortfolioSnapshot {
  date: string
  equity: number           // cash + unrealized positions value
  cash: number
  positionsValue: number
  openPositionCount: number
}

// -----------------------------------------------------------------------------
// Metrics
// -----------------------------------------------------------------------------

export interface BacktestMetrics {
  totalReturn: number           // percentage
  totalReturnDollar: number     // absolute dollar return
  annualizedReturn: number      // percentage
  maxDrawdown: number           // percentage (negative)
  maxDrawdownDollar: number     // absolute dollar drawdown
  sharpeRatio: number           // annualized
  profitFactor: number          // gross profits / gross losses
  winRate: number               // percentage of winning trades
  totalTrades: number
  winningTrades: number
  losingTrades: number
  avgWinPercent: number
  avgLossPercent: number
  avgHoldingDays: number
  bestTrade: number             // percentage
  worstTrade: number            // percentage
  initialCapital: number
  finalCapital: number
}

// -----------------------------------------------------------------------------
// Signal Attribution (Phase 4C)
// -----------------------------------------------------------------------------

export interface SignalAttribution {
  signalType: 'technical' | 'fundamental'
  totalSignals: number
  buySignals: number
  sellSignals: number
  accurateBuySignals: number    // buy signals that resulted in profitable trades
  buyAccuracy: number           // percentage
  avgScoreOnWin: number
  avgScoreOnLoss: number
}

// -----------------------------------------------------------------------------
// Backtest Output
// -----------------------------------------------------------------------------

export interface BacktestOutput {
  config: import('../types/strategy-config').FullStrategyConfig
  startDate: string
  endDate: string
  metrics: BacktestMetrics
  trades: ClosedTrade[]
  equityCurve: PortfolioSnapshot[]
  attribution: SignalAttribution[]
  runTimestamp: string
}

// -----------------------------------------------------------------------------
// Comparison
// -----------------------------------------------------------------------------

export interface ComparisonResult {
  label: string
  output: BacktestOutput
}

// -----------------------------------------------------------------------------
// Progress Callback
// -----------------------------------------------------------------------------

export interface BacktestProgress {
  phase: 'fetching_prices' | 'fetching_fundamentals' | 'simulating' | 'calculating_metrics' | 'complete'
  current: number
  total: number
  message: string
}

export type ProgressCallback = (progress: BacktestProgress) => void
