/**
 * Hook for fetching saved backtest results.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'
import type { BacktestMetrics, ClosedTrade, PortfolioSnapshot, SignalAttribution } from '@/engine/types'
import type { FullStrategyConfig } from '@/types/strategy-config'

export interface SavedBacktestResult {
  id: string
  strategy_id: string
  strategy_config: FullStrategyConfig
  start_date: string
  end_date: string
  initial_capital: number
  final_capital: number
  metrics: BacktestMetrics
  trades: ClosedTrade[]
  equity_curve: PortfolioSnapshot[]
  signal_attribution: SignalAttribution[] | null
  created_at: string
}

export function useBacktestResults(strategyId?: string) {
  const { user } = useAuth()
  const [results, setResults] = useState<SavedBacktestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadResults = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    let query = supabase
      .from('backtest_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (strategyId) {
      query = query.eq('strategy_id', strategyId)
    }

    const { data, error: err } = await query.limit(50)

    if (err) {
      setError(err.message)
    } else {
      setResults((data || []) as unknown as SavedBacktestResult[])
    }
    setLoading(false)
  }, [user, strategyId])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  async function deleteResult(id: string): Promise<boolean> {
    const { error: err } = await supabase
      .from('backtest_results')
      .delete()
      .eq('id', id)

    if (err) {
      setError(err.message)
      return false
    }

    setResults(r => r.filter(res => res.id !== id))
    return true
  }

  return {
    results,
    loading,
    error,
    deleteResult,
    refresh: loadResults,
  }
}
