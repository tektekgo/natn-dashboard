/**
 * Historical data service - cache-or-fetch orchestrator for price data.
 * Tries Supabase cache first, falls back to Alpaca API.
 */

import type { OHLCV } from '../engine/types'
import type { IHistoricalDataProvider, IDataCache } from './types'
import { AlpacaClient } from './providers/alpaca-client'
import { SupabaseHistoricalCache } from './cache/supabase-cache'

export class HistoricalDataService {
  private provider: IHistoricalDataProvider
  private cache: IDataCache

  constructor(
    provider?: IHistoricalDataProvider,
    cache?: IDataCache
  ) {
    this.provider = provider || new AlpacaClient()
    this.cache = cache || new SupabaseHistoricalCache()
  }

  /**
   * Get OHLCV data for a symbol, using cache when available.
   */
  async getBars(
    symbol: string,
    startDate: string,
    endDate: string,
    timeframe: string = '1Day'
  ): Promise<OHLCV[]> {
    // Try cache first
    const cached = await this.cache.getCachedBars(symbol, startDate, endDate, timeframe)
    if (cached && cached.length > 0) {
      return cached
    }

    // Fetch from provider
    const bars = await this.provider.fetchBars(symbol, startDate, endDate, timeframe)

    // Cache the results (fire-and-forget)
    if (bars.length > 0) {
      this.cache.cacheBars(symbol, bars, startDate, endDate, timeframe).catch(err => {
        console.error(`Failed to cache bars for ${symbol}:`, err)
      })
    }

    return bars
  }

  /**
   * Get OHLCV data for multiple symbols.
   */
  async getMultiBars(
    symbols: string[],
    startDate: string,
    endDate: string,
    timeframe: string = '1Day'
  ): Promise<Map<string, OHLCV[]>> {
    const result = new Map<string, OHLCV[]>()
    const uncachedSymbols: string[] = []

    // Check cache for each symbol
    for (const symbol of symbols) {
      const cached = await this.cache.getCachedBars(symbol, startDate, endDate, timeframe)
      if (cached && cached.length > 0) {
        result.set(symbol, cached)
      } else {
        uncachedSymbols.push(symbol)
      }
    }

    // Fetch uncached symbols from provider
    if (uncachedSymbols.length > 0) {
      // Use multi-bar endpoint if provider supports it
      if (this.provider instanceof AlpacaClient) {
        const fetched = await (this.provider as AlpacaClient).fetchMultiBars(
          uncachedSymbols,
          startDate,
          endDate,
          timeframe
        )

        for (const [symbol, bars] of fetched) {
          result.set(symbol, bars)
          // Cache each symbol's data
          if (bars.length > 0) {
            this.cache.cacheBars(symbol, bars, startDate, endDate, timeframe).catch(err => {
              console.error(`Failed to cache bars for ${symbol}:`, err)
            })
          }
        }
      } else {
        // Fall back to individual fetches
        for (const symbol of uncachedSymbols) {
          const bars = await this.provider.fetchBars(symbol, startDate, endDate, timeframe)
          result.set(symbol, bars)
          if (bars.length > 0) {
            this.cache.cacheBars(symbol, bars, startDate, endDate, timeframe).catch(err => {
              console.error(`Failed to cache bars for ${symbol}:`, err)
            })
          }
        }
      }
    }

    return result
  }
}
