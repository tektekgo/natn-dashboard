/**
 * Supabase cache for fundamental financial data.
 */

import type { IFundamentalCache } from '../types'
import type { FundamentalData } from '../../engine/types'
import { supabase } from '../../lib/supabase'
import { FUNDAMENTAL_CACHE_MAX_AGE_MS } from '../../lib/constants'

export class SupabaseFundamentalCache implements IFundamentalCache {
  async getCachedFundamentals(symbol: string): Promise<FundamentalData[] | null> {
    const { data, error } = await supabase
      .from('fundamental_data_cache')
      .select('data, data_type, period, report_date')
      .eq('symbol', symbol)
      .eq('data_type', 'ratios')
      .order('report_date', { ascending: false })

    if (error || !data || data.length === 0) {
      return null
    }

    return data.map(row => {
      const d = row.data as Record<string, unknown>
      return {
        symbol,
        peRatio: (d.peRatio as number) ?? null,
        eps: (d.eps as number) ?? null,
        epsGrowth: (d.epsGrowth as number) ?? null,
        beta: (d.beta as number) ?? null,
        dividendYield: (d.dividendYield as number) ?? null,
        marketCap: (d.marketCap as number) ?? null,
        reportDate: row.report_date || '',
      }
    })
  }

  async cacheFundamentals(symbol: string, fundamentals: FundamentalData[]): Promise<void> {
    if (fundamentals.length === 0) return

    const records = fundamentals.map(f => ({
      symbol,
      data_type: 'ratios' as const,
      period: f.reportDate,
      report_date: f.reportDate,
      data: {
        peRatio: f.peRatio,
        eps: f.eps,
        epsGrowth: f.epsGrowth,
        beta: f.beta,
        dividendYield: f.dividendYield,
        marketCap: f.marketCap,
      },
      fetched_at: new Date().toISOString(),
    }))

    // Upsert each record
    for (const record of records) {
      const { error } = await supabase
        .from('fundamental_data_cache')
        .upsert(record, { onConflict: 'symbol,data_type,period' })

      if (error) {
        console.error('Error caching fundamental data:', error)
      }
    }
  }

  async isFresh(
    symbol: string,
    maxAgeMs: number = FUNDAMENTAL_CACHE_MAX_AGE_MS
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('fundamental_data_cache')
      .select('fetched_at')
      .eq('symbol', symbol)
      .eq('data_type', 'ratios')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return false

    const fetchedAt = new Date(data.fetched_at).getTime()
    const now = Date.now()
    return (now - fetchedAt) < maxAgeMs
  }
}
