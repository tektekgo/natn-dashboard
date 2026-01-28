import { describe, it, expect } from 'vitest'
import { generateSentimentSignal } from '../signals/sentiment'
import type { SentimentData } from '../types'
import { DEFAULT_SENTIMENT_CONFIG } from '../../types/strategy-config'

const bullishSentiment: SentimentData = {
  symbol: 'AAPL',
  score: 75,
  rawScore: 0.5,
  label: 'bullish',
  articleCount: 10,
  fetchedAt: '2024-01-15T12:00:00Z',
}

const bearishSentiment: SentimentData = {
  symbol: 'AAPL',
  score: 25,
  rawScore: -0.5,
  label: 'bearish',
  articleCount: 8,
  fetchedAt: '2024-01-15T12:00:00Z',
}

const neutralSentiment: SentimentData = {
  symbol: 'AAPL',
  score: 50,
  rawScore: 0,
  label: 'neutral',
  articleCount: 5,
  fetchedAt: '2024-01-15T12:00:00Z',
}

const config = { ...DEFAULT_SENTIMENT_CONFIG, enabled: true, newsScoreThreshold: 60 }

describe('generateSentimentSignal', () => {
  it('returns hold with null data', () => {
    const result = generateSentimentSignal(null, config)
    expect(result.action).toBe('hold')
    expect(result.score).toBe(50)
    expect(result.reasons).toContain('No sentiment data available')
  })

  it('returns hold with insufficient articles', () => {
    const fewArticles: SentimentData = { ...bullishSentiment, articleCount: 2 }
    const result = generateSentimentSignal(fewArticles, config)
    expect(result.action).toBe('hold')
    expect(result.articleCount).toBe(2)
  })

  it('returns buy for bullish sentiment above threshold', () => {
    const result = generateSentimentSignal(bullishSentiment, config)
    expect(result.action).toBe('buy')
    expect(result.score).toBe(75)
    expect(result.sentimentLabel).toBe('bullish')
  })

  it('returns sell for bearish sentiment below threshold', () => {
    const result = generateSentimentSignal(bearishSentiment, config)
    expect(result.action).toBe('sell')
    expect(result.score).toBe(25)
    expect(result.sentimentLabel).toBe('bearish')
  })

  it('returns hold for neutral sentiment', () => {
    const result = generateSentimentSignal(neutralSentiment, config)
    expect(result.action).toBe('hold')
    expect(result.sentimentLabel).toBe('neutral')
  })

  it('includes article count in reasons', () => {
    const result = generateSentimentSignal(bullishSentiment, config)
    const hasArticleReason = result.reasons.some(r => r.includes('10 articles'))
    expect(hasArticleReason).toBe(true)
  })
})
