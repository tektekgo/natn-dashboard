/**
 * Sentiment signal generator — news sentiment analysis.
 * Ported from dashboard engine (src/engine/signals/sentiment.ts).
 */

import type { SentimentData, SentimentSignalResult, SentimentConfig, SignalAction } from '../types.js'

const MIN_ARTICLES_FOR_SIGNAL = 3

export function generateSentimentSignal(
  data: SentimentData | null,
  config: SentimentConfig
): SentimentSignalResult {
  if (!data) {
    return { action: 'hold', score: 50, sentimentLabel: 'neutral', articleCount: 0, reasons: ['No sentiment data available'] }
  }

  if (data.articleCount < MIN_ARTICLES_FOR_SIGNAL) {
    return {
      action: 'hold', score: 50, sentimentLabel: 'neutral', articleCount: data.articleCount,
      reasons: [`Insufficient articles (${data.articleCount} < ${MIN_ARTICLES_FOR_SIGNAL} required)`],
    }
  }

  const score = data.score
  const reasons: string[] = []
  let action: SignalAction = 'hold'

  if (score >= config.newsScoreThreshold) {
    action = 'buy'
    reasons.push(`Bullish sentiment (${score.toFixed(1)} >= ${config.newsScoreThreshold})`)
  } else if (score <= (100 - config.newsScoreThreshold)) {
    action = 'sell'
    reasons.push(`Bearish sentiment (${score.toFixed(1)} <= ${100 - config.newsScoreThreshold})`)
  } else {
    reasons.push(`Neutral sentiment (${score.toFixed(1)})`)
  }

  reasons.push(`Based on ${data.articleCount} articles, label: ${data.label}`)

  return { action, score, sentimentLabel: data.label, articleCount: data.articleCount, reasons }
}
