/**
 * Fundamental signal generator — PE, EPS, beta, dividend analysis.
 * Ported from dashboard engine (src/engine/signals/fundamental.ts).
 */

import type { FundamentalData, FundamentalSignalResult, FundamentalConfig, SignalAction } from '../types.js'

export function generateFundamentalSignal(
  data: FundamentalData | null,
  config: FundamentalConfig
): FundamentalSignalResult {
  if (!data) {
    return {
      action: 'hold', score: 50,
      peRatio: null, eps: null, epsGrowth: null, beta: null,
      reasons: ['No fundamental data available'],
    }
  }

  let score = 30
  const reasons: string[] = []

  // PE Ratio
  if (data.peRatio !== null) {
    if (data.peRatio > 0 && data.peRatio >= config.peRatioMin && data.peRatio <= config.peRatioMax) {
      score += 20
      reasons.push(`PE favorable (${data.peRatio.toFixed(1)} in ${config.peRatioMin}-${config.peRatioMax})`)
    } else if (data.peRatio < 0) {
      score -= 10
      reasons.push(`Negative PE (${data.peRatio.toFixed(1)})`)
    } else if (data.peRatio > config.peRatioMax) {
      score -= 5
      reasons.push(`PE too high (${data.peRatio.toFixed(1)} > ${config.peRatioMax})`)
    } else if (data.peRatio > 0 && data.peRatio < config.peRatioMin) {
      score -= 5
      reasons.push(`PE suspiciously low (${data.peRatio.toFixed(1)} < ${config.peRatioMin})`)
    }
  }

  // EPS
  if (data.eps !== null) {
    if (data.eps > 0) { score += 15; reasons.push(`Positive EPS ($${data.eps.toFixed(2)})`) }
    else { score -= 10; reasons.push(`Negative EPS ($${data.eps.toFixed(2)})`) }
  }

  // EPS Growth
  if (data.epsGrowth !== null) {
    if (data.epsGrowth >= config.epsGrowthMin) {
      score += 15
      reasons.push(`EPS growth positive (${(data.epsGrowth * 100).toFixed(1)}%)`)
    } else {
      score -= 5
      reasons.push(`EPS growth negative (${(data.epsGrowth * 100).toFixed(1)}%)`)
    }
  }

  // Beta
  if (data.beta !== null) {
    if (data.beta > 0 && data.beta <= config.betaMax) {
      score += 10
      reasons.push(`Beta in range (${data.beta.toFixed(2)} <= ${config.betaMax})`)
    } else if (data.beta > config.betaMax) {
      score -= 5
      reasons.push(`Beta too high (${data.beta.toFixed(2)} > ${config.betaMax})`)
    }
  }

  // Dividend
  if (data.dividendYield !== null && data.dividendYield >= config.dividendYieldMin) {
    score += 5
    reasons.push(`Dividend yield favorable (${(data.dividendYield * 100).toFixed(2)}%)`)
  }

  // Market cap
  if (data.marketCap !== null && data.marketCap >= config.marketCapMin) {
    score += 5
    reasons.push(`Market cap sufficient ($${(data.marketCap / 1e9).toFixed(1)}B)`)
  }

  score = Math.max(0, Math.min(100, score))

  let action: SignalAction = 'hold'
  const hasPositiveEPS = data.eps !== null && data.eps > 0
  const hasFavorablePE = data.peRatio !== null && data.peRatio > 0 &&
    data.peRatio >= config.peRatioMin && data.peRatio <= config.peRatioMax

  if (score >= 50 && hasPositiveEPS && hasFavorablePE) action = 'buy'
  else if (score <= 25) action = 'sell'

  return { action, score, peRatio: data.peRatio, eps: data.eps, epsGrowth: data.epsGrowth, beta: data.beta, reasons }
}
