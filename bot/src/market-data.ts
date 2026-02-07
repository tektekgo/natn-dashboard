/**
 * External data providers — FMP (fundamentals) + Alpha Vantage (sentiment).
 */

import { config } from './config.js'
import type { FundamentalData, SentimentData } from './types.js'

// ---------------------------------------------------------------------------
// FMP — Fundamental Data
// ---------------------------------------------------------------------------

export async function fetchFundamentals(symbol: string): Promise<FundamentalData | null> {
  try {
    const url = `${config.fmp.baseUrl}/profile?symbol=${symbol}&apikey=${config.fmp.apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`  [FMP] Failed for ${symbol}: ${res.status}`)
      return null
    }

    const data = await res.json() as Array<Record<string, unknown>>
    if (!data || data.length === 0) return null

    const profile = data[0]
    return {
      symbol,
      peRatio: typeof profile.pe === 'number' ? profile.pe : null,
      eps: typeof profile.eps === 'number' ? profile.eps : null,
      epsGrowth: null, // FMP profile doesn't include growth; would need income statement
      beta: typeof profile.beta === 'number' ? profile.beta : null,
      dividendYield: typeof profile.lastDiv === 'number' && typeof profile.price === 'number' && (profile.price as number) > 0
        ? (profile.lastDiv as number) / (profile.price as number)
        : null,
      marketCap: typeof profile.mktCap === 'number' ? profile.mktCap : null,
      reportDate: new Date().toISOString().split('T')[0],
    }
  } catch (err) {
    console.warn(`  [FMP] Error fetching ${symbol}:`, err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Alpha Vantage — Sentiment
// ---------------------------------------------------------------------------

export async function fetchSentiment(symbol: string): Promise<SentimentData | null> {
  try {
    const url = `${config.alphaVantage.baseUrl}?function=NEWS_SENTIMENT&tickers=${symbol}&limit=20&apikey=${config.alphaVantage.apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`  [AV] Failed for ${symbol}: ${res.status}`)
      return null
    }

    const data = await res.json() as { feed?: Array<{ ticker_sentiment?: Array<{ ticker: string; ticker_sentiment_score: string }> }> }
    if (!data.feed || data.feed.length === 0) return null

    // Extract sentiment scores for this symbol
    let totalScore = 0
    let count = 0

    for (const article of data.feed) {
      if (!article.ticker_sentiment) continue
      for (const ts of article.ticker_sentiment) {
        if (ts.ticker.toUpperCase() === symbol.toUpperCase()) {
          totalScore += parseFloat(ts.ticker_sentiment_score)
          count++
        }
      }
    }

    if (count === 0) return null

    const rawScore = totalScore / count // -1 to +1
    const normalizedScore = 50 + (rawScore * 50) // 0 to 100

    let label: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (rawScore >= 0.25) label = 'bullish'
    else if (rawScore <= -0.25) label = 'bearish'

    return {
      symbol,
      score: normalizedScore,
      rawScore,
      label,
      articleCount: count,
      fetchedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.warn(`  [AV] Error fetching ${symbol}:`, err)
    return null
  }
}
