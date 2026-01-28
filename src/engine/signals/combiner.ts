/**
 * Signal combiner with weighted scoring, majority vote, and veto logic.
 *
 * When sentiment is unavailable (backtesting mode), weights auto-normalize:
 *   technical: 40/(40+35) * 100 = 53.3%
 *   fundamental: 35/(40+35) * 100 = 46.7%
 */

import type {
  TechnicalSignalResult,
  FundamentalSignalResult,
  SentimentSignalResult,
  CombinedSignal,
  SignalAction,
} from '../types'
import type { SignalWeights } from '../../types/strategy-config'

export interface CombineSignalInputs {
  technical: TechnicalSignalResult
  fundamental: FundamentalSignalResult
  sentiment?: SentimentSignalResult
  weights: SignalWeights
  /** Whether sentiment is available (false for backtesting) */
  sentimentAvailable?: boolean
}

/**
 * Combine technical and fundamental signals into a final trading decision.
 * Uses weighted scoring + majority vote + veto logic.
 */
export function combineSignals(inputs: CombineSignalInputs): CombinedSignal {
  const { technical, fundamental, sentiment, weights, sentimentAvailable = false } = inputs

  // Normalize weights when sentiment unavailable
  let techWeight: number
  let fundWeight: number
  let sentWeight = 0

  if (sentimentAvailable && sentiment) {
    // All three weights active
    const total = weights.technical + weights.fundamental + weights.sentiment
    techWeight = (weights.technical / total) * 100
    fundWeight = (weights.fundamental / total) * 100
    sentWeight = (weights.sentiment / total) * 100
  } else {
    // Only technical + fundamental
    const total = weights.technical + weights.fundamental
    techWeight = (weights.technical / total) * 100
    fundWeight = (weights.fundamental / total) * 100
  }

  // Weighted score
  let totalScore =
    (technical.score * techWeight / 100) +
    (fundamental.score * fundWeight / 100)

  if (sentimentAvailable && sentiment) {
    totalScore += (sentiment.score * sentWeight / 100)
  }

  // Majority vote: count buy vs sell signals
  let buyVotes = 0
  let sellVotes = 0

  if (technical.action === 'buy') buyVotes++
  if (technical.action === 'sell') sellVotes++
  if (fundamental.action === 'buy') buyVotes++
  if (fundamental.action === 'sell') sellVotes++
  if (sentimentAvailable && sentiment) {
    if (sentiment.action === 'buy') buyVotes++
    if (sentiment.action === 'sell') sellVotes++
  }

  // Determine action from weighted score
  let action: SignalAction = 'hold'
  if (totalScore >= 55 && buyVotes >= 1) {
    action = 'buy'
  } else if (totalScore <= 35 || sellVotes >= 2) {
    action = 'sell'
  }

  // Veto logic: don't buy if fundamentals strongly negative
  let vetoed = false
  let vetoReason: string | undefined

  if (action === 'buy' && fundamental.score <= 20) {
    vetoed = true
    vetoReason = 'Fundamental score critically low - veto buy'
    action = 'hold'
  }

  // Don't buy if RSI is overbought
  if (action === 'buy' && technical.rsiValue > 75) {
    vetoed = true
    vetoReason = 'RSI overbought - veto buy'
    action = 'hold'
  }

  // Don't buy if sentiment is strongly bearish
  if (action === 'buy' && sentimentAvailable && sentiment && sentiment.sentimentLabel === 'bearish') {
    vetoed = true
    vetoReason = 'Bearish sentiment - veto buy'
    action = 'hold'
  }

  const reasons = [
    ...technical.reasons.map(r => `[Tech] ${r}`),
    ...fundamental.reasons.map(r => `[Fund] ${r}`),
  ]

  if (sentimentAvailable && sentiment) {
    reasons.push(...sentiment.reasons.map(r => `[Sent] ${r}`))
  }

  if (vetoed && vetoReason) {
    reasons.push(`[Veto] ${vetoReason}`)
  }

  return {
    action,
    totalScore,
    technicalScore: technical.score,
    fundamentalScore: fundamental.score,
    technicalWeight: techWeight,
    fundamentalWeight: fundWeight,
    technicalAction: technical.action,
    fundamentalAction: fundamental.action,
    reasons,
    vetoed,
    vetoReason,
  }
}
