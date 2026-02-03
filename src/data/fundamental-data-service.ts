/**
 * Fundamental data service - cache-or-fetch orchestrator.
 * Prevents look-ahead bias by only returning data with reportDate <= asOfDate.
 */

import type { FundamentalData } from '../engine/types'
import type { IFundamentalDataProvider, IFundamentalCache } from './types'
import { FMPClient } from './providers/fmp-client'
import { SupabaseFundamentalCache } from './cache/fundamental-cache'

export class FundamentalDataService {
  private provider: IFundamentalDataProvider
  private cache: IFundamentalCache

  constructor(
    provider?: IFundamentalDataProvider,
    cache?: IFundamentalCache
  ) {
    this.provider = provider || new FMPClient()
    this.cache = cache || new SupabaseFundamentalCache()
  }

  /**
   * Get fundamental data for a symbol, using cache when fresh.
   * Returns quarterly metrics sorted by reportDate descending.
   */
  async getFundamentals(symbol: string): Promise<FundamentalData[]> {
    // Check if cache is fresh
    const isFresh = await this.cache.isFresh(symbol)
    if (isFresh) {
      const cached = await this.cache.getCachedFundamentals(symbol)
      if (cached && cached.length > 0) {
        return cached
      }
    }

    // Fetch from provider
    const [profile, quarterlyMetrics] = await Promise.all([
      this.provider.fetchProfile(symbol),
      this.provider.fetchQuarterlyMetrics(symbol),
    ])

    // Merge profile data (beta, marketCap) into quarterly metrics
    if (profile && quarterlyMetrics.length > 0) {
      for (const metric of quarterlyMetrics) {
        if (metric.beta === null && profile.beta !== null) {
          metric.beta = profile.beta
        }
        if (metric.marketCap === null && profile.marketCap !== null) {
          metric.marketCap = profile.marketCap
        }
      }
    }

    // If we have no quarterly data but have a profile, return profile as single entry
    const results = quarterlyMetrics.length > 0 ? quarterlyMetrics : (profile ? [profile] : [])

    // Cache the results
    if (results.length > 0) {
      this.cache.cacheFundamentals(symbol, results).catch(err => {
        console.error(`Failed to cache fundamentals for ${symbol}:`, err)
      })
    }

    return results
  }

  /**
   * Get fundamental data for multiple symbols.
   */
  async getMultiFundamentals(symbols: string[]): Promise<Map<string, FundamentalData[]>> {
    const result = new Map<string, FundamentalData[]>()

    // Fetch in parallel (max 3 at a time to avoid rate limits)
    const batchSize = 3
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize)
      const promises = batch.map(async symbol => {
        const data = await this.getFundamentals(symbol)
        return { symbol, data }
      })

      const results = await Promise.all(promises)
      for (const { symbol, data } of results) {
        result.set(symbol, data)
      }
    }

    return result
  }
}
