/**
 * Technical signal generator.
 * Evaluates RSI + SMA indicators to produce buy/sell/hold signals.
 *
 * Buy conditions (any of):
 * - RSI < oversold threshold (default 30)
 * - Golden cross: SMA short > SMA long (and wasn't before)
 * - Price below SMA200 AND RSI < 40 (deep value + momentum)
 *
 * Sell conditions (any of):
 * - RSI > overbought threshold (default 70)
 * - Death cross: SMA short < SMA long
 */

import { calculateRSI } from '../indicators/rsi'
import { calculateSMA } from '../indicators/sma'
import type { OHLCV, TechnicalSignalResult, SignalAction } from '../types'
import type { TechnicalConfig } from '../../types/strategy-config'

/**
 * Generate a technical signal for a given date using historical price data.
 * @param prices OHLCV array ending at (or before) the evaluation date, oldest first
 * @param config Technical configuration parameters
 * @returns Technical signal result with action, score, and reasons
 */
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

  // If we don't have enough data for indicators, return hold
  if (isNaN(rsiValue) || isNaN(smaShort) || isNaN(smaLong)) {
    return {
      action: 'hold',
      score: 50,
      rsiValue: rsiValue || 50,
      smaShort: smaShort || currentPrice,
      smaLong: smaLong || currentPrice,
      smaTrend: smaTrend || currentPrice,
      currentPrice,
      reasons: ['Insufficient data for technical analysis'],
    }
  }

  let score = 50 // neutral baseline
  const reasons: string[] = []
  let buySignals = 0
  let sellSignals = 0

  // RSI oversold -> bullish
  if (rsiValue < config.rsiOversold) {
    score += 20
    buySignals++
    reasons.push(`RSI oversold (${rsiValue.toFixed(1)} < ${config.rsiOversold})`)
  }
  // RSI overbought -> bearish
  else if (rsiValue > config.rsiOverbought) {
    score -= 20
    sellSignals++
    reasons.push(`RSI overbought (${rsiValue.toFixed(1)} > ${config.rsiOverbought})`)
  }
  // RSI neutral-bullish
  else if (rsiValue < 45) {
    score += 5
    reasons.push(`RSI neutral-low (${rsiValue.toFixed(1)})`)
  }

  // Golden cross: short SMA > long SMA -> bullish
  if (smaShort > smaLong) {
    score += 15
    buySignals++
    reasons.push(`Golden cross (SMA${config.smaShortPeriod} ${smaShort.toFixed(2)} > SMA${config.smaLongPeriod} ${smaLong.toFixed(2)})`)
  }
  // Death cross: short SMA < long SMA -> bearish
  else {
    score -= 15
    sellSignals++
    reasons.push(`Death cross (SMA${config.smaShortPeriod} ${smaShort.toFixed(2)} < SMA${config.smaLongPeriod} ${smaLong.toFixed(2)})`)
  }

  // Price below SMA200 + RSI < 40 -> deep value opportunity
  if (currentPrice < smaLong && rsiValue < 40) {
    score += 10
    buySignals++
    reasons.push(`Deep value: price below SMA${config.smaLongPeriod} with low RSI`)
  }

  // Price above trend SMA -> bullish trend
  if (!isNaN(smaTrend) && currentPrice > smaTrend) {
    score += 5
    reasons.push(`Price above SMA${config.smaTrendPeriod} trend`)
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score))

  // Determine action
  let action: SignalAction = 'hold'
  if (buySignals >= 2 || score >= 70) {
    action = 'buy'
  } else if (sellSignals >= 2 || score <= 30) {
    action = 'sell'
  }

  return {
    action,
    score,
    rsiValue,
    smaShort,
    smaLong,
    smaTrend: smaTrend || currentPrice,
    currentPrice,
    reasons,
  }
}
