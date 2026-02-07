/**
 * Signal combiner — weighted scoring + majority vote + veto logic.
 * Ported from dashboard engine (src/engine/signals/combiner.ts).
 */

import type {
  TechnicalSignalResult,
  FundamentalSignalResult,
  SentimentSignalResult,
  CombinedSignal,
  SignalWeights,
  SignalAction,
} from '../types.js'

export interface CombineSignalInputs {
  technical: TechnicalSignalResult
  fundamental: FundamentalSignalResult
  sentiment?: SentimentSignalResult
  weights: SignalWeights
  sentimentAvailable?: boolean
}

export function combineSignals(inputs: CombineSignalInputs): CombinedSignal {
  const { technical, fundamental, sentiment, weights, sentimentAvailable = false } = inputs

  let techWeight: number
  let fundWeight: number
  let sentWeight = 0

  if (sentimentAvailable && sentiment) {
    const total = weights.technical + weights.fundamental + weights.sentiment
    techWeight = (weights.technical / total) * 100
    fundWeight = (weights.fundamental / total) * 100
    sentWeight = (weights.sentiment / total) * 100
  } else {
    const total = weights.technical + weights.fundamental
    techWeight = (weights.technical / total) * 100
    fundWeight = (weights.fundamental / total) * 100
  }

  let totalScore =
    (technical.score * techWeight / 100) +
    (fundamental.score * fundWeight / 100)

  if (sentimentAvailable && sentiment) {
    totalScore += (sentiment.score * sentWeight / 100)
  }

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

  let action: SignalAction = 'hold'
  if (totalScore >= 55 && buyVotes >= 1) action = 'buy'
  else if (totalScore <= 35 || sellVotes >= 2) action = 'sell'

  let vetoed = false
  let vetoReason: string | undefined

  if (action === 'buy' && fundamental.score <= 20) {
    vetoed = true; vetoReason = 'Fundamental score critically low'; action = 'hold'
  }
  if (action === 'buy' && technical.rsiValue > 75) {
    vetoed = true; vetoReason = 'RSI overbought'; action = 'hold'
  }
  if (action === 'buy' && sentimentAvailable && sentiment && sentiment.sentimentLabel === 'bearish') {
    vetoed = true; vetoReason = 'Bearish sentiment veto'; action = 'hold'
  }

  const reasons = [
    ...technical.reasons.map(r => `[Tech] ${r}`),
    ...fundamental.reasons.map(r => `[Fund] ${r}`),
  ]
  if (sentimentAvailable && sentiment) {
    reasons.push(...sentiment.reasons.map(r => `[Sent] ${r}`))
  }
  if (vetoed && vetoReason) reasons.push(`[Veto] ${vetoReason}`)

  return {
    action, totalScore,
    technicalScore: technical.score, fundamentalScore: fundamental.score,
    technicalWeight: techWeight, fundamentalWeight: fundWeight,
    technicalAction: technical.action, fundamentalAction: fundamental.action,
    reasons, vetoed, vetoReason,
  }
}
