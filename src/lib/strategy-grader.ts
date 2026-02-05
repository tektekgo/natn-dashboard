/**
 * Strategy grading algorithm and insights engine.
 * Produces a letter grade (A+ through F) and expert-level insights.
 */

import type { BacktestMetrics } from '@/engine/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LetterGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F'

export type InsightType = 'strength' | 'weakness' | 'observation' | 'suggestion'

export interface Insight {
  type: InsightType
  icon: string
  title: string
  body: string
  priority: number // 1 = highest
}

export interface GradeResult {
  letter: LetterGrade
  score: number // 0-100 composite
  breakdown: MetricBreakdown[]
  insights: Insight[]
}

export interface MetricBreakdown {
  key: string
  label: string
  rawValue: number
  normalizedScore: number // 0-100
  weight: number
  grade: string
}

export interface BenchmarkComparison {
  strategyReturn: number
  spyReturn: number
  alpha: number
  verdict: string
}

// ---------------------------------------------------------------------------
// Grading weights
// ---------------------------------------------------------------------------

const METRIC_WEIGHTS: { key: string; label: string; weight: number }[] = [
  { key: 'sharpeRatio', label: 'Sharpe Ratio', weight: 0.25 },
  { key: 'totalReturn', label: 'Total Return', weight: 0.20 },
  { key: 'maxDrawdown', label: 'Max Drawdown', weight: 0.20 },
  { key: 'winRate', label: 'Win Rate', weight: 0.15 },
  { key: 'profitFactor', label: 'Profit Factor', weight: 0.15 },
  { key: 'totalTrades', label: 'Trade Count', weight: 0.05 },
]

// ---------------------------------------------------------------------------
// Piecewise linear normalization (value → 0-100)
// ---------------------------------------------------------------------------

interface NormRange {
  min: number  // maps to 0
  low: number  // maps to 40
  mid: number  // maps to 70
  high: number // maps to 100
}

const NORM_RANGES: Record<string, NormRange> = {
  sharpeRatio:  { min: -1.0, low: 0.0, mid: 1.0, high: 3.0 },
  totalReturn:  { min: -20,  low: 0,   mid: 15,  high: 50  },
  maxDrawdown:  { min: -50,  low: -25, mid: -10, high: 0   }, // less negative = better
  winRate:      { min: 20,   low: 40,  mid: 55,  high: 75  },
  profitFactor: { min: 0,    low: 1.0, mid: 1.5, high: 3.0 },
  totalTrades:  { min: 0,    low: 10,  mid: 30,  high: 60  },
}

function piecewiseNormalize(value: number, range: NormRange): number {
  if (value <= range.min) return 0
  if (value >= range.high) return 100

  if (value <= range.low) {
    // min→low maps to 0→40
    return 40 * ((value - range.min) / (range.low - range.min))
  }
  if (value <= range.mid) {
    // low→mid maps to 40→70
    return 40 + 30 * ((value - range.low) / (range.mid - range.low))
  }
  // mid→high maps to 70→100
  return 70 + 30 * ((value - range.mid) / (range.high - range.mid))
}

function scoreToGradeLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Average'
  return 'Poor'
}

// ---------------------------------------------------------------------------
// Composite → letter grade
// ---------------------------------------------------------------------------

function compositeToLetter(score: number): LetterGrade {
  if (score >= 97) return 'A+'
  if (score >= 93) return 'A'
  if (score >= 90) return 'A-'
  if (score >= 87) return 'B+'
  if (score >= 83) return 'B'
  if (score >= 80) return 'B-'
  if (score >= 77) return 'C+'
  if (score >= 73) return 'C'
  if (score >= 70) return 'C-'
  if (score >= 65) return 'D+'
  if (score >= 55) return 'D'
  return 'F'
}

// ---------------------------------------------------------------------------
// Main grading function
// ---------------------------------------------------------------------------

export function gradeStrategy(metrics: BacktestMetrics): GradeResult {
  const breakdown: MetricBreakdown[] = []
  let weightedSum = 0

  for (const { key, label, weight } of METRIC_WEIGHTS) {
    const rawValue = getMetricValue(metrics, key)
    const range = NORM_RANGES[key]
    const normalizedScore = range ? piecewiseNormalize(rawValue, range) : 50
    weightedSum += normalizedScore * weight
    breakdown.push({
      key,
      label,
      rawValue,
      normalizedScore: Math.round(normalizedScore),
      weight,
      grade: scoreToGradeLabel(normalizedScore),
    })
  }

  const score = Math.round(weightedSum)
  const letter = compositeToLetter(score)
  const insights = generateInsights(metrics, breakdown)

  return { letter, score, breakdown, insights }
}

function getMetricValue(metrics: BacktestMetrics, key: string): number {
  switch (key) {
    case 'sharpeRatio': return metrics.sharpeRatio
    case 'totalReturn': return metrics.totalReturn
    case 'maxDrawdown': return metrics.maxDrawdown
    case 'winRate': return metrics.winRate
    case 'profitFactor': return metrics.profitFactor === Infinity ? 5 : metrics.profitFactor
    case 'totalTrades': return metrics.totalTrades
    default: return 0
  }
}

// ---------------------------------------------------------------------------
// Insights engine (~18 rules)
// ---------------------------------------------------------------------------

const OPPORTUNITY_TIPS: Record<string, string> = {
  sharpeRatio: 'Reduce position sizes, add stop-losses, or diversify across more symbols to improve risk-adjusted returns.',
  totalReturn: 'Relax take-profit targets, improve entry timing, or test trending stocks with stronger momentum.',
  maxDrawdown: 'Set a 5–7% stop-loss, reduce position sizes during losing streaks, and consider scaling out of positions.',
  winRate: 'Add confirmation filters (e.g. RSI + volume), raise signal quality thresholds to avoid low-conviction trades.',
  profitFactor: 'Tighten stop-losses to cut big losers, widen take-profit targets, and review the patterns behind your largest losses.',
  totalTrades: 'Extend the backtest period, add more symbols, or relax entry filters to generate more signals.',
}

function generateInsights(m: BacktestMetrics, breakdown: MetricBreakdown[]): Insight[] {
  const insights: Insight[] = []

  // --- BIGGEST OPPORTUNITY ---
  if (breakdown.length > 0) {
    const weakest = [...breakdown].sort((a, b) => a.normalizedScore - b.normalizedScore)[0]
    const tip = OPPORTUNITY_TIPS[weakest.key] || 'Review this metric for optimization opportunities.'
    insights.push({
      type: 'suggestion',
      icon: 'target',
      title: `Biggest Opportunity: ${weakest.label}`,
      body: `Your ${weakest.label} score is ${weakest.normalizedScore}/100 — the weakest area (weighted ${(weakest.weight * 100).toFixed(0)}% of your grade). ${tip}`,
      priority: 1,
    })
  }

  // --- STRENGTHS ---

  if (m.sharpeRatio >= 2.0) {
    insights.push({
      type: 'strength',
      icon: 'star',
      title: 'Outstanding Risk-Adjusted Returns',
      body: `A Sharpe ratio of ${m.sharpeRatio.toFixed(2)} is exceptional. Your strategy generates strong returns relative to the risk taken.`,
      priority: 1,
    })
  } else if (m.sharpeRatio >= 1.0) {
    insights.push({
      type: 'strength',
      icon: 'thumbsUp',
      title: 'Good Risk-Adjusted Returns',
      body: `A Sharpe ratio of ${m.sharpeRatio.toFixed(2)} indicates solid risk-adjusted performance — above the typical S&P 500 range.`,
      priority: 2,
    })
  }

  if (m.winRate >= 65) {
    insights.push({
      type: 'strength',
      icon: 'target',
      title: 'High Win Rate',
      body: `Winning ${m.winRate.toFixed(0)}% of trades is well above average. This suggests your entry signals are accurate.`,
      priority: 2,
    })
  }

  if (m.maxDrawdown > -10) {
    insights.push({
      type: 'strength',
      icon: 'shield',
      title: 'Well-Controlled Drawdown',
      body: `A max drawdown of only ${m.maxDrawdown.toFixed(1)}% shows excellent risk management. Most investors can tolerate this level.`,
      priority: 2,
    })
  }

  if (m.profitFactor >= 2.5 && m.profitFactor !== Infinity) {
    insights.push({
      type: 'strength',
      icon: 'trendingUp',
      title: 'Strong Profit Factor',
      body: `A profit factor of ${m.profitFactor.toFixed(2)} means you earn $${m.profitFactor.toFixed(2)} for every $1 lost. This is a strong edge.`,
      priority: 2,
    })
  }

  if (m.totalReturn >= 25) {
    insights.push({
      type: 'strength',
      icon: 'rocket',
      title: 'Impressive Total Return',
      body: `A ${m.totalReturn.toFixed(1)}% return significantly outperforms the historical S&P 500 average of ~10% annualized.`,
      priority: 3,
    })
  }

  // --- WEAKNESSES ---

  if (m.sharpeRatio < 0) {
    insights.push({
      type: 'weakness',
      icon: 'alertTriangle',
      title: 'Negative Risk-Adjusted Returns',
      body: `A Sharpe ratio of ${m.sharpeRatio.toFixed(2)} means the strategy underperforms risk-free assets. Consider revising signal logic or risk parameters.`,
      priority: 1,
    })
  }

  if (m.maxDrawdown <= -25) {
    insights.push({
      type: 'weakness',
      icon: 'alertTriangle',
      title: 'Large Drawdown Risk',
      body: `A ${m.maxDrawdown.toFixed(1)}% drawdown would require a ${((100 / (100 + m.maxDrawdown)) * 100 - 100).toFixed(0)}% gain to recover. Most traders cannot stomach this.`,
      priority: 1,
    })
  } else if (m.maxDrawdown <= -15) {
    insights.push({
      type: 'weakness',
      icon: 'alertCircle',
      title: 'Moderate Drawdown',
      body: `A ${m.maxDrawdown.toFixed(1)}% drawdown is in the moderate range. Consider tighter stop-losses or smaller position sizes.`,
      priority: 3,
    })
  }

  if (m.profitFactor < 1.0 && m.profitFactor !== Infinity && m.totalTrades > 0) {
    insights.push({
      type: 'weakness',
      icon: 'alertTriangle',
      title: 'No Trading Edge',
      body: `A profit factor of ${m.profitFactor.toFixed(2)} (below 1.0) means losses exceed gains. The strategy is losing money on a per-dollar basis.`,
      priority: 1,
    })
  }

  if (m.winRate < 40 && m.totalTrades >= 10) {
    insights.push({
      type: 'weakness',
      icon: 'xCircle',
      title: 'Low Win Rate',
      body: `Only ${m.winRate.toFixed(0)}% of trades are profitable. Unless your average win is much larger than your average loss, this is unsustainable.`,
      priority: 2,
    })

    if (m.winRate < 45 && m.avgWinPercent > 0 && m.avgLossPercent < 0) {
      const rewardRisk = m.avgWinPercent / Math.abs(m.avgLossPercent)
      if (rewardRisk < 1.5) {
        insights.push({
          type: 'suggestion',
          icon: 'target',
          title: 'Improve Entry Quality',
          body: `Your reward-to-risk ratio is only ${rewardRisk.toFixed(1)}:1, too low for a ${m.winRate.toFixed(0)}% win rate. Add confirmation indicators (e.g. RSI + volume together) and filter for higher-quality setups to improve accuracy.`,
          priority: 2,
        })
      }
    }
  }

  if (m.totalReturn < 0) {
    insights.push({
      type: 'weakness',
      icon: 'trendingDown',
      title: 'Negative Returns',
      body: `The strategy lost ${Math.abs(m.totalReturn).toFixed(1)}% overall. Review entry/exit rules and risk management.`,
      priority: 1,
    })
  }

  // --- OBSERVATIONS ---

  if (m.totalTrades < 10) {
    insights.push({
      type: 'observation',
      icon: 'info',
      title: 'Very Few Trades',
      body: `Only ${m.totalTrades} trades were executed. This is too few for statistically reliable conclusions — results may be driven by luck.`,
      priority: 2,
    })
  } else if (m.totalTrades < 20) {
    insights.push({
      type: 'observation',
      icon: 'info',
      title: 'Limited Trade Sample',
      body: `${m.totalTrades} trades is a small sample. Consider a longer backtest period to get more reliable statistics (aim for 30+).`,
      priority: 3,
    })
  }

  if (m.avgHoldingDays <= 2 && m.totalTrades > 5) {
    insights.push({
      type: 'observation',
      icon: 'clock',
      title: 'Short-Term Trading Pattern',
      body: `Average holding of ${m.avgHoldingDays.toFixed(1)} days indicates a very active strategy. Real-world slippage and commissions could significantly erode returns.`,
      priority: 3,
    })
  }

  if (m.avgWinPercent > 0 && m.avgLossPercent < 0) {
    const rewardRisk = m.avgWinPercent / Math.abs(m.avgLossPercent)
    if (rewardRisk < 1) {
      insights.push({
        type: 'observation',
        icon: 'scale',
        title: 'Win/Loss Size Asymmetry',
        body: `Average win (+${m.avgWinPercent.toFixed(1)}%) is smaller than average loss (${m.avgLossPercent.toFixed(1)}%). You need a high win rate to compensate.`,
        priority: 3,
      })
    } else if (rewardRisk >= 2) {
      insights.push({
        type: 'strength',
        icon: 'scale',
        title: 'Favorable Reward-to-Risk',
        body: `Average win is ${rewardRisk.toFixed(1)}x average loss. This means even a moderate win rate can be highly profitable.`,
        priority: 3,
      })
    }
  }

  // --- SUGGESTIONS ---

  if (m.maxDrawdown <= -15) {
    const suggestedStop = Math.max(3, Math.round(Math.abs(m.maxDrawdown) * 0.6))
    insights.push({
      type: 'suggestion',
      icon: 'settings',
      title: 'Tighten Stop-Loss',
      body: `Your ${m.maxDrawdown.toFixed(1)}% max drawdown suggests stops are too wide. Try setting stop-loss at ${suggestedStop}% to limit future drawdowns. A tighter stop may reduce win rate slightly but protect capital.`,
      priority: 3,
    })
  }

  if (m.totalTrades < 20) {
    insights.push({
      type: 'suggestion',
      icon: 'calendar',
      title: 'Extend Backtest Period',
      body: `With only ${m.totalTrades} trades, results are unreliable. Extend your backtest to 1–2 years (or until you get 30+ trades) to capture both bull and bear market cycles and increase statistical significance.`,
      priority: 3,
    })
  }

  if (m.sharpeRatio < 0.8 && m.maxDrawdown <= -20) {
    insights.push({
      type: 'suggestion',
      icon: 'settings',
      title: 'Reduce Position Size',
      body: `Your Sharpe of ${m.sharpeRatio.toFixed(2)} combined with a ${m.maxDrawdown.toFixed(1)}% max drawdown suggests positions may be too large. Try reducing position size to 50–70% of current to smooth returns and limit drawdowns.`,
      priority: 2,
    })
  }

  if (m.totalReturn > 0 && m.sharpeRatio < 0.5) {
    insights.push({
      type: 'suggestion',
      icon: 'barChart',
      title: 'Reduce Volatility',
      body: `Your returns are positive (+${m.totalReturn.toFixed(1)}%) but your Sharpe of ${m.sharpeRatio.toFixed(2)} is below 0.5, indicating high volatility. Target a Sharpe above 1.0 by reducing position sizes or diversifying across more symbols to smooth the equity curve.`,
      priority: 3,
    })
  }

  // Sort by priority (lower number = higher priority)
  insights.sort((a, b) => a.priority - b.priority)

  return insights
}

// ---------------------------------------------------------------------------
// Benchmark comparison
// ---------------------------------------------------------------------------

export function compareToBenchmark(
  metrics: BacktestMetrics,
  spyReturn: number | null
): BenchmarkComparison | null {
  if (spyReturn === null) return null

  const alpha = metrics.totalReturn - spyReturn
  let verdict: string

  if (alpha > 10) {
    verdict = 'Significantly outperformed the market'
  } else if (alpha > 3) {
    verdict = 'Outperformed the market'
  } else if (alpha > -3) {
    verdict = 'Performed roughly in line with the market'
  } else if (alpha > -10) {
    verdict = 'Underperformed the market'
  } else {
    verdict = 'Significantly underperformed the market'
  }

  return {
    strategyReturn: metrics.totalReturn,
    spyReturn,
    alpha,
    verdict,
  }
}

// ---------------------------------------------------------------------------
// Color helpers for grade display
// ---------------------------------------------------------------------------

export function gradeColor(letter: LetterGrade): string {
  if (letter.startsWith('A')) return 'text-emerald-600 dark:text-emerald-400'
  if (letter.startsWith('B')) return 'text-sky-600 dark:text-sky-400'
  if (letter.startsWith('C')) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

export function gradeRingColor(letter: LetterGrade): string {
  if (letter.startsWith('A')) return 'stroke-emerald-500'
  if (letter.startsWith('B')) return 'stroke-sky-500'
  if (letter.startsWith('C')) return 'stroke-amber-500'
  return 'stroke-red-500'
}

export function gradeBgColor(letter: LetterGrade): string {
  if (letter.startsWith('A')) return 'bg-emerald-500'
  if (letter.startsWith('B')) return 'bg-sky-500'
  if (letter.startsWith('C')) return 'bg-amber-500'
  return 'bg-red-500'
}

export function insightTypeCounts(insights: Insight[]): { strengths: number; weaknesses: number; observations: number; suggestions: number } {
  return {
    strengths: insights.filter(i => i.type === 'strength').length,
    weaknesses: insights.filter(i => i.type === 'weakness').length,
    observations: insights.filter(i => i.type === 'observation').length,
    suggestions: insights.filter(i => i.type === 'suggestion').length,
  }
}
