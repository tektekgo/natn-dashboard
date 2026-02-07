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
