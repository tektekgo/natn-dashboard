/**
 * Backtest result page.
 * Shows metrics, charts, and trade table for a completed backtest.
 */

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
      <div className="space-y-6">
        <Skeleton className="h-8 w-96" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Backtest result not found.</p>
        <Link to="/dashboard" className="text-primary hover:text-primary/80 mt-2 inline-block">
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
          <h1 className="text-2xl font-bold text-foreground">
            {data.strategy_config.name} - Backtest Results
          </h1>
          <p className="text-muted-foreground mt-1">
            {data.start_date} to {data.end_date}
          </p>
        </div>
        <Link to="/strategies" className="text-primary hover:text-primary/80 text-sm font-medium">
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
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <EquityCurveChart data={data.equity_curve} />
        </CardContent>
      </Card>

      {/* Drawdown */}
      <Card>
        <CardHeader>
          <CardTitle>Drawdown</CardTitle>
        </CardHeader>
        <CardContent>
          <DrawdownChart equityCurve={data.equity_curve} />
        </CardContent>
      </Card>

      {/* Trade P&L Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Trade P&L Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricsBarChart trades={data.trades} />
        </CardContent>
      </Card>

      {/* Signal Attribution */}
      {data.signal_attribution && data.signal_attribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Signal Attribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.signal_attribution.map(attr => (
                <div key={attr.signalType} className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold text-foreground capitalize mb-2">{attr.signalType} Signal</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">Buy Signals: <span className="font-mono">{attr.buySignals}</span></p>
                    <p className="text-muted-foreground">Buy Accuracy: <span className="font-mono font-semibold">{attr.buyAccuracy.toFixed(1)}%</span></p>
                    <p className="text-muted-foreground">Avg Score (Win): <span className="font-mono">{attr.avgScoreOnWin.toFixed(1)}</span></p>
                    <p className="text-muted-foreground">Avg Score (Loss): <span className="font-mono">{attr.avgScoreOnLoss.toFixed(1)}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trade Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead className="text-right">Entry Price</TableHead>
                <TableHead className="text-right">Exit Price</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">P&L %</TableHead>
                <TableHead className="text-right">Days</TableHead>
                <TableHead>Exit Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.trades.map(trade => (
                <TableRow key={trade.id}>
                  <TableCell className="font-mono font-medium">{trade.symbol}</TableCell>
                  <TableCell className="text-muted-foreground">{trade.entryDate}</TableCell>
                  <TableCell className="text-muted-foreground">{trade.exitDate}</TableCell>
                  <TableCell className="text-right font-mono">${trade.entryPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono">${trade.exitPrice.toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-mono ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${trade.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-right font-mono ${trade.pnlPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{trade.holdingDays}</TableCell>
                  <TableCell className="text-muted-foreground text-xs capitalize">{trade.exitReason.replace('_', ' ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className={`text-2xl font-bold font-mono ${
          positive === undefined ? 'text-foreground' :
          positive ? 'text-success' : 'text-destructive'
        }`}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}
