/**
 * Types for bot execution logging (INT-3).
 */

export type ExecutionStatus = 'running' | 'success' | 'error' | 'halted'
export type DetailAction = 'buy' | 'sell_tp' | 'sell_sl' | 'skip' | 'error'

export interface BotExecution {
  id: string
  strategy_id: string
  user_id: string
  executed_at: string
  completed_at: string | null
  status: ExecutionStatus
  risk_checks: Record<string, unknown>
  symbols_processed: number
  orders_placed: number
  orders_skipped: number
  error_message: string | null
  created_at: string
}

export interface BotExecutionDetail {
  id: string
  execution_id: string
  symbol: string
  action: DetailAction
  signals: Record<string, unknown>
  combined_score: number | null
  outcome: string | null
  order_id: string | null
  price: number | null
  quantity: number | null
  reason: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Parsed types for visualization (C-2 upgrade)
// ---------------------------------------------------------------------------

export interface ParsedSignals {
  technical: { score: number; action: string; reasons: string[] } | null
  fundamental: { score: number; action: string; reasons: string[] } | null
  sentiment: { score: number; action: string; reasons: string[] } | null
  combined: { totalScore: number; action: string; reasons: string[] } | null
}

export interface ParsedRiskChecks {
  dailyTrades: { current: number; limit: number; ok: boolean }
  dailyPl: { percent: number; limit: number; ok: boolean }
  exposure: { current: number; max: number; ok: boolean }
  allPassed: boolean
}

export interface EnhancedStats {
  totalRuns: number
  totalOrders: number
  successRate: number
  avgDurationMs: number
}

export interface TrendDataPoint {
  date: string
  success: number
  error: number
  halted: number
  running: number
  orders: number
}

export interface ActionDistribution {
  action: DetailAction
  count: number
  color: string
}
