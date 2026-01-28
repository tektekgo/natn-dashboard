/**
 * Sentiment signal generator.
 * Evaluates news/social sentiment to produce buy/sell/hold signals.
 *
 * Scoring (0-100 scale):
 * - Raw score maps from Alpha Vantage range (-1 to +1) to (0 to 100)
 * - Bullish threshold: score > newsScoreThreshold (default 60) -> buy signal
 * - Bearish threshold: score < (100 - newsScoreThreshold) (default 40) -> sell signal
 * - Minimum articles required: 3 (to avoid noise from single articles)
 */

import type { SentimentData, SentimentSignalResult, SignalAction } from '../types'
import type { SentimentConfig } from '../../types/strategy-config'

const MIN_ARTICLES_FOR_SIGNAL = 3

/**
 * Generate a sentiment signal for a stock.
 * @param data Sentiment data (normalized score, article count)
 * @param config Sentiment configuration parameters
 * @returns Sentiment signal result with action, score, and reasons
 */
export function generateSentimentSignal(
  data: SentimentData | null,
  config: SentimentConfig
): SentimentSignalResult {
  // No sentiment data available -> neutral
  if (!data) {
    return {
      action: 'hold',
      score: 50,
      sentimentLabel: 'neutral',
      articleCount: 0,
      reasons: ['No sentiment data available'],
    }
  }

  // Not enough articles -> low confidence
  if (data.articleCount < MIN_ARTICLES_FOR_SIGNAL) {
    return {
      action: 'hold',
      score: 50,
      sentimentLabel: 'neutral',
      articleCount: data.articleCount,
      reasons: [`Insufficient articles (${data.articleCount} < ${MIN_ARTICLES_FOR_SIGNAL} required)`],
    }
  }

  const score = data.score // Already 0-100 normalized
  const reasons: string[] = []
  let action: SignalAction = 'hold'

  // Evaluate against thresholds
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

  return {
    action,
    score,
    sentimentLabel: data.label,
    articleCount: data.articleCount,
    reasons,
  }
}
