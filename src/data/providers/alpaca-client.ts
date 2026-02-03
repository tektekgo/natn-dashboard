/**
 * Alpaca Data API client for historical OHLCV bars.
 * Free tier, unlimited requests for market data.
 */

import type { IHistoricalDataProvider } from '../types'
import type { OHLCV } from '../../engine/types'
import type { AlpacaBar, AlpacaMultiBarsResponse } from '../../types/api'
import { ALPACA_DATA_BASE_URL, ALPACA_MAX_BARS_PER_REQUEST } from '../../lib/constants'
import { fetchWithRetry } from '../../lib/fetch-with-retry'

export class AlpacaClient implements IHistoricalDataProvider {
  private apiKey: string
  private apiSecret: string

  constructor(apiKey?: string, apiSecret?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_ALPACA_API_KEY || ''
    this.apiSecret = apiSecret || import.meta.env.VITE_ALPACA_API_SECRET || ''
  }

  async fetchBars(
    symbol: string,
    startDate: string,
    endDate: string,
    timeframe: string = '1Day'
  ): Promise<OHLCV[]> {
    const allBars: OHLCV[] = []
    let pageToken: string | null = null

    do {
      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
        timeframe,
        limit: String(ALPACA_MAX_BARS_PER_REQUEST),
        adjustment: 'split',
        feed: 'sip',
        sort: 'asc',
      })

      if (pageToken) {
        params.set('page_token', pageToken)
      }

      const url = `${ALPACA_DATA_BASE_URL}/stocks/${symbol}/bars?${params.toString()}`
      const response = await fetchWithRetry(url, {
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.apiSecret,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Alpaca API error (${response.status}): ${errorText}`)
      }

      const data = await response.json() as { bars: AlpacaBar[] | null; next_page_token: string | null }
      const bars = data.bars || []

      for (const bar of bars) {
        allBars.push(alpacaBarToOHLCV(bar))
      }

      pageToken = data.next_page_token
    } while (pageToken)

    return allBars
  }

  /**
   * Fetch bars for multiple symbols at once (more efficient).
   */
  async fetchMultiBars(
    symbols: string[],
    startDate: string,
    endDate: string,
    timeframe: string = '1Day'
  ): Promise<Map<string, OHLCV[]>> {
    const result = new Map<string, OHLCV[]>()
    for (const s of symbols) {
      result.set(s, [])
    }

    let pageToken: string | null = null

    do {
      const params = new URLSearchParams({
        symbols: symbols.join(','),
        start: startDate,
        end: endDate,
        timeframe,
        limit: String(ALPACA_MAX_BARS_PER_REQUEST),
        adjustment: 'split',
        feed: 'sip',
        sort: 'asc',
      })

      if (pageToken) {
        params.set('page_token', pageToken)
      }

      const url = `${ALPACA_DATA_BASE_URL}/stocks/bars?${params.toString()}`
      const response = await fetchWithRetry(url, {
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.apiSecret,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Alpaca API error (${response.status}): ${errorText}`)
      }

      const data = await response.json() as AlpacaMultiBarsResponse
      const barsMap = data.bars || {}

      for (const [symbol, bars] of Object.entries(barsMap)) {
        const existing = result.get(symbol) || []
        for (const bar of bars) {
          existing.push(alpacaBarToOHLCV(bar))
        }
        result.set(symbol, existing)
      }

      pageToken = data.next_page_token
    } while (pageToken)

    return result
  }
}

function alpacaBarToOHLCV(bar: AlpacaBar): OHLCV {
  // Alpaca timestamps are ISO format, extract YYYY-MM-DD
  const date = bar.t.substring(0, 10)
  return {
    date,
    open: bar.o,
    high: bar.h,
    low: bar.l,
    close: bar.c,
    volume: bar.v,
  }
}
