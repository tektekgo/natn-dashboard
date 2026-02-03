/**
 * Signal attribution component (Phase 4C).
 * Shows per-signal accuracy metrics.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { SignalAttribution as SignalAttributionType } from '@/engine/types'

interface SignalAttributionProps {
  attribution: SignalAttributionType[]
}

export default function SignalAttribution({ attribution }: SignalAttributionProps) {
  if (attribution.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signal Attribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attribution.map(attr => (
            <div key={attr.signalType} className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold text-foreground capitalize mb-3">
                {attr.signalType} Signal
              </h4>

              <div className="space-y-2">
                <AttributionRow label="Total Signals" value={String(attr.totalSignals)} />
                <AttributionRow label="Buy Signals" value={String(attr.buySignals)} />
                <AttributionRow label="Sell Signals" value={String(attr.sellSignals)} />
                <AttributionRow
                  label="Buy Accuracy"
                  value={`${attr.buyAccuracy.toFixed(1)}%`}
                  highlight={attr.buyAccuracy >= 50}
                />
                <AttributionRow
                  label="Avg Score (Winning)"
                  value={attr.avgScoreOnWin.toFixed(1)}
                />
                <AttributionRow
                  label="Avg Score (Losing)"
                  value={attr.avgScoreOnLoss.toFixed(1)}
                />
              </div>

              {/* Accuracy bar */}
              <div className="mt-3">
                <Progress
                  value={Math.min(attr.buyAccuracy, 100)}
                  className={attr.buyAccuracy >= 50 ? '[&>div]:bg-success' : '[&>div]:bg-destructive'}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AttributionRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono ${highlight ? 'font-semibold text-success' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  )
}
