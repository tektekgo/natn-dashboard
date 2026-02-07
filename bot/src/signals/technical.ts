/**
 * Technical signal generator — RSI + SMA analysis.
 * Ported from dashboard engine (src/engine/signals/technical.ts).
 */

import { calculateRSI } from '../indicators/rsi.js'
import { calculateSMA } from '../indicators/sma.js'
import type { OHLCV, TechnicalSignalResult, TechnicalConfig, SignalAction } from '../types.js'

export function generateTechnicalSignal(
  prices: OHLCV[],
  config: TechnicalConfig
): TechnicalSignalResult {
  const closes = prices.map(p => p.close)
  const currentPrice = closes[closes.length - 1]

  const rsiValue = calculateRSI(closes, config.rsiPeriod)
  const smaShort = calculateSMA(closes, config.smaShortPeriod)
  const smaLong = calculateSMA(closes, config.smaLongPeriod)
  const smaTrend = calculateSMA(closes, config.smaTrendPeriod)

  if (isNaN(rsiValue) || isNaN(smaShort) || isNaN(smaLong)) {
    return {
      action: 'hold', score: 50,
      rsiValue: rsiValue || 50, smaShort: smaShort || currentPrice,
      smaLong: smaLong || currentPrice, smaTrend: smaTrend || currentPrice,
      currentPrice, reasons: ['Insufficient data for technical analysis'],
    }
  }

  let score = 50
  const reasons: string[] = []
  let buySignals = 0
  let sellSignals = 0

  if (rsiValue < config.rsiOversold) {
    score += 20; buySignals++
    reasons.push(`RSI oversold (${rsiValue.toFixed(1)} < ${config.rsiOversold})`)
  } else if (rsiValue > config.rsiOverbought) {
    score -= 20; sellSignals++
    reasons.push(`RSI overbought (${rsiValue.toFixed(1)} > ${config.rsiOverbought})`)
  } else if (rsiValue < 45) {
    score += 5
    reasons.push(`RSI neutral-low (${rsiValue.toFixed(1)})`)
  }

  if (smaShort > smaLong) {
    score += 15; buySignals++
    reasons.push(`Golden cross (SMA${config.smaShortPeriod} > SMA${config.smaLongPeriod})`)
  } else {
    score -= 15; sellSignals++
    reasons.push(`Death cross (SMA${config.smaShortPeriod} < SMA${config.smaLongPeriod})`)
  }

  if (currentPrice < smaLong && rsiValue < 40) {
    score += 10; buySignals++
    reasons.push(`Deep value: price below SMA${config.smaLongPeriod} with low RSI`)
  }

  if (!isNaN(smaTrend) && currentPrice > smaTrend) {
    score += 5
    reasons.push(`Price above SMA${config.smaTrendPeriod} trend`)
  }

  score = Math.max(0, Math.min(100, score))

  let action: SignalAction = 'hold'
  if (buySignals >= 2 || score >= 70) action = 'buy'
  else if (sellSignals >= 2 || score <= 30) action = 'sell'

  return { action, score, rsiValue, smaShort, smaLong, smaTrend: smaTrend || currentPrice, currentPrice, reasons }
}
