/**
 * Strategy comparison page (Phase 4B).
 * Side-by-side comparison of multiple strategies.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Card from '@/components/common/Card'
import ComparisonChart from '@/components/charts/ComparisonChart'
import type { ComparisonResult, BacktestMetrics, PortfolioSnapshot, ClosedTrade, SignalAttribution } from '@/engine/types'
import type { FullStrategyConfig } from '@/types/strategy-config'

interface BacktestRow {
  id: string
  strategy_config: FullStrategyConfig
  metrics: BacktestMetrics
  equity_curve: PortfolioSnapshot[]
  trades: ClosedTrade[]
  signal_attribution: SignalAttribution[]
  start_date: string
  end_date: string
  created_at: string
}

export default function ComparePage() {
  const { user } = useAuth()
  const [backtests, setBacktests] = useState<BacktestRow[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function loadBacktests() {
      const { data, error } = await supabase
        .from('backtest_results')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setBacktests(data as unknown as BacktestRow[])
      }
      setLoading(false)
    }

    loadBacktests()
  }, [user])

  function toggleSelection(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectedResults: ComparisonResult[] = backtests
    .filter(b => selected.has(b.id))
    .map(b => ({
      label: b.strategy_config.name || 'Unnamed',
      output: {
        config: b.strategy_config,
        startDate: b.start_date,
        endDate: b.end_date,
        metrics: b.metrics,
        trades: b.trades,
        equityCurve: b.equity_curve,
        attribution: b.signal_attribution || [],
        runTimestamp: b.created_at,
      },
    }))

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
        <h1 className="text-2xl font-bold text-gray-900">Compare Strategies</h1>
        <p className="text-gray-600 mt-1">
          Select backtests to compare their performance side by side.
        </p>
      </div>

      {/* Selection */}
      <Card title="Select Backtests">
        {backtests.length === 0 ? (
          <p className="text-gray-500 text-sm">No backtests available. Run a backtest first.</p>
        ) : (
          <div className="space-y-2">
            {backtests.map(bt => (
              <label
                key={bt.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                  selected.has(bt.id)
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(bt.id)}
                  onChange={() => toggleSelection(bt.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {bt.strategy_config.name || 'Unnamed'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {bt.start_date} to {bt.end_date} | Return: {bt.metrics.totalReturn.toFixed(2)}%
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Comparison Chart */}
      {selectedResults.length >= 2 && (
        <>
          <Card title="Equity Curve Comparison">
            <ComparisonChart results={selectedResults} />
          </Card>

          <Card title="Metrics Comparison">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500 font-medium">Strategy</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Return</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Sharpe</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Max DD</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Win Rate</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Trades</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Profit Factor</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedResults.map(r => (
                    <tr key={r.label} className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-900">{r.label}</td>
                      <td className={`py-2 text-right font-mono ${r.output.metrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {r.output.metrics.totalReturn.toFixed(2)}%
                      </td>
                      <td className="py-2 text-right font-mono">{r.output.metrics.sharpeRatio.toFixed(2)}</td>
                      <td className="py-2 text-right font-mono text-red-600">{r.output.metrics.maxDrawdown.toFixed(2)}%</td>
                      <td className="py-2 text-right font-mono">{r.output.metrics.winRate.toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono">{r.output.metrics.totalTrades}</td>
                      <td className="py-2 text-right font-mono">{r.output.metrics.profitFactor === Infinity ? 'inf' : r.output.metrics.profitFactor.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {selectedResults.length === 1 && (
        <Card>
          <p className="text-center text-gray-500 py-4">Select at least 2 backtests to compare.</p>
        </Card>
      )}
    </div>
  )
}
