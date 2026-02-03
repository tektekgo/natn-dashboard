/**
 * Backtest progress indicator.
 * Shows current phase and progress bar during backtest execution.
 */

import { Progress } from '@/components/ui/progress'
import type { BacktestProgress as BacktestProgressType } from '@/engine/types'

interface BacktestProgressProps {
  progress: BacktestProgressType
}

const phaseLabels: Record<string, string> = {
  fetching_prices: 'Fetching Price Data',
  fetching_fundamentals: 'Fetching Fundamentals',
  simulating: 'Running Simulation',
  calculating_metrics: 'Calculating Metrics',
  complete: 'Complete',
}

export default function BacktestProgress({ progress }: BacktestProgressProps) {
  const percent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0
  const label = phaseLabels[progress.phase] || progress.phase

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{progress.message}</span>
      </div>
      <Progress value={Math.min(percent, 100)} />
    </div>
  )
}
