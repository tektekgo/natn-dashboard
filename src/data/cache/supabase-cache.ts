/**
 * Supabase cache for historical OHLCV price data.
 * Shared across all users (public cache).
 */

import type { IDataCache } from '../types'
import type { OHLCV } from '../../engine/types'
import { supabase } from '../../lib/supabase'

export class SupabaseHistoricalCache implements IDataCache {
  async getCachedBars(
    symbol: string,
    startDate: string,
    endDate: string,
    timeframe: string = '1Day'
  ): Promise<OHLCV[] | null> {
    // First check if we have metadata for this range
    const isCached = await this.isCached(symbol, startDate, endDate, timeframe)
    if (!isCached) return null

    const { data, error } = await supabase
      .from('historical_data_cache')
      .select('date, open, high, low, close, volume')
      .eq('symbol', symbol)
      .eq('timeframe', timeframe)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error || !data || data.length === 0) {
      return null
    }

    return data.map(row => ({
      date: row.date,
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      volume: Number(row.volume),
    }))
  }

  async cacheBars(
    symbol: string,
    bars: OHLCV[],
    startDate: string,
    endDate: string,
    timeframe: string = '1Day'
  ): Promise<void> {
    if (bars.length === 0) return

    // Upsert bars (in batches of 500 to avoid payload limits)
    const batchSize = 500
    for (let i = 0; i < bars.length; i += batchSize) {
      const batch = bars.slice(i, i + batchSize).map(bar => ({
        symbol,
        timeframe,
        date: bar.date,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
      }))

      const { error } = await supabase
        .from('historical_data_cache')
        .upsert(batch, { onConflict: 'symbol,timeframe,date' })

      if (error) {
        console.error('Error caching bars:', error)
      }
    }

    // Update cache metadata
    const { error: metaError } = await supabase
      .from('cache_metadata')
      .upsert(
        {
          symbol,
          timeframe,
          cached_from: startDate,
          cached_to: endDate,
          row_count: bars.length,
          last_fetched_at: new Date().toISOString(),
        },
        { onConflict: 'symbol,timeframe' }
      )

    if (metaError) {
      console.error('Error updating cache metadata:', metaError)
    }
  }

  async isCached(
    symbol: string,
    startDate: string,
    endDate: string,
    timeframe: string = '1Day'
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('cache_metadata')
      .select('cached_from, cached_to')
      .eq('symbol', symbol)
      .eq('timeframe', timeframe)
      .single()

    if (error || !data) return false

    // Check if the cached range covers the requested range
    return data.cached_from <= startDate && data.cached_to >= endDate
  }
}
