/**
 * Hook for running backtests and saving results.
 */

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'
import { runBacktest } from '@/engine/backtest-runner'
import type { FullStrategyConfig } from '@/types/strategy-config'
import type { BacktestOutput, BacktestProgress } from '@/engine/types'

export function useBacktest() {
  const { user } = useAuth()
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<BacktestProgress | null>(null)
  const [result, setResult] = useState<BacktestOutput | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (
    strategyId: string,
    config: FullStrategyConfig,
    startDate: string,
    endDate: string
  ): Promise<BacktestOutput | null> => {
    if (!user) return null

    setRunning(true)
    setResult(null)
    setError(null)
    setProgress(null)

    try {
      const output = await runBacktest({
        config,
        startDate,
        endDate,
        onProgress: setProgress,
      })

      setResult(output)

      // Save result to database
      await supabase.from('backtest_results').insert({
        user_id: user.id,
        strategy_id: strategyId,
        strategy_config: config as unknown as import('@/types/database').Json,
        start_date: startDate,
        end_date: endDate,
        initial_capital: config.initialCapital,
        final_capital: output.metrics.finalCapital,
        metrics: output.metrics as unknown as import('@/types/database').Json,
        trades: output.trades as unknown as import('@/types/database').Json,
        equity_curve: output.equityCurve as unknown as import('@/types/database').Json,
        signal_attribution: output.attribution as unknown as import('@/types/database').Json,
      })

      return output
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Backtest failed'
      setError(msg)
      return null
    } finally {
      setRunning(false)
    }
  }, [user])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setProgress(null)
  }, [])

  return {
    run,
    running,
    progress,
    result,
    error,
    reset,
  }
}
