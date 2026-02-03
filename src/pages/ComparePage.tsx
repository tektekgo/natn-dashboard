/**
 * Strategy comparison page (Phase 4B).
 * Side-by-side comparison of multiple strategies.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { InfoPanel } from '@/components/ui/info-panel'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compare Strategies</h1>
        <p className="text-muted-foreground mt-1">
          Select backtests to compare their performance side by side.
        </p>
      </div>

      <InfoPanel variant="learn" title="Why Compare Strategies?">
        <p>
          Comparing strategies is one of the most powerful ways to learn about trading. By looking at the same
          time period with different rules, you can see how each decision (indicator settings, risk limits,
          stock selection) affects performance. Key metrics to compare:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Total Return</strong> — overall profit/loss percentage.</li>
          <li><strong>Sharpe Ratio</strong> — risk-adjusted return. Higher = better return per unit of risk. Above 1.0 is generally good.</li>
          <li><strong>Max Drawdown</strong> — the largest peak-to-trough decline. Lower = less painful drops.</li>
          <li><strong>Win Rate</strong> — percentage of trades that were profitable.</li>
          <li><strong>Profit Factor</strong> — gross profits / gross losses. Above 1.0 means you made more than you lost.</li>
        </ul>
      </InfoPanel>

      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Backtests</CardTitle>
          <CardDescription>Check at least 2 backtests to compare their performance.</CardDescription>
        </CardHeader>
        <CardContent>
          {backtests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No backtests available. Run a backtest first.</p>
          ) : (
            <div className="space-y-2">
              {backtests.map(bt => (
                <label
                  key={bt.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                    selected.has(bt.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(bt.id)}
                    onChange={() => toggleSelection(bt.id)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {bt.strategy_config.name || 'Unnamed'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bt.start_date} to {bt.end_date} | Return: {bt.metrics.totalReturn.toFixed(2)}%
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      {selectedResults.length >= 2 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Equity Curve Comparison</CardTitle>
              <CardDescription>How each strategy's portfolio value changed over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <ComparisonChart results={selectedResults} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metrics Comparison</CardTitle>
              <CardDescription>Side-by-side performance metrics for selected strategies.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead>
                    <TableHead className="text-right">Return</TableHead>
                    <TableHead className="text-right">Sharpe</TableHead>
                    <TableHead className="text-right">Max DD</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">Profit Factor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedResults.map(r => (
                    <TableRow key={r.label}>
                      <TableCell className="font-medium">{r.label}</TableCell>
                      <TableCell className={`text-right font-mono ${r.output.metrics.totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {r.output.metrics.totalReturn.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right font-mono">{r.output.metrics.sharpeRatio.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono text-destructive">{r.output.metrics.maxDrawdown.toFixed(2)}%</TableCell>
                      <TableCell className="text-right font-mono">{r.output.metrics.winRate.toFixed(1)}%</TableCell>
                      <TableCell className="text-right font-mono">{r.output.metrics.totalTrades}</TableCell>
                      <TableCell className="text-right font-mono">{r.output.metrics.profitFactor === Infinity ? 'inf' : r.output.metrics.profitFactor.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {selectedResults.length === 1 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-4">Select at least 2 backtests to compare.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
