/**
 * Backtest result page.
 * Shows metrics, charts, and trade table for a completed backtest.
 */

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useBenchmark } from '@/hooks/useBenchmark'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import EquityCurveWithBenchmark from '@/components/charts/EquityCurveWithBenchmark'
import DrawdownChart from '@/components/charts/DrawdownChart'
import MetricsBarChart from '@/components/charts/MetricsBarChart'
import MetricCardWithEducation from '@/components/backtest/MetricCardWithEducation'
import EducationalChartHeader from '@/components/backtest/EducationalChartHeader'
import StrategyReportCard from '@/components/backtest/StrategyReportCard'
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

  const { spyReturn, spyEquityCurve, loading: benchmarkLoading } = useBenchmark(
    data?.start_date,
    data?.end_date,
    data?.initial_capital
  )

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

      {/* Strategy Report Card */}
      <StrategyReportCard
        metrics={m}
        startDate={data.start_date}
        endDate={data.end_date}
        initialCapital={data.initial_capital}
        spyReturn={spyReturn}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCardWithEducation
          metricKey="totalReturn"
          value={`${m.totalReturn >= 0 ? '+' : ''}${m.totalReturn.toFixed(2)}%`}
          rawValue={m.totalReturn}
          positive={m.totalReturn >= 0}
        />
        <MetricCardWithEducation
          metricKey="sharpeRatio"
          value={m.sharpeRatio.toFixed(2)}
          rawValue={m.sharpeRatio}
          positive={m.sharpeRatio >= 1}
        />
        <MetricCardWithEducation
          metricKey="maxDrawdown"
          value={`${m.maxDrawdown.toFixed(2)}%`}
          rawValue={m.maxDrawdown}
          positive={false}
        />
        <MetricCardWithEducation
          metricKey="winRate"
          value={`${m.winRate.toFixed(1)}%`}
          rawValue={m.winRate}
          positive={m.winRate >= 50}
        />
        <MetricCardWithEducation
          metricKey="profitFactor"
          value={m.profitFactor === Infinity ? 'inf' : m.profitFactor.toFixed(2)}
          rawValue={m.profitFactor === Infinity ? 5 : m.profitFactor}
          positive={m.profitFactor >= 1}
        />
        <MetricCardWithEducation
          metricKey="totalTrades"
          value={String(m.totalTrades)}
          rawValue={m.totalTrades}
        />
        <MetricCardWithEducation
          metricKey="avgWinPercent"
          value={`+${m.avgWinPercent.toFixed(2)}%`}
          rawValue={m.avgWinPercent}
          positive
        />
        <MetricCardWithEducation
          metricKey="avgLossPercent"
          value={`${m.avgLossPercent.toFixed(2)}%`}
          rawValue={m.avgLossPercent}
          positive={false}
        />
      </div>

      {/* Equity Curve */}
      <Card>
        <EducationalChartHeader
          title="Equity Curve"
          learnTitle="Understanding the Equity Curve"
          learnContent="This chart shows your portfolio value over time. An upward-sloping curve indicates consistent gains, while sharp dips reveal drawdown periods. The dashed gray line (when available) shows the S&P 500 for comparison — if your strategy line is above it, you're outperforming the market."
        />
        <CardContent>
          <EquityCurveWithBenchmark
            data={data.equity_curve}
            benchmarkData={spyEquityCurve}
            benchmarkLoading={benchmarkLoading}
          />
        </CardContent>
      </Card>

      {/* Drawdown */}
      <Card>
        <EducationalChartHeader
          title="Drawdown"
          learnTitle="Understanding Drawdown"
          learnContent="Drawdown measures peak-to-trough decline in your portfolio. Each dip below 0% shows how much you would have lost from the most recent high point. Shallower and shorter drawdowns indicate better risk management. The deepest point is your Max Drawdown — the worst-case scenario during this backtest."
        />
        <CardContent>
          <DrawdownChart equityCurve={data.equity_curve} />
        </CardContent>
      </Card>

      {/* Trade P&L Distribution */}
      <Card>
        <EducationalChartHeader
          title="Trade P&L Distribution"
          learnTitle="Understanding Trade P&L"
          learnContent="Each bar represents one trade's profit or loss as a percentage. Green bars are winning trades, red bars are losing trades. Ideally, you want many green bars and small red bars. If a few large green bars account for most of your profit, the strategy may be reliant on outliers rather than a consistent edge."
        />
        <CardContent>
          <MetricsBarChart trades={data.trades} />
        </CardContent>
      </Card>

      {/* Signal Attribution */}
      {data.signal_attribution && data.signal_attribution.length > 0 && (
        <Card>
          <EducationalChartHeader
            title="Signal Attribution"
            learnTitle="Understanding Signal Attribution"
            learnContent="Signal attribution breaks down how each signal type (technical, fundamental) contributed to your trades. It shows how many buy signals each type generated, their accuracy rate, and the average signal score on winning vs. losing trades. This helps you understand which signals are driving performance."
          />
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
        <EducationalChartHeader
          title="Trades"
          learnTitle="Understanding the Trade Log"
          learnContent="This table lists every trade your strategy executed during the backtest. Each row is a complete round-trip (buy and sell). The exit reason tells you why the position was closed: take_profit means your target was hit, stop_loss means your risk limit was triggered, and signal_sell means the strategy detected a sell signal."
        />
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
