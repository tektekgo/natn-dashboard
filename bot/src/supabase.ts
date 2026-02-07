/**
 * Supabase client — strategy reads + execution logging.
 * Uses service_role key (bypasses RLS) for write operations.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from './config.js'
import type { StrategyRow, ExecutionStatus, SymbolResult, RiskCheckResult } from './types.js'

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey)

// ---------------------------------------------------------------------------
// Strategy Reads
// ---------------------------------------------------------------------------

/** Fetch the first active strategy (trading_mode != 'none'). */
export async function getActiveStrategy(userId?: string): Promise<StrategyRow | null> {
  let query = supabase
    .from('strategies')
    .select('id, user_id, name, config, trading_mode')
    .neq('trading_mode', 'none')
    .limit(1)

  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) throw new Error(`Supabase getActiveStrategy: ${error.message}`)
  if (!data || data.length === 0) return null

  return data[0] as StrategyRow
}

// ---------------------------------------------------------------------------
// Execution Logging
// ---------------------------------------------------------------------------

/** Log execution start — returns execution ID. */
export async function logExecutionStart(strategyId: string, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('bot_executions')
    .insert({
      strategy_id: strategyId,
      user_id: userId,
      status: 'running' as ExecutionStatus,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Supabase logExecutionStart: ${error.message}`)
  return data.id
}

/** Log execution completion (success, error, or halted). */
export async function logExecutionEnd(
  executionId: string,
  status: ExecutionStatus,
  details: {
    symbolsProcessed?: number
    ordersPlaced?: number
    ordersSkipped?: number
    riskChecks?: RiskCheckResult
    errorMessage?: string
  }
): Promise<void> {
  const { error } = await supabase
    .from('bot_executions')
    .update({
      status,
      completed_at: new Date().toISOString(),
      symbols_processed: details.symbolsProcessed ?? 0,
      orders_placed: details.ordersPlaced ?? 0,
      orders_skipped: details.ordersSkipped ?? 0,
      risk_checks: details.riskChecks ?? {},
      error_message: details.errorMessage ?? null,
    })
    .eq('id', executionId)

  if (error) throw new Error(`Supabase logExecutionEnd: ${error.message}`)
}

/** Log per-symbol execution detail (C-2). */
export async function logSymbolDetail(executionId: string, result: SymbolResult): Promise<void> {
  const { error } = await supabase
    .from('bot_execution_details')
    .insert({
      execution_id: executionId,
      symbol: result.symbol,
      action: result.action,
      signals: result.signals,
      combined_score: result.combinedScore,
      outcome: result.outcome,
      order_id: result.orderId,
      price: result.price,
      quantity: result.quantity,
      reason: result.reason,
    })

  if (error) console.error(`  [DB] Failed to log detail for ${result.symbol}: ${error.message}`)
}

/** Batch log all symbol details for an execution. */
export async function logSymbolDetails(executionId: string, results: SymbolResult[]): Promise<void> {
  if (results.length === 0) return

  const rows = results.map(r => ({
    execution_id: executionId,
    symbol: r.symbol,
    action: r.action,
    signals: r.signals,
    combined_score: r.combinedScore,
    outcome: r.outcome,
    order_id: r.orderId,
    price: r.price,
    quantity: r.quantity,
    reason: r.reason,
  }))

  const { error } = await supabase.from('bot_execution_details').insert(rows)
  if (error) console.error(`  [DB] Failed to batch log details: ${error.message}`)
}
