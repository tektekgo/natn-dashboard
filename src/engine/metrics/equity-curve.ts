/**
 * Equity curve utilities.
 * Helpers for building and analyzing daily equity snapshots.
 */

import type { PortfolioSnapshot } from '../types'

/**
 * Calculate drawdown series from equity curve (for charting).
 * Returns drawdown percentage at each point.
 */
export function calculateDrawdownSeries(
  equityCurve: PortfolioSnapshot[]
): { date: string; drawdown: number }[] {
  if (equityCurve.length === 0) return []

  let peak = equityCurve[0].equity
  return equityCurve.map(snapshot => {
    if (snapshot.equity > peak) {
      peak = snapshot.equity
    }
    const drawdown = peak > 0 ? ((snapshot.equity - peak) / peak) * 100 : 0
    return { date: snapshot.date, drawdown }
  })
}

/**
 * Calculate rolling return over a window of days.
 */
export function calculateRollingReturn(
  equityCurve: PortfolioSnapshot[],
  windowDays: number
): { date: string; rollingReturn: number }[] {
  const results: { date: string; rollingReturn: number }[] = []

  for (let i = windowDays; i < equityCurve.length; i++) {
    const current = equityCurve[i].equity
    const previous = equityCurve[i - windowDays].equity
    const rollingReturn = previous > 0 ? ((current - previous) / previous) * 100 : 0
    results.push({ date: equityCurve[i].date, rollingReturn })
  }

  return results
}

/**
 * Normalize equity curves to percentage returns for comparison.
 * All curves start at 0% on their first date.
 */
export function normalizeEquityCurves(
  curves: { label: string; snapshots: PortfolioSnapshot[] }[]
): { label: string; data: { date: string; returnPercent: number }[] }[] {
  return curves.map(curve => {
    const initial = curve.snapshots.length > 0 ? curve.snapshots[0].equity : 1
    return {
      label: curve.label,
      data: curve.snapshots.map(s => ({
        date: s.date,
        returnPercent: ((s.equity - initial) / initial) * 100,
      })),
    }
  })
}
