/**
 * Backtest metrics calculator.
 * Computes win rate, returns, drawdown, Sharpe ratio, profit factor, etc.
 */

import type { ClosedTrade, PortfolioSnapshot, BacktestMetrics } from '../types'
import { RISK_FREE_RATE, TRADING_DAYS_PER_YEAR } from '../../lib/constants'

/**
 * Calculate comprehensive backtest metrics from trades and equity curve.
 */
export function calculateMetrics(
  trades: ClosedTrade[],
  equityCurve: PortfolioSnapshot[],
  initialCapital: number
): BacktestMetrics {
  const finalCapital = equityCurve.length > 0
    ? equityCurve[equityCurve.length - 1].equity
    : initialCapital

  const totalReturnDollar = finalCapital - initialCapital
  const totalReturn = (totalReturnDollar / initialCapital) * 100

  // Annualized return
  const tradingDays = equityCurve.length
  const years = tradingDays / TRADING_DAYS_PER_YEAR
  const annualizedReturn = years > 0
    ? (Math.pow(finalCapital / initialCapital, 1 / years) - 1) * 100
    : 0

  // Win/loss analysis
  const winningTrades = trades.filter(t => t.pnl > 0)
  const losingTrades = trades.filter(t => t.pnl <= 0)
  const totalTrades = trades.length
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0

  const avgWinPercent = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / winningTrades.length
    : 0

  const avgLossPercent = losingTrades.length > 0
    ? losingTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / losingTrades.length
    : 0

  const avgHoldingDays = totalTrades > 0
    ? trades.reduce((sum, t) => sum + t.holdingDays, 0) / totalTrades
    : 0

  // Profit factor: gross profits / gross losses
  const grossProfits = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
  const grossLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))
  const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : grossProfits > 0 ? Infinity : 0

  // Max drawdown
  const { maxDrawdown, maxDrawdownDollar } = calculateMaxDrawdown(equityCurve)

  // Sharpe ratio (annualized)
  const sharpeRatio = calculateSharpeRatio(equityCurve)

  // Best and worst trades
  const bestTrade = totalTrades > 0
    ? Math.max(...trades.map(t => t.pnlPercent))
    : 0
  const worstTrade = totalTrades > 0
    ? Math.min(...trades.map(t => t.pnlPercent))
    : 0

  return {
    totalReturn,
    totalReturnDollar,
    annualizedReturn,
    maxDrawdown,
    maxDrawdownDollar,
    sharpeRatio,
    profitFactor,
    winRate,
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    avgWinPercent,
    avgLossPercent,
    avgHoldingDays,
    bestTrade,
    worstTrade,
    initialCapital,
    finalCapital,
  }
}

/**
 * Calculate maximum drawdown from equity curve.
 * Returns both percentage and dollar drawdown.
 */
function calculateMaxDrawdown(
  equityCurve: PortfolioSnapshot[]
): { maxDrawdown: number; maxDrawdownDollar: number } {
  if (equityCurve.length === 0) {
    return { maxDrawdown: 0, maxDrawdownDollar: 0 }
  }

  let peak = equityCurve[0].equity
  let maxDrawdown = 0
  let maxDrawdownDollar = 0

  for (const snapshot of equityCurve) {
    if (snapshot.equity > peak) {
      peak = snapshot.equity
    }

    const drawdownDollar = peak - snapshot.equity
    const drawdownPercent = peak > 0 ? (drawdownDollar / peak) * 100 : 0

    if (drawdownPercent > maxDrawdown) {
      maxDrawdown = drawdownPercent
      maxDrawdownDollar = drawdownDollar
    }
  }

  return { maxDrawdown: -maxDrawdown, maxDrawdownDollar: -maxDrawdownDollar }
}

/**
 * Calculate annualized Sharpe ratio from equity curve.
 * Uses daily returns and the risk-free rate.
 */
function calculateSharpeRatio(equityCurve: PortfolioSnapshot[]): number {
  if (equityCurve.length < 2) {
    return 0
  }

  // Calculate daily returns
  const dailyReturns: number[] = []
  for (let i = 1; i < equityCurve.length; i++) {
    const prevEquity = equityCurve[i - 1].equity
    if (prevEquity > 0) {
      dailyReturns.push((equityCurve[i].equity - prevEquity) / prevEquity)
    }
  }

  if (dailyReturns.length === 0) {
    return 0
  }

  const avgReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length
  const dailyRiskFree = RISK_FREE_RATE / TRADING_DAYS_PER_YEAR
  const excessReturn = avgReturn - dailyRiskFree

  // Standard deviation of daily returns
  const variance = dailyReturns.reduce(
    (sum, r) => sum + Math.pow(r - avgReturn, 2),
    0
  ) / dailyReturns.length

  const stdDev = Math.sqrt(variance)

  if (stdDev === 0) {
    return 0
  }

  // Annualize: multiply by sqrt(252)
  return (excessReturn / stdDev) * Math.sqrt(TRADING_DAYS_PER_YEAR)
}
