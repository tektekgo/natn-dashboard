/**
 * Expanded detail panel shown inline below a clicked execution row.
 * Shows risk check badges, action distribution donut, and per-symbol cards.
 */

import { Skeleton } from '@/components/ui/skeleton'
import ActionDistributionChart from '@/components/charts/ActionDistributionChart'
import RiskChecksBadges from './RiskChecksBadges'
import SymbolDetailCard from './SymbolDetailCard'
import LearnTip from './LearnTip'
import { parseRiskChecks, aggregateActions, ACTION_LABELS } from '@/lib/bot-activity-utils'
import type { BotExecution, BotExecutionDetail, DetailAction } from '@/types/bot-activity'

interface ExecutionDetailPanelProps {
  execution: BotExecution
  details: BotExecutionDetail[] | null
  loading: boolean
}

export default function ExecutionDetailPanel({ execution, details, loading }: ExecutionDetailPanelProps) {
  const riskChecks = parseRiskChecks(execution.risk_checks)

  if (loading || details === null) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const actionData = aggregateActions(details)

  return (
    <div className="p-4 space-y-4 bg-muted/20 rounded-b-lg">
      {/* Risk checks */}
      {riskChecks && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium inline-flex items-center">
            Risk Checks
            <LearnTip
              tip="Before executing any trades, the bot runs safety checks to protect your portfolio. If any check fails, the entire run is halted — no orders are placed."
              detail="These limits are configured in your strategy's risk settings. Green = within limits, Red = exceeded."
              side="right"
            />
          </p>
          <RiskChecksBadges riskChecks={riskChecks} />
        </div>
      )}

      {/* Error message */}
      {execution.error_message && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-xs font-medium text-red-400">{execution.error_message}</p>
        </div>
      )}

      {/* Action distribution + symbol cards */}
      {details.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No per-symbol details recorded for this execution.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Donut + legend */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium inline-flex items-center">
              Action Distribution
              <LearnTip
                tip="For each symbol, the bot decides one action: Buy (signal is strong), Sell TP (take profit — price hit your target), Sell SL (stop loss — cut losses), Skip (signals too weak), or Error (something went wrong)."
                detail="A healthy strategy typically shows a mix of buys and skips. Too many skips may mean thresholds are too strict."
                side="right"
              />
            </p>
            <div className="flex items-center gap-6">
              <ActionDistributionChart data={actionData} size={140} />
              <div className="space-y-1.5">
                {actionData.map(d => (
                  <div key={d.action} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-muted-foreground">{ACTION_LABELS[d.action as DetailAction]}</span>
                    <span className="text-foreground font-medium">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Symbol cards grid */}
          <div className="grid gap-3 md:grid-cols-2">
            {details.map(detail => (
              <SymbolDetailCard key={detail.id} detail={detail} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
