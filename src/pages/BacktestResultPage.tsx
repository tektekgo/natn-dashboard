/**
 * Backtest result page.
 * Shows metrics, charts, and trade table for a completed backtest.
 */

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Card from '@/components/common/Card'
import EquityCurveChart from '@/components/charts/EquityCurveChart'
import DrawdownChart from '@/components/charts/DrawdownChart'
import MetricsBarChart from '@/components/charts/MetricsBarChart'
import type { BacktestMetrics, ClosedTrade, PortfolioSnapshot, SignalAttribution } from '@/engine/types'

interface BacktestData {
  id: string
  strategy_config: { name: string }
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

export default function BacktestResultPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [data, setData] = useState<BacktestData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !id) return

    async function loadResult() {
      const { data: result, error } = await supabase
        .from('backtest_results')
        .select('*')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single()

      if (!error && result) {
        setData(result as unknown as BacktestData)
      }
      setLoading(false)
    }

    loadResult()
  }, [user, id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Backtest result not found.</p>
        <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const m = data.metrics

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {data.strategy_config.name} - Backtest Results
          </h1>
          <p className="text-gray-600 mt-1">
            {data.start_date} to {data.end_date}
          </p>
        </div>
        <Link to="/strategies" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Back to Strategies
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Return" value={`${m.totalReturn >= 0 ? '+' : ''}${m.totalReturn.toFixed(2)}%`} positive={m.totalReturn >= 0} />
        <MetricCard label="Sharpe Ratio" value={m.sharpeRatio.toFixed(2)} positive={m.sharpeRatio >= 1} />
        <MetricCard label="Max Drawdown" value={`${m.maxDrawdown.toFixed(2)}%`} positive={false} />
        <MetricCard label="Win Rate" value={`${m.winRate.toFixed(1)}%`} positive={m.winRate >= 50} />
        <MetricCard label="Profit Factor" value={m.profitFactor === Infinity ? 'inf' : m.profitFactor.toFixed(2)} positive={m.profitFactor >= 1} />
        <MetricCard label="Total Trades" value={String(m.totalTrades)} />
        <MetricCard label="Avg Win" value={`+${m.avgWinPercent.toFixed(2)}%`} positive />
        <MetricCard label="Avg Loss" value={`${m.avgLossPercent.toFixed(2)}%`} positive={false} />
      </div>

      {/* Equity Curve */}
      <Card title="Equity Curve">
        <EquityCurveChart data={data.equity_curve} />
      </Card>

      {/* Drawdown */}
      <Card title="Drawdown">
        <DrawdownChart equityCurve={data.equity_curve} />
      </Card>

      {/* Trade P&L Distribution */}
      <Card title="Trade P&L Distribution">
        <MetricsBarChart trades={data.trades} />
      </Card>

      {/* Signal Attribution */}
      {data.signal_attribution && data.signal_attribution.length > 0 && (
        <Card title="Signal Attribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.signal_attribution.map(attr => (
              <div key={attr.signalType} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 capitalize mb-2">{attr.signalType} Signal</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Buy Signals: <span className="font-mono">{attr.buySignals}</span></p>
                  <p className="text-gray-600">Buy Accuracy: <span className="font-mono font-semibold">{attr.buyAccuracy.toFixed(1)}%</span></p>
                  <p className="text-gray-600">Avg Score (Win): <span className="font-mono">{attr.avgScoreOnWin.toFixed(1)}</span></p>
                  <p className="text-gray-600">Avg Score (Loss): <span className="font-mono">{attr.avgScoreOnLoss.toFixed(1)}</span></p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trade Table */}
      <Card title="Trades">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">Symbol</th>
                <th className="text-left py-2 text-gray-500 font-medium">Entry</th>
                <th className="text-left py-2 text-gray-500 font-medium">Exit</th>
                <th className="text-right py-2 text-gray-500 font-medium">Entry Price</th>
                <th className="text-right py-2 text-gray-500 font-medium">Exit Price</th>
                <th className="text-right py-2 text-gray-500 font-medium">P&L</th>
                <th className="text-right py-2 text-gray-500 font-medium">P&L %</th>
                <th className="text-right py-2 text-gray-500 font-medium">Days</th>
                <th className="text-left py-2 text-gray-500 font-medium">Exit Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.trades.map(trade => (
                <tr key={trade.id} className="border-b border-gray-100">
                  <td className="py-2 font-mono font-medium">{trade.symbol}</td>
                  <td className="py-2 text-gray-600">{trade.entryDate}</td>
                  <td className="py-2 text-gray-600">{trade.exitDate}</td>
                  <td className="py-2 text-right font-mono">${trade.entryPrice.toFixed(2)}</td>
                  <td className="py-2 text-right font-mono">${trade.exitPrice.toFixed(2)}</td>
                  <td className={`py-2 text-right font-mono ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${trade.pnl.toFixed(2)}
                  </td>
                  <td className={`py-2 text-right font-mono ${trade.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                  </td>
                  <td className="py-2 text-right text-gray-600">{trade.holdingDays}</td>
                  <td className="py-2 text-gray-500 text-xs capitalize">{trade.exitReason.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function MetricCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="card text-center">
      <p className={`text-2xl font-bold font-mono ${
        positive === undefined ? 'text-gray-900' :
        positive ? 'text-green-600' : 'text-red-600'
      }`}>
        {value}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
