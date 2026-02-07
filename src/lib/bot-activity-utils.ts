/**
 * Data transforms for Bot Activity page visualizations (C-2 upgrade).
 */

import type {
  BotExecution,
  BotExecutionDetail,
  DetailAction,
  ParsedSignals,
  ParsedRiskChecks,
  EnhancedStats,
  TrendDataPoint,
  ActionDistribution,
} from '@/types/bot-activity'

// ---------------------------------------------------------------------------
// Action color map
// ---------------------------------------------------------------------------

export const ACTION_COLORS: Record<DetailAction, string> = {
  buy: '#10b981',
  sell_tp: '#0ea5e9',
  sell_sl: '#f59e0b',
  skip: '#6b7280',
  error: '#ef4444',
}

export const ACTION_LABELS: Record<DetailAction, string> = {
  buy: 'Buy',
  sell_tp: 'Sell (TP)',
  sell_sl: 'Sell (SL)',
  skip: 'Skip',
  error: 'Error',
}

// ---------------------------------------------------------------------------
// Parse JSONB signals from bot_execution_details
// ---------------------------------------------------------------------------

export function parseSignals(raw: Record<string, unknown>): ParsedSignals {
  const result: ParsedSignals = {
    technical: null,
    fundamental: null,
    sentiment: null,
    combined: null,
  }

  if (!raw || typeof raw !== 'object') return result

  const tech = raw.technical as Record<string, unknown> | undefined
  if (tech && typeof tech.score === 'number') {
    result.technical = {
      score: tech.score as number,
      action: (tech.action as string) || 'hold',
      reasons: Array.isArray(tech.reasons) ? (tech.reasons as string[]) : [],
    }
  }

  const fund = raw.fundamental as Record<string, unknown> | undefined
  if (fund && typeof fund.score === 'number') {
    result.fundamental = {
      score: fund.score as number,
      action: (fund.action as string) || 'hold',
      reasons: Array.isArray(fund.reasons) ? (fund.reasons as string[]) : [],
    }
  }

  const sent = raw.sentiment as Record<string, unknown> | undefined
  if (sent && typeof sent.score === 'number') {
    result.sentiment = {
      score: sent.score as number,
      action: (sent.action as string) || 'hold',
      reasons: Array.isArray(sent.reasons) ? (sent.reasons as string[]) : [],
    }
  }

  const comb = raw.combined as Record<string, unknown> | undefined
  if (comb && typeof comb.totalScore === 'number') {
    result.combined = {
      totalScore: comb.totalScore as number,
      action: (comb.action as string) || 'hold',
      reasons: Array.isArray(comb.reasons) ? (comb.reasons as string[]) : [],
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Parse JSONB risk_checks from bot_executions
// ---------------------------------------------------------------------------

export function parseRiskChecks(raw: Record<string, unknown>): ParsedRiskChecks | null {
  if (!raw || typeof raw !== 'object') return null
  if (typeof raw.allChecksPassed !== 'boolean') return null

  return {
    dailyTrades: {
      current: (raw.dailyTrades as number) ?? 0,
      limit: (raw.dailyTradeLimit as number) ?? 0,
      ok: (raw.dailyTradeLimitOk as boolean) ?? true,
    },
    dailyPl: {
      percent: (raw.dailyPlPercent as number) ?? 0,
      limit: (raw.dailyLossLimitPercent as number) ?? 0,
      ok: (raw.dailyLossLimitOk as boolean) ?? true,
    },
    exposure: {
      current: (raw.totalExposure as number) ?? 0,
      max: (raw.maxExposure as number) ?? 0,
      ok: (raw.exposureLimitOk as boolean) ?? true,
    },
    allPassed: raw.allChecksPassed as boolean,
  }
}

// ---------------------------------------------------------------------------
// Compute enhanced stats
// ---------------------------------------------------------------------------

export function computeStats(executions: BotExecution[]): EnhancedStats {
  const totalRuns = executions.length
  const totalOrders = executions.reduce((sum, e) => sum + e.orders_placed, 0)
  const successCount = executions.filter(e => e.status === 'success').length
  const successRate = totalRuns > 0 ? Math.round((successCount / totalRuns) * 100) : 0

  const durations = executions
    .filter(e => e.completed_at)
    .map(e => new Date(e.completed_at!).getTime() - new Date(e.executed_at).getTime())
    .filter(d => d > 0)

  const avgDurationMs = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  return { totalRuns, totalOrders, successRate, avgDurationMs }
}

export function formatDurationMs(ms: number): string {
  if (ms <= 0) return '—'
  if (ms < 1000) return '<1s'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
}

// ---------------------------------------------------------------------------
// Group executions by date for trend chart
// ---------------------------------------------------------------------------

export function groupByDate(executions: BotExecution[]): TrendDataPoint[] {
  const map = new Map<string, TrendDataPoint>()

  for (const exec of executions) {
    const date = exec.executed_at.substring(0, 10) // YYYY-MM-DD
    if (!map.has(date)) {
      map.set(date, { date, success: 0, error: 0, halted: 0, running: 0, orders: 0 })
    }
    const point = map.get(date)!
    const status = exec.status as keyof Pick<TrendDataPoint, 'success' | 'error' | 'halted' | 'running'>
    if (status in point) {
      point[status] += 1
    }
    point.orders += exec.orders_placed
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
}

// ---------------------------------------------------------------------------
// Aggregate detail actions for donut chart
// ---------------------------------------------------------------------------

export function aggregateActions(details: BotExecutionDetail[]): ActionDistribution[] {
  const counts = new Map<DetailAction, number>()
  for (const d of details) {
    counts.set(d.action, (counts.get(d.action) || 0) + 1)
  }

  return Array.from(counts.entries()).map(([action, count]) => ({
    action,
    count,
    color: ACTION_COLORS[action],
  }))
}
