/**
 * Colored pass/fail badges for risk check results, with educational tooltips.
 */

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ParsedRiskChecks } from '@/types/bot-activity'

interface RiskChecksBadgesProps {
  riskChecks: ParsedRiskChecks
}

function Badge({ label, value, ok, tip }: { label: string; value: string; ok: boolean; tip: string }) {
  const colorClasses = ok
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : 'bg-red-500/15 text-red-400 border-red-500/30'

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium cursor-help ${colorClasses}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {label}: {value}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs">{tip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function RiskChecksBadges({ riskChecks }: RiskChecksBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        label="Daily Trades"
        value={`${riskChecks.dailyTrades.current}/${riskChecks.dailyTrades.limit}`}
        ok={riskChecks.dailyTrades.ok}
        tip="Limits how many trades the bot can place in a single day. Prevents over-trading which can rack up fees and increase risk. If this limit is hit, no more orders are placed until tomorrow."
      />
      <Badge
        label="Daily P&L"
        value={`${riskChecks.dailyPl.percent.toFixed(2)}%`}
        ok={riskChecks.dailyPl.ok}
        tip="Tracks today's profit or loss as a percentage of your portfolio. If losses exceed the configured limit, the bot halts to prevent further drawdown. This is your 'circuit breaker' for bad days."
      />
      <Badge
        label="Exposure"
        value={`$${Math.round(riskChecks.exposure.current).toLocaleString()} / $${Math.round(riskChecks.exposure.max).toLocaleString()}`}
        ok={riskChecks.exposure.ok}
        tip="Total dollar value currently invested in open positions vs. the maximum allowed. Prevents the bot from putting too much of your portfolio at risk at once. A key measure of portfolio concentration."
      />
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        riskChecks.allPassed
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          : 'bg-red-500/15 text-red-400 border-red-500/30'
      }`}>
        {riskChecks.allPassed ? 'All Passed' : 'Failed'}
      </span>
    </div>
  )
}
