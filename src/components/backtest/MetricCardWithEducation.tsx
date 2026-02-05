/**
 * Metric card with hover tooltip and expandable education panel.
 * Replaces the inline MetricCard in BacktestResultPage.
 */

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoPanel } from '@/components/ui/info-panel'
import {
  METRIC_EDUCATION,
  getMetricGrade,
  GRADE_COLORS,
  GRADE_LABELS,
  type MetricGrade,
} from '@/lib/metric-education'

interface MetricCardWithEducationProps {
  metricKey: string
  value: string
  rawValue: number
  positive?: boolean
  subValue?: string
}

export default function MetricCardWithEducation({
  metricKey,
  value,
  rawValue,
  positive,
  subValue,
}: MetricCardWithEducationProps) {
  const [expanded, setExpanded] = useState(false)
  const ed = METRIC_EDUCATION[metricKey]
  const grade: MetricGrade | null = ed ? getMetricGrade(metricKey, rawValue) : null

  return (
    <div className="space-y-0">
      <Card>
        <CardContent className="pt-6 text-center relative">
          <p
            className={`text-2xl font-bold font-mono ${
              positive === undefined
                ? 'text-foreground'
                : positive
                  ? 'text-success'
                  : 'text-destructive'
            }`}
          >
            {value}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{ed?.label ?? metricKey}</p>
          {subValue && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">{subValue}</p>
          )}

          {grade && (
            <p className={`text-xs font-medium mt-1 ${GRADE_COLORS[grade]}`}>
              {GRADE_LABELS[grade]}
            </p>
          )}

          {ed && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      aria-label={`Learn about ${ed.label}`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs">{ed.shortDescription}</p>
                    {grade && (
                      <p className={`text-xs font-medium mt-1 ${GRADE_COLORS[grade]}`}>
                        Current: {GRADE_LABELS[grade]}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </CardContent>
      </Card>

      {expanded && ed && (
        <InfoPanel variant="learn" className="mt-2 text-left">
          <p className="font-semibold text-xs mb-1">{ed.label}</p>
          <p className="text-xs mb-2">{ed.fullDescription}</p>
          <p className="text-xs font-medium mb-1">Why it matters:</p>
          <p className="text-xs mb-2">{ed.whyItMatters}</p>
          <p className="text-xs font-medium mb-1">Pro Tip:</p>
          <p className="text-xs mb-1">{ed.proTip}</p>
          {ed.sp500Typical !== 'N/A' && (
            <p className="text-xs text-muted-foreground mt-1">
              S&P 500 typical: {ed.sp500Typical}
            </p>
          )}
        </InfoPanel>
      )}
    </div>
  )
}
