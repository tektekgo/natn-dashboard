/**
 * CSV export utility for backtest results.
 * Exports metrics summary and trade data to downloadable CSV.
 */

import type { BacktestMetrics, ClosedTrade } from '@/engine/types'

/**
 * Escape a value for CSV format (handle commas, quotes, newlines)
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Format a number with specified decimal places
 */
function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

/**
 * Export backtest results to CSV and trigger browser download
 */
export function exportBacktestCsv(
  strategyName: string,
  metrics: BacktestMetrics,
  trades: ClosedTrade[],
  startDate: string,
  endDate: string
): void {
  const rows: string[] = []

  // -------------------------------------------------------------------------
  // Section 1: Metrics Summary
  // -------------------------------------------------------------------------
  rows.push('=== BACKTEST SUMMARY ===')
  rows.push('')
  rows.push(`Strategy,${escapeCSV(strategyName)}`)
  rows.push(`Period,${startDate} to ${endDate}`)
  rows.push(`Initial Capital,$${formatNumber(metrics.initialCapital, 2)}`)
  rows.push(`Final Capital,$${formatNumber(metrics.finalCapital, 2)}`)
  rows.push('')
  rows.push('=== PERFORMANCE METRICS ===')
  rows.push('')
  rows.push(`Total Return,${formatNumber(metrics.totalReturn, 2)}%`)
  rows.push(`Total Return ($),$${formatNumber(metrics.totalReturnDollar, 2)}`)
  rows.push(`Annualized Return,${formatNumber(metrics.annualizedReturn, 2)}%`)
  rows.push(`Sharpe Ratio,${formatNumber(metrics.sharpeRatio, 2)}`)
  rows.push(`Max Drawdown,${formatNumber(metrics.maxDrawdown, 2)}%`)
  rows.push(`Max Drawdown ($),$${formatNumber(metrics.maxDrawdownDollar, 2)}`)
  rows.push(`Profit Factor,${metrics.profitFactor === Infinity ? 'Infinity' : formatNumber(metrics.profitFactor, 2)}`)
  rows.push('')
  rows.push('=== TRADE STATISTICS ===')
  rows.push('')
  rows.push(`Total Trades,${metrics.totalTrades}`)
  rows.push(`Winning Trades,${metrics.winningTrades}`)
  rows.push(`Losing Trades,${metrics.losingTrades}`)
  rows.push(`Win Rate,${formatNumber(metrics.winRate, 1)}%`)
  rows.push(`Avg Win,+${formatNumber(metrics.avgWinPercent, 2)}%`)
  rows.push(`Avg Loss,${formatNumber(metrics.avgLossPercent, 2)}%`)
  rows.push(`Avg Holding Days,${formatNumber(metrics.avgHoldingDays, 1)}`)
  rows.push(`Best Trade,+${formatNumber(metrics.bestTrade, 2)}%`)
  rows.push(`Worst Trade,${formatNumber(metrics.worstTrade, 2)}%`)
  rows.push('')
  rows.push('')

  // -------------------------------------------------------------------------
  // Section 2: Trade Data
  // -------------------------------------------------------------------------
  rows.push('=== TRADE LOG ===')
  rows.push('')

  // Header row
  rows.push([
    'Symbol',
    'Entry Date',
    'Exit Date',
    'Entry Price',
    'Exit Price',
    'Quantity',
    'P&L ($)',
    'P&L (%)',
    'Holding Days',
    'Exit Reason',
  ].join(','))

  // Trade rows
  for (const trade of trades) {
    rows.push([
      escapeCSV(trade.symbol),
      escapeCSV(trade.entryDate),
      escapeCSV(trade.exitDate),
      formatNumber(trade.entryPrice, 2),
      formatNumber(trade.exitPrice, 2),
      String(trade.quantity),
      formatNumber(trade.pnl, 2),
      formatNumber(trade.pnlPercent, 2),
      String(trade.holdingDays),
      escapeCSV(trade.exitReason.replace('_', ' ')),
    ].join(','))
  }

  // -------------------------------------------------------------------------
  // Generate and download file
  // -------------------------------------------------------------------------
  const csvContent = rows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  // Generate filename with date
  const sanitizedName = strategyName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  const today = new Date().toISOString().split('T')[0]
  const filename = `backtest-${sanitizedName}-${today}.csv`

  // Create download link and trigger
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up blob URL
  URL.revokeObjectURL(url)
}
