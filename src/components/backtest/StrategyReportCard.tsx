/**
 * Strategy Report Card — the hero component.
 * Displays a letter grade, metric breakdowns, benchmark comparison,
 * and collapsible expert insights.
 */

import { useState } from 'react'
import {
  Star,
  ThumbsUp,
  Target,
  Shield,
  TrendingUp,
  TrendingDown,
  Rocket,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Info,
  Clock,
  Scale,
  Settings,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BacktestMetrics } from '@/engine/types'
import {
  gradeStrategy,
  compareToBenchmark,
  gradeColor,
  gradeRingColor,
  insightTypeCounts,
  type LetterGrade,
  type Insight,
} from '@/lib/strategy-grader'

interface StrategyReportCardProps {
  metrics: BacktestMetrics
  startDate?: string
  endDate?: string
  initialCapital?: number
  spyReturn?: number | null
  compact?: boolean
}

// Map insight icon names to Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  star: Star,
  thumbsUp: ThumbsUp,
  target: Target,
  shield: Shield,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  rocket: Rocket,
  alertTriangle: AlertTriangle,
  alertCircle: AlertCircle,
  xCircle: XCircle,
  info: Info,
  clock: Clock,
  scale: Scale,
  settings: Settings,
  calendar: Calendar,
  barChart: BarChart3,
}

const INSIGHT_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  strength: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  weakness: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    text: 'text-red-700 dark:text-red-300',
  },
  observation: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    text: 'text-blue-700 dark:text-blue-300',
  },
  suggestion: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    text: 'text-amber-700 dark:text-amber-300',
  },
}

function progressBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-sky-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function StrategyReportCard({
  metrics,
  spyReturn,
  compact = false,
}: StrategyReportCardProps) {
  const [insightsExpanded, setInsightsExpanded] = useState(false)
  const [methodologyExpanded, setMethodologyExpanded] = useState(false)
  const grade = gradeStrategy(metrics)
  const benchmark = compareToBenchmark(metrics, spyReturn ?? null)
  const counts = insightTypeCounts(grade.insights)

  if (compact) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <GradeCircle letter={grade.letter} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Strategy Grade: <span className={gradeColor(grade.letter)}>{grade.letter}</span>
                {' '}&middot;{' '}
                Score: {grade.score}/100
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {metrics.totalReturn >= 0 ? '+' : ''}{metrics.totalReturn.toFixed(1)}% return
                {' '}&middot;{' '}
                Sharpe {metrics.sharpeRatio.toFixed(2)}
                {benchmark && (
                  <>
                    {' '}&middot;{' '}
                    Alpha: {benchmark.alpha >= 0 ? '+' : ''}{benchmark.alpha.toFixed(1)}%
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Strategy Report Card</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grade + Summary */}
        <div className="flex items-start gap-5">
          <GradeCircle letter={grade.letter} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground leading-relaxed">
              Your strategy earned{' '}
              <span className="font-semibold">
                {metrics.totalReturn >= 0 ? '+' : ''}{metrics.totalReturn.toFixed(1)}%
              </span>{' '}
              with a Sharpe of{' '}
              <span className="font-semibold">{metrics.sharpeRatio.toFixed(2)}</span>
              {benchmark && (
                <>
                  , {benchmark.alpha >= 0 ? 'beating' : 'trailing'} the S&P 500 by{' '}
                  <span className="font-semibold">
                    {Math.abs(benchmark.alpha).toFixed(1)}%
                  </span>
                </>
              )}
              .{' '}
              Risk-adjusted performance:{' '}
              <span className={`font-semibold ${gradeColor(grade.letter)}`}>
                {grade.score >= 80 ? 'EXCELLENT' : grade.score >= 60 ? 'GOOD' : grade.score >= 40 ? 'FAIR' : 'POOR'}
              </span>
            </p>
          </div>
        </div>

        {/* Collapsible Grade Methodology */}
        <div>
          <button
            onClick={() => setMethodologyExpanded(!methodologyExpanded)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left"
          >
            {methodologyExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            <span>How is this grade calculated?</span>
          </button>

          {methodologyExpanded && (
            <GradeMethodologyPanel breakdown={grade.breakdown} />
          )}
        </div>

        {/* Metric Breakdown Bars */}
        <div className="space-y-3">
          {grade.breakdown.map(b => (
            <div key={b.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{b.label}</span>
                <span className="text-foreground font-medium">
                  {b.normalizedScore}/100{' '}
                  <span className="text-muted-foreground">{b.grade}</span>
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all ${progressBarColor(b.normalizedScore)}`}
                  style={{ width: `${b.normalizedScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Benchmark Comparison */}
        {benchmark && (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs font-medium text-foreground mb-1">vs S&P 500</p>
            <p className="text-sm font-mono">
              <span className={metrics.totalReturn >= 0 ? 'text-success' : 'text-destructive'}>
                {metrics.totalReturn >= 0 ? '+' : ''}{metrics.totalReturn.toFixed(1)}%
              </span>
              {' '}vs{' '}
              <span className="text-muted-foreground">
                {benchmark.spyReturn >= 0 ? '+' : ''}{benchmark.spyReturn.toFixed(1)}%
              </span>
              {' '}
              <span className={`font-semibold ${benchmark.alpha >= 0 ? 'text-success' : 'text-destructive'}`}>
                (alpha: {benchmark.alpha >= 0 ? '+' : ''}{benchmark.alpha.toFixed(1)}%)
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{benchmark.verdict}</p>
          </div>
        )}

        {/* Collapsible Insights */}
        {grade.insights.length > 0 && (
          <div>
            <button
              onClick={() => setInsightsExpanded(!insightsExpanded)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left"
            >
              {insightsExpanded ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )}
              <span>
                Expert Insights
                <span className="ml-1 text-xs">
                  ({counts.strengths > 0 ? `${counts.strengths} strength${counts.strengths > 1 ? 's' : ''}` : ''}
                  {counts.strengths > 0 && (counts.weaknesses > 0 || counts.suggestions > 0) ? ', ' : ''}
                  {counts.weaknesses > 0 ? `${counts.weaknesses} warning${counts.weaknesses > 1 ? 's' : ''}` : ''}
                  {counts.weaknesses > 0 && counts.suggestions > 0 ? ', ' : ''}
                  {counts.suggestions > 0 ? `${counts.suggestions} tip${counts.suggestions > 1 ? 's' : ''}` : ''})
                </span>
              </span>
            </button>

            {insightsExpanded && (
              <div className="mt-3 space-y-2">
                {grade.insights.map((insight, i) => (
                  <InsightItem key={i} insight={insight} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GradeCircle({ letter, size }: { letter: LetterGrade; size: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 80 : 48
  const strokeWidth = size === 'lg' ? 4 : 3
  const radius = (dim - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const fontSize = size === 'lg' ? 'text-2xl' : 'text-base'

  return (
    <div className="flex-shrink-0 relative" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="rotate-[-90deg]">
        {/* Background ring */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        {/* Colored ring */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          className={gradeRingColor(letter)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.15}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${fontSize} ${gradeColor(letter)}`}>{letter}</span>
      </div>
    </div>
  )
}

const GRADE_SCALE: { grade: string; range: string }[] = [
  { grade: 'A+', range: '97–100' },
  { grade: 'A', range: '93–96' },
  { grade: 'A-', range: '90–92' },
  { grade: 'B+', range: '87–89' },
  { grade: 'B', range: '83–86' },
  { grade: 'B-', range: '80–82' },
  { grade: 'C+', range: '77–79' },
  { grade: 'C', range: '73–76' },
  { grade: 'C-', range: '70–72' },
  { grade: 'D+', range: '65–69' },
  { grade: 'D', range: '55–64' },
  { grade: 'F', range: '<55' },
]

const IMPROVEMENT_TIPS: Record<string, string> = {
  sharpeRatio: 'Reduce position sizes, add stop-losses, or diversify across more symbols to smooth returns.',
  totalReturn: 'Relax take-profit targets, improve entry timing, or test trending stocks with stronger momentum.',
  maxDrawdown: 'Set tighter stop-losses (5–7%), reduce position sizes during losing streaks.',
  winRate: 'Add confirmation filters (e.g. RSI + volume together), raise signal quality thresholds.',
  profitFactor: 'Tighten stop-losses to cut big losers, widen take-profit targets, review patterns behind your largest losses.',
  totalTrades: 'Extend the backtest period, add more symbols, or relax entry filters to generate more signals.',
}

function GradeMethodologyPanel({ breakdown }: { breakdown: import('@/lib/strategy-grader').MetricBreakdown[] }) {
  return (
    <div className="mt-3 space-y-4 bg-muted rounded-lg p-4 text-xs">
      {/* Grading Formula */}
      <div>
        <p className="font-semibold text-foreground mb-1">Grading Formula</p>
        <p className="text-muted-foreground leading-relaxed">
          Each metric is normalized to a 0–100 scale, then multiplied by its weight.
          The weighted scores are summed into a composite score (0–100), which maps to a letter grade.
        </p>
      </div>

      {/* Metric Weights */}
      <div>
        <p className="font-semibold text-foreground mb-1">Metric Weights</p>
        <div className="space-y-1">
          {breakdown.map(b => (
            <div key={b.key} className="flex items-center justify-between">
              <span className="text-muted-foreground">{b.label}</span>
              <span className="text-foreground font-medium">{(b.weight * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Scale */}
      <div>
        <p className="font-semibold text-foreground mb-1">Grade Scale</p>
        <div className="grid grid-cols-4 gap-x-4 gap-y-0.5">
          {GRADE_SCALE.map(g => (
            <div key={g.grade} className="flex items-center justify-between">
              <span className="font-medium text-foreground">{g.grade}</span>
              <span className="text-muted-foreground">{g.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How to Improve */}
      <div>
        <p className="font-semibold text-foreground mb-1">How to Improve</p>
        <div className="space-y-1.5">
          {[...breakdown]
            .sort((a, b) => b.weight - a.weight)
            .map(b => (
              <div key={b.key}>
                <span className="text-foreground font-medium">{b.label}:</span>{' '}
                <span className="text-muted-foreground">{IMPROVEMENT_TIPS[b.key] ?? 'Review this metric for optimization opportunities.'}</span>
              </div>
            ))}
        </div>
        <p className="text-muted-foreground mt-2 italic">
          Pro tip: Sharpe Ratio has the highest weight (25%), so improving risk-adjusted returns has the biggest impact on your grade.
        </p>
      </div>
    </div>
  )
}

function InsightItem({ insight }: { insight: Insight }) {
  const style = INSIGHT_STYLES[insight.type] || INSIGHT_STYLES.observation
  const IconComponent = ICON_MAP[insight.icon] || Info

  return (
    <div className={`rounded-lg border p-3 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-2">
        <IconComponent className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.text}`} />
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${style.text}`}>{insight.title}</p>
          <p className={`text-xs mt-0.5 ${style.text} opacity-90`}>{insight.body}</p>
        </div>
      </div>
    </div>
  )
}
