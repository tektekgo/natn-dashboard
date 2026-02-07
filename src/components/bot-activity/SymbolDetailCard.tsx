/**
 * Per-symbol card showing action badge, signal scores with horizontal bars,
 * radar chart, and reason list.
 */

import SignalScoreRadar from '@/components/charts/SignalScoreRadar'
import LearnTip from './LearnTip'
import { parseSignals, ACTION_COLORS, ACTION_LABELS } from '@/lib/bot-activity-utils'
import type { BotExecutionDetail, DetailAction } from '@/types/bot-activity'

const SIGNAL_TIPS: Record<string, { tip: string; detail: string }> = {
  Technical: {
    tip: 'Score based on price indicators like RSI (momentum) and SMA crossovers (trend). Analyzes recent price action to gauge if the stock is overbought, oversold, or trending.',
    detail: 'High score = bullish technicals (e.g., RSI oversold + SMA uptrend).',
  },
  Fundamental: {
    tip: 'Score based on company financials: P/E ratio, EPS growth, beta, and dividends. Evaluates whether the stock is fairly valued based on its earnings and growth.',
    detail: 'High score = strong fundamentals (e.g., low P/E + growing earnings).',
  },
  Sentiment: {
    tip: 'Score based on recent news article sentiment analysis. Uses NLP to determine if media coverage is bullish, bearish, or neutral for this stock.',
    detail: 'High score = positive news buzz. Low article count means less data confidence.',
  },
  Combined: {
    tip: 'Weighted average of all signal scores. Your strategy config defines the weight for each signal type (e.g., 50% technical, 30% fundamental, 20% sentiment).',
    detail: 'This final score determines the bot\'s action: buy if above threshold, skip if below.',
  },
}

interface SymbolDetailCardProps {
  detail: BotExecutionDetail
}

function ActionBadge({ action }: { action: DetailAction }) {
  const color = ACTION_COLORS[action]
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border"
      style={{
        color,
        backgroundColor: `${color}20`,
        borderColor: `${color}40`,
      }}
    >
      {ACTION_LABELS[action]}
    </span>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const width = Math.max(0, Math.min(100, score))
  let barColor = '#6b7280'
  if (score >= 70) barColor = '#10b981'
  else if (score >= 50) barColor = '#0ea5e9'
  else if (score >= 30) barColor = '#f59e0b'
  else barColor = '#ef4444'

  const tipData = SIGNAL_TIPS[label]

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-muted-foreground shrink-0 inline-flex items-center">
        {label}
        {tipData && <LearnTip tip={tipData.tip} detail={tipData.detail} size={11} />}
      </span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${width}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="w-8 text-right text-foreground font-medium">{Math.round(score)}</span>
    </div>
  )
}

export default function SymbolDetailCard({ detail }: SymbolDetailCardProps) {
  const signals = parseSignals(detail.signals)

  const allReasons = [
    ...(signals.technical?.reasons ?? []),
    ...(signals.fundamental?.reasons ?? []),
    ...(signals.sentiment?.reasons ?? []),
    ...(signals.combined?.reasons ?? []),
  ]

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Header: symbol + action + price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{detail.symbol}</span>
          <ActionBadge action={detail.action} />
        </div>
        {detail.price != null && (
          <span className="text-sm text-muted-foreground">
            ${detail.price.toFixed(2)}
            {detail.quantity != null && ` × ${detail.quantity}`}
          </span>
        )}
      </div>

      {/* Score bars */}
      <div className="space-y-1.5">
        {signals.technical && <ScoreBar label="Technical" score={signals.technical.score} />}
        {signals.fundamental && <ScoreBar label="Fundamental" score={signals.fundamental.score} />}
        {signals.sentiment && <ScoreBar label="Sentiment" score={signals.sentiment.score} />}
        {signals.combined && (
          <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/50">
            <span className="w-24 text-muted-foreground font-medium shrink-0 inline-flex items-center">
              Combined
              <LearnTip tip={SIGNAL_TIPS.Combined.tip} detail={SIGNAL_TIPS.Combined.detail} size={11} />
            </span>
            <span className="text-foreground font-bold">{Math.round(signals.combined.totalScore)}</span>
          </div>
        )}
      </div>

      {/* Radar chart — below bars for better readability, click to enlarge */}
      <div className="flex justify-center">
        <SignalScoreRadar signals={signals} size={180} symbol={detail.symbol} expandable />
      </div>

      {/* Reasons */}
      {allReasons.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium inline-flex items-center">
            Reasons
            <LearnTip
              tip="The bot explains why it chose each action. These come from the signal analyzers — e.g., 'RSI below 30 (oversold)' or 'P/E ratio above maximum threshold'. Reading these helps you understand and refine your strategy."
              size={10}
            />
          </p>
          <ul className="space-y-0.5">
            {allReasons.slice(0, 5).map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                <span className="text-muted-foreground/50 mt-0.5">•</span>
                <span>{r}</span>
              </li>
            ))}
            {allReasons.length > 5 && (
              <li className="text-xs text-muted-foreground/60">+{allReasons.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Reason from detail row (if different from signal reasons) */}
      {detail.reason && !allReasons.includes(detail.reason) && (
        <p className="text-xs text-muted-foreground italic">{detail.reason}</p>
      )}
    </div>
  )
}
