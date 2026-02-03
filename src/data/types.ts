/**
 * Data layer interfaces for swappable providers and caching.
 */

import type { OHLCV, FundamentalData } from '../engine/types'

// -----------------------------------------------------------------------------
// Historical Data Provider
// -----------------------------------------------------------------------------

export interface IHistoricalDataProvider {
  /**
   * Fetch OHLCV bars for a symbol within a date range.
   */
  fetchBars(
    symbol: string,
    startDate: string,
    endDate: string,
    timeframe?: string
  ): Promise<OHLCV[]>
}

// -----------------------------------------------------------------------------
// Fundamental Data Provider
// -----------------------------------------------------------------------------

export interface IFundamentalDataProvider {
  /**
   * Fetch company profile (beta, market cap, etc.)
   */
  fetchProfile(symbol: string): Promise<FundamentalData | null>

  /**
   * Fetch quarterly financials (PE, EPS, etc.)
   * Returns array sorted by report date descending.
   */
  fetchQuarterlyMetrics(symbol: string): Promise<FundamentalData[]>
}

// -----------------------------------------------------------------------------
// Data Cache
// -----------------------------------------------------------------------------

export interface IDataCache {
  /**
   * Get cached OHLCV data for a symbol and date range.
   * Returns null if no cache exists or range is incomplete.
   */
  getCachedBars(
    symbol: string,
    startDate: string,
    endDate: string,
    timeframe?: string
  ): Promise<OHLCV[] | null>

  /**
   * Store OHLCV data in cache.
   */
  cacheBars(
    symbol: string,
    bars: OHLCV[],
    startDate: string,
    endDate: string,
    timeframe?: string
  ): Promise<void>

  /**
   * Check if a date range is fully cached.
   */
  isCached(
    symbol: string,
    startDate: string,
    endDate: string,
    timeframe?: string
  ): Promise<boolean>
}

export interface IFundamentalCache {
  /**
   * Get cached fundamental data for a symbol.
   */
  getCachedFundamentals(symbol: string): Promise<FundamentalData[] | null>

  /**
   * Store fundamental data in cache.
   */
  cacheFundamentals(symbol: string, data: FundamentalData[]): Promise<void>

  /**
   * Check if fundamental data is cached and fresh (within maxAge).
   */
  isFresh(symbol: string, maxAgeMs?: number): Promise<boolean>
}
