/**
 * Signal attribution analysis (Phase 4C).
 * For each closed trade, tracks which signals gave buy at entry
 * and correlates with profitability.
 */

import type { ClosedTrade, SignalAttribution } from '../types'

/**
 * Analyze signal attribution for a set of closed trades.
 * Returns per-signal accuracy percentages.
 */
export function analyzeAttribution(trades: ClosedTrade[]): SignalAttribution[] {
  if (trades.length === 0) {
    return [
      createEmptyAttribution('technical'),
      createEmptyAttribution('fundamental'),
    ]
  }

  const technicalStats = {
    totalSignals: 0,
    buySignals: 0,
    sellSignals: 0,
    accurateBuySignals: 0,
    scoreOnWin: [] as number[],
    scoreOnLoss: [] as number[],
  }

  const fundamentalStats = {
    totalSignals: 0,
    buySignals: 0,
    sellSignals: 0,
    accurateBuySignals: 0,
    scoreOnWin: [] as number[],
    scoreOnLoss: [] as number[],
  }

  for (const trade of trades) {
    const signal = trade.signalAtEntry
    const isProfitable = trade.pnl > 0

    // Technical signal analysis
    technicalStats.totalSignals++
    if (signal.technicalAction === 'buy') {
      technicalStats.buySignals++
      if (isProfitable) {
        technicalStats.accurateBuySignals++
        technicalStats.scoreOnWin.push(signal.technicalScore)
      } else {
        technicalStats.scoreOnLoss.push(signal.technicalScore)
      }
    } else if (signal.technicalAction === 'sell') {
      technicalStats.sellSignals++
    }

    // Fundamental signal analysis
    fundamentalStats.totalSignals++
    if (signal.fundamentalAction === 'buy') {
      fundamentalStats.buySignals++
      if (isProfitable) {
        fundamentalStats.accurateBuySignals++
        fundamentalStats.scoreOnWin.push(signal.fundamentalScore)
      } else {
        fundamentalStats.scoreOnLoss.push(signal.fundamentalScore)
      }
    } else if (signal.fundamentalAction === 'sell') {
      fundamentalStats.sellSignals++
    }
  }

  return [
    buildAttribution('technical', technicalStats),
    buildAttribution('fundamental', fundamentalStats),
  ]
}

function buildAttribution(
  signalType: SignalAttribution['signalType'],
  stats: {
    totalSignals: number
    buySignals: number
    sellSignals: number
    accurateBuySignals: number
    scoreOnWin: number[]
    scoreOnLoss: number[]
  }
): SignalAttribution {
  const buyAccuracy = stats.buySignals > 0
    ? (stats.accurateBuySignals / stats.buySignals) * 100
    : 0

  const avgScoreOnWin = stats.scoreOnWin.length > 0
    ? stats.scoreOnWin.reduce((a, b) => a + b, 0) / stats.scoreOnWin.length
    : 0

  const avgScoreOnLoss = stats.scoreOnLoss.length > 0
    ? stats.scoreOnLoss.reduce((a, b) => a + b, 0) / stats.scoreOnLoss.length
    : 0

  return {
    signalType,
    totalSignals: stats.totalSignals,
    buySignals: stats.buySignals,
    sellSignals: stats.sellSignals,
    accurateBuySignals: stats.accurateBuySignals,
    buyAccuracy,
    avgScoreOnWin,
    avgScoreOnLoss,
  }
}

function createEmptyAttribution(
  signalType: SignalAttribution['signalType']
): SignalAttribution {
  return {
    signalType,
    totalSignals: 0,
    buySignals: 0,
    sellSignals: 0,
    accurateBuySignals: 0,
    buyAccuracy: 0,
    avgScoreOnWin: 0,
    avgScoreOnLoss: 0,
  }
}
