/**
 * Backtest summary component.
 * Displays key metrics as a card grid.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BacktestMetrics } from '@/engine/types'

interface BacktestSummaryProps {
  metrics: BacktestMetrics
}

export default function BacktestSummary({ metrics: m }: BacktestSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricItem
            label="Total Return"
            value={`${m.totalReturn >= 0 ? '+' : ''}${m.totalReturn.toFixed(2)}%`}
            subValue={`$${m.totalReturnDollar.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            positive={m.totalReturn >= 0}
          />
          <MetricItem
            label="Annualized Return"
            value={`${m.annualizedReturn >= 0 ? '+' : ''}${m.annualizedReturn.toFixed(2)}%`}
            positive={m.annualizedReturn >= 0}
          />
          <MetricItem
            label="Sharpe Ratio"
            value={m.sharpeRatio.toFixed(2)}
            positive={m.sharpeRatio >= 1}
          />
          <MetricItem
            label="Max Drawdown"
            value={`${m.maxDrawdown.toFixed(2)}%`}
            positive={false}
          />
          <MetricItem
            label="Win Rate"
            value={`${m.winRate.toFixed(1)}%`}
            subValue={`${m.winningTrades}W / ${m.losingTrades}L`}
            positive={m.winRate >= 50}
          />
          <MetricItem
            label="Profit Factor"
            value={m.profitFactor === Infinity ? 'Perfect' : m.profitFactor.toFixed(2)}
            positive={m.profitFactor >= 1}
          />
          <MetricItem
            label="Best Trade"
            value={`+${m.bestTrade.toFixed(2)}%`}
            positive
          />
          <MetricItem
            label="Worst Trade"
            value={`${m.worstTrade.toFixed(2)}%`}
            positive={false}
          />
          <MetricItem
            label="Avg Holding"
            value={`${m.avgHoldingDays.toFixed(0)} days`}
          />
          <MetricItem
            label="Total Trades"
            value={String(m.totalTrades)}
          />
          <MetricItem
            label="Initial Capital"
            value={`$${m.initialCapital.toLocaleString()}`}
          />
          <MetricItem
            label="Final Capital"
            value={`$${m.finalCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            positive={m.finalCapital >= m.initialCapital}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function MetricItem({
  label,
  value,
  subValue,
  positive,
}: {
  label: string
  value: string
  subValue?: string
  positive?: boolean
}) {
  return (
    <div className="bg-muted rounded-lg p-3">
      <p className={`text-lg font-bold font-mono ${
        positive === undefined ? 'text-foreground' :
        positive ? 'text-success' : 'text-destructive'
      }`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {subValue && <p className="text-xs text-muted-foreground/70 mt-0.5">{subValue}</p>}
    </div>
  )
}
