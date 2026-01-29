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
import InfoPanel from '@/components/common/InfoPanel'
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
  const { user, isOwner } = useAuth()
  const navigate = useNavigate()
  const isNew = !id

  const [config, setConfig] = useState<FullStrategyConfig>(DEFAULT_STRATEGY_CONFIG)
  const [strategyId, setStrategyId] = useState<string | null>(id || null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  // Trading mode state
  const [tradingMode, setTradingMode] = useState<'none' | 'paper' | 'live'>('none')
  const [lastExecutionAt, setLastExecutionAt] = useState<string | null>(null)
  const [executionStatus, setExecutionStatus] = useState<string | null>(null)
  const [hasBacktests, setHasBacktests] = useState(false)
  const [showActivateConfirm, setShowActivateConfirm] = useState(false)

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
        setTradingMode((data as Record<string, unknown>).trading_mode as 'none' | 'paper' | 'live' || 'none')
        setLastExecutionAt((data as Record<string, unknown>).last_execution_at as string | null)
        setExecutionStatus((data as Record<string, unknown>).execution_status as string | null)
      }
      setLoading(false)
    }

    async function checkBacktests() {
      const { count } = await supabase
        .from('backtest_results')
        .select('id', { count: 'exact', head: true })
        .eq('strategy_id', id!)
        .eq('user_id', user!.id)

      setHasBacktests((count || 0) > 0)
    }

    loadStrategy()
    checkBacktests()
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

  async function handleActivateForPaperTrading() {
    if (!user || !strategyId) return

    // Deactivate all other strategies first
    await supabase
      .from('strategies')
      .update({ trading_mode: 'none', activated_at: null })
      .eq('user_id', user.id)
      .neq('trading_mode', 'none')

    // Activate this one
    await supabase
      .from('strategies')
      .update({ trading_mode: 'paper', activated_at: new Date().toISOString() })
      .eq('id', strategyId)

    setTradingMode('paper')
    setShowActivateConfirm(false)
  }

  async function handleDeactivateTrading() {
    if (!strategyId) return

    await supabase
      .from('strategies')
      .update({ trading_mode: 'none', activated_at: null })
      .eq('id', strategyId)

    setTradingMode('none')
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
      setHasBacktests(true)

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

      {isNew && (
        <InfoPanel variant="info" title="Building Your Strategy">
          <p>
            Use the tabs below to configure each part of your strategy. Start by selecting <strong>Symbols</strong> (stocks to trade),
            then set <strong>Technical</strong> indicator rules (RSI, SMA), <strong>Fundamental</strong> filters
            (P/E ratio, earnings growth), adjust <strong>Weights</strong> to balance signal influence, and configure
            <strong> Risk</strong> controls (stop-loss, position sizing). Once saved, you can backtest it against historical data.
          </p>
        </InfoPanel>
      )}

      {/* Strategy Form */}
      <StrategyForm
        initialConfig={config}
        onSubmit={handleSave}
        submitLabel={saving ? 'Saving...' : (isNew ? 'Create Strategy' : 'Save Changes')}
        loading={saving}
      />

      {/* Trading Activation (Owner Only) */}
      {strategyId && isOwner && (
        <Card title="Trading Activation">
          <div className="space-y-4">
            {tradingMode === 'none' ? (
              <>
                <InfoPanel variant="info" title="Activate for Paper Trading">
                  <p>
                    When activated, the NATN trading bot will use this strategy to make paper trades on your
                    Alpaca account every 30 minutes. Only one strategy can be active at a time. You must run
                    at least one backtest before activating.
                  </p>
                </InfoPanel>

                {!hasBacktests && !backtestResult && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
                    Run at least one backtest before activating this strategy for trading.
                  </div>
                )}

                {showActivateConfirm ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-blue-800 font-medium">
                      Confirm: This strategy will be executed by the NATN trading bot every 30 minutes
                      on your Alpaca paper trading account. Any currently active strategy will be deactivated.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleActivateForPaperTrading}>
                        Yes, Activate
                      </Button>
                      <Button variant="secondary" onClick={() => setShowActivateConfirm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowActivateConfirm(true)}
                    disabled={!hasBacktests && !backtestResult}
                  >
                    Activate for Paper Trading
                  </Button>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                    tradingMode === 'paper'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {tradingMode === 'paper' ? 'Paper Trading Active' : 'Live Trading Active'}
                  </span>
                </div>

                {lastExecutionAt && (
                  <div className="text-sm text-gray-600">
                    Last executed: <span className="font-medium">{new Date(lastExecutionAt).toLocaleString()}</span>
                    {executionStatus && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        executionStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {executionStatus}
                      </span>
                    )}
                  </div>
                )}

                <Button variant="danger" onClick={handleDeactivateTrading}>
                  Deactivate Trading
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Backtest Section */}
      {strategyId && (
        <Card title="Run Backtest">
          <div className="space-y-4">
            <InfoPanel variant="learn" title="What is Backtesting?">
              <p>
                <strong>Backtesting</strong> simulates your strategy on historical market data to see how it
                would have performed in the past. Choose a date range below, then click "Run Backtest."
                The engine will replay market data day by day, applying your strategy rules to generate
                simulated trades, equity curves, and performance metrics. This helps you evaluate your
                strategy <em>before</em> using it in live (paper) trading.
              </p>
            </InfoPanel>
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
