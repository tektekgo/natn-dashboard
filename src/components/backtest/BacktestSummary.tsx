/**
 * Backtest summary component.
 * Displays key metrics as a card grid with educational tooltips.
 */

import { HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { METRIC_EDUCATION, getMetricGrade, GRADE_COLORS, GRADE_LABELS } from '@/lib/metric-education'
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
            metricKey="totalReturn"
            label="Total Return"
            value={`${m.totalReturn >= 0 ? '+' : ''}${m.totalReturn.toFixed(2)}%`}
            rawValue={m.totalReturn}
            subValue={`$${m.totalReturnDollar.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            positive={m.totalReturn >= 0}
          />
          <MetricItem
            metricKey="annualizedReturn"
            label="Annualized Return"
            value={`${m.annualizedReturn >= 0 ? '+' : ''}${m.annualizedReturn.toFixed(2)}%`}
            rawValue={m.annualizedReturn}
            positive={m.annualizedReturn >= 0}
          />
          <MetricItem
            metricKey="sharpeRatio"
            label="Sharpe Ratio"
            value={m.sharpeRatio.toFixed(2)}
            rawValue={m.sharpeRatio}
            positive={m.sharpeRatio >= 1}
          />
          <MetricItem
            metricKey="maxDrawdown"
            label="Max Drawdown"
            value={`${m.maxDrawdown.toFixed(2)}%`}
            rawValue={m.maxDrawdown}
            positive={false}
          />
          <MetricItem
            metricKey="winRate"
            label="Win Rate"
            value={`${m.winRate.toFixed(1)}%`}
            rawValue={m.winRate}
            subValue={`${m.winningTrades}W / ${m.losingTrades}L`}
            positive={m.winRate >= 50}
          />
          <MetricItem
            metricKey="profitFactor"
            label="Profit Factor"
            value={m.profitFactor === Infinity ? 'Perfect' : m.profitFactor.toFixed(2)}
            rawValue={m.profitFactor === Infinity ? 5 : m.profitFactor}
            positive={m.profitFactor >= 1}
          />
          <MetricItem
            metricKey="bestTrade"
            label="Best Trade"
            value={`+${m.bestTrade.toFixed(2)}%`}
            rawValue={m.bestTrade}
            positive
          />
          <MetricItem
            metricKey="worstTrade"
            label="Worst Trade"
            value={`${m.worstTrade.toFixed(2)}%`}
            rawValue={m.worstTrade}
            positive={false}
          />
          <MetricItem
            metricKey="avgHoldingDays"
            label="Avg Holding"
            value={`${m.avgHoldingDays.toFixed(0)} days`}
            rawValue={m.avgHoldingDays}
          />
          <MetricItem
            metricKey="totalTrades"
            label="Total Trades"
            value={String(m.totalTrades)}
            rawValue={m.totalTrades}
          />
          <MetricItem
            metricKey="initialCapital"
            label="Initial Capital"
            value={`$${m.initialCapital.toLocaleString()}`}
            rawValue={m.initialCapital}
          />
          <MetricItem
            metricKey="finalCapital"
            label="Final Capital"
            value={`$${m.finalCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            rawValue={m.finalCapital}
            positive={m.finalCapital >= m.initialCapital}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function MetricItem({
  metricKey,
  label,
  value,
  rawValue,
  subValue,
  positive,
}: {
  metricKey: string
  label: string
  value: string
  rawValue: number
  subValue?: string
  positive?: boolean
}) {
  const ed = METRIC_EDUCATION[metricKey]
  const grade = ed ? getMetricGrade(metricKey, rawValue) : null

  return (
    <div className="bg-muted rounded-lg p-3 relative">
      <p className={`text-lg font-bold font-mono ${
        positive === undefined ? 'text-foreground' :
        positive ? 'text-success' : 'text-destructive'
      }`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {subValue && <p className="text-xs text-muted-foreground/70 mt-0.5">{subValue}</p>}

      {ed && (
        <div className="absolute top-2 right-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-help">
                  <HelpCircle className="w-3 h-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{ed.shortDescription}</p>
                {grade && (
                  <p className={`text-xs font-medium mt-1 ${GRADE_COLORS[grade]}`}>
                    Rating: {GRADE_LABELS[grade]}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1 italic">{ed.proTip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}
