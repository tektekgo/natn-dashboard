/**
 * Strategy detail page.
 * Strategy builder + "Run Backtest" button.
 * Handles both create and edit modes.
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import StrategyForm from '@/components/strategy/StrategyForm'
import BacktestProgress from '@/components/backtest/BacktestProgress'
import BacktestSummary from '@/components/backtest/BacktestSummary'
import TradeTable from '@/components/backtest/TradeTable'
import EquityCurveChart from '@/components/charts/EquityCurveChart'
import DrawdownChart from '@/components/charts/DrawdownChart'
import SignalAttribution from '@/components/backtest/SignalAttribution'
import { DEFAULT_STRATEGY_CONFIG, type FullStrategyConfig } from '@/types/strategy-config'
import { runBacktest } from '@/engine/backtest-runner'
import type { BacktestOutput, BacktestProgress as BacktestProgressType } from '@/engine/types'
import { format, subMonths } from 'date-fns'

export default function StrategyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isNew = !id

  const [config, setConfig] = useState<FullStrategyConfig>(DEFAULT_STRATEGY_CONFIG)
  const [strategyId, setStrategyId] = useState<string | null>(id || null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  // Backtest state
  const [backtestRunning, setBacktestRunning] = useState(false)
  const [backtestProgress, setBacktestProgress] = useState<BacktestProgressType | null>(null)
  const [backtestResult, setBacktestResult] = useState<BacktestOutput | null>(null)
  const [backtestError, setBacktestError] = useState<string | null>(null)

  // Date range for backtest
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 6), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Load existing strategy
  useEffect(() => {
    if (!id || !user) return

    async function loadStrategy() {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single()

      if (!error && data) {
        setConfig(data.config as unknown as FullStrategyConfig)
        setStrategyId(data.id)
      }
      setLoading(false)
    }

    loadStrategy()
  }, [id, user])

  async function handleSave(updatedConfig: FullStrategyConfig) {
    if (!user) return
    setSaving(true)

    try {
      if (strategyId) {
        // Update existing
        await supabase
          .from('strategies')
          .update({
            name: updatedConfig.name,
            description: updatedConfig.description,
            config: updatedConfig as unknown as import('@/types/database').Json,
          })
          .eq('id', strategyId)
      } else {
        // Create new
        const { data } = await supabase
          .from('strategies')
          .insert({
            user_id: user.id,
            name: updatedConfig.name,
            description: updatedConfig.description,
            config: updatedConfig as unknown as import('@/types/database').Json,
          })
          .select('id')
          .single()

        if (data) {
          setStrategyId(data.id)
          navigate(`/strategies/${data.id}`, { replace: true })
        }
      }

      setConfig(updatedConfig)
    } finally {
      setSaving(false)
    }
  }

  async function handleRunBacktest() {
    if (!user || !strategyId) return

    setBacktestRunning(true)
    setBacktestResult(null)
    setBacktestError(null)
    setBacktestProgress(null)

    try {
      const result = await runBacktest({
        config,
        startDate,
        endDate,
        onProgress: setBacktestProgress,
      })

      setBacktestResult(result)

      // Save to database
      await supabase.from('backtest_results').insert({
        user_id: user.id,
        strategy_id: strategyId,
        strategy_config: config as unknown as import('@/types/database').Json,
        start_date: startDate,
        end_date: endDate,
        initial_capital: config.initialCapital,
        final_capital: result.metrics.finalCapital,
        metrics: result.metrics as unknown as import('@/types/database').Json,
        trades: result.trades as unknown as import('@/types/database').Json,
        equity_curve: result.equityCurve as unknown as import('@/types/database').Json,
        signal_attribution: result.attribution as unknown as import('@/types/database').Json,
      })
    } catch (err) {
      setBacktestError(err instanceof Error ? err.message : 'Backtest failed')
    } finally {
      setBacktestRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Create Strategy' : `Edit: ${config.name}`}
        </h1>
        <p className="text-gray-600 mt-1">
          Configure your strategy parameters and run a backtest.
        </p>
      </div>

      {/* Strategy Form */}
      <StrategyForm
        initialConfig={config}
        onSubmit={handleSave}
        submitLabel={saving ? 'Saving...' : (isNew ? 'Create Strategy' : 'Save Changes')}
        loading={saving}
      />

      {/* Backtest Section */}
      {strategyId && (
        <Card title="Run Backtest">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>

            <Button
              onClick={handleRunBacktest}
              loading={backtestRunning}
              disabled={backtestRunning || config.symbols.length === 0}
            >
              Run Backtest
            </Button>

            {backtestRunning && backtestProgress && (
              <BacktestProgress progress={backtestProgress} />
            )}

            {backtestError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {backtestError}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Backtest Results */}
      {backtestResult && (
        <>
          <BacktestSummary metrics={backtestResult.metrics} />

          <Card title="Equity Curve">
            <EquityCurveChart data={backtestResult.equityCurve} />
          </Card>

          <Card title="Drawdown">
            <DrawdownChart equityCurve={backtestResult.equityCurve} />
          </Card>

          <SignalAttribution attribution={backtestResult.attribution} />

          <TradeTable trades={backtestResult.trades} />
        </>
      )}
    </div>
  )
}
