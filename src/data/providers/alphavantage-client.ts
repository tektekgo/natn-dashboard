/**
 * Alpha Vantage News Sentiment API client.
 * Free tier: 25 requests/day.
 *
 * Currently used for live trading sentiment signals only.
 * Not used in backtesting (historical news sentiment cannot be reliably reconstructed).
 */

import type { SentimentData } from '../../engine/types'
import { fetchWithRetry } from '../../lib/fetch-with-retry'
import { ALPHAVANTAGE_BASE_URL } from '../../lib/constants'

export interface AlphaVantageNewsSentiment {
  items: string
  sentiment_score_definition: string
  relevance_score_definition: string
  feed: AlphaVantageArticle[]
}

export interface AlphaVantageArticle {
  title: string
  url: string
  time_published: string
  summary: string
  source: string
  overall_sentiment_score: number
  overall_sentiment_label: string
  ticker_sentiment: AlphaVantageTickerSentiment[]
}

export interface AlphaVantageTickerSentiment {
  ticker: string
  relevance_score: string
  ticker_sentiment_score: string
  ticker_sentiment_label: string
}

export class AlphaVantageClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_ALPHAVANTAGE_API_KEY || ''
  }

  /**
   * Fetch news sentiment for a stock symbol.
   * Returns normalized sentiment data for the engine.
   */
  async fetchSentiment(symbol: string): Promise<SentimentData | null> {
    if (!this.apiKey) {
      return null
    }

    const params = new URLSearchParams({
      function: 'NEWS_SENTIMENT',
      tickers: symbol,
      limit: '20',
      apikey: this.apiKey,
    })

    const url = `${ALPHAVANTAGE_BASE_URL}?${params.toString()}`
    const response = await fetchWithRetry(url)

    if (!response.ok) {
      console.warn(`Alpha Vantage API error (${response.status}) for ${symbol}`)
      return null
    }

    const data = await response.json() as AlphaVantageNewsSentiment

    if (!data.feed || data.feed.length === 0) {
      return null
    }

    return this.parseSentiment(symbol, data)
  }

  /**
   * Fetch sentiment for multiple symbols.
   * Fetches sequentially to respect rate limits.
   */
  async fetchMultiSentiment(symbols: string[]): Promise<Map<string, SentimentData>> {
    const results = new Map<string, SentimentData>()

    for (const symbol of symbols) {
      const sentiment = await this.fetchSentiment(symbol)
      if (sentiment) {
        results.set(symbol, sentiment)
      }
    }

    return results
  }

  private parseSentiment(
    symbol: string,
    data: AlphaVantageNewsSentiment
  ): SentimentData {
    const articles = data.feed
    let totalScore = 0
    let relevantArticles = 0

    for (const article of articles) {
      // Find the ticker-specific sentiment for our symbol
      const tickerSentiment = article.ticker_sentiment?.find(
        ts => ts.ticker === symbol
      )

      if (tickerSentiment) {
        const score = parseFloat(tickerSentiment.ticker_sentiment_score)
        const relevance = parseFloat(tickerSentiment.relevance_score)

        // Weight by relevance
        if (!isNaN(score) && !isNaN(relevance) && relevance > 0) {
          totalScore += score * relevance
          relevantArticles++
        }
      }
    }

    const avgScore = relevantArticles > 0 ? totalScore / relevantArticles : 0

    // Alpha Vantage scores: -1.0 (bearish) to +1.0 (bullish)
    // Normalize to 0-100 scale for the engine
    const normalizedScore = ((avgScore + 1) / 2) * 100

    let label: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (avgScore > 0.25) label = 'bullish'
    else if (avgScore < -0.25) label = 'bearish'

    return {
      symbol,
      score: normalizedScore,
      rawScore: avgScore,
      label,
      articleCount: relevantArticles,
      fetchedAt: new Date().toISOString(),
    }
  }
}
