/**
 * 3-axis radar chart showing technical, fundamental, and sentiment scores.
 * Supports inline display and an enlarged modal view with full details.
 */

import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X, Maximize2 } from 'lucide-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'
import type { ParsedSignals } from '@/types/bot-activity'

interface SignalScoreRadarProps {
  signals: ParsedSignals
  size?: number
  /** Symbol name shown in modal title */
  symbol?: string
  /** Enable click-to-enlarge modal */
  expandable?: boolean
}

interface RadarDataPoint {
  axis: string
  score: number
  fullMark: number
}

function buildData(signals: ParsedSignals): RadarDataPoint[] {
  return [
    { axis: 'Technical', score: signals.technical?.score ?? 0, fullMark: 100 },
    { axis: 'Fundamental', score: signals.fundamental?.score ?? 0, fullMark: 100 },
    { axis: 'Sentiment', score: signals.sentiment?.score ?? 0, fullMark: 100 },
  ]
}

function RadarChartInner({
  data,
  size,
  isDark,
  showTooltip,
  showValues,
}: {
  data: RadarDataPoint[]
  size: number
  isDark: boolean
  showTooltip?: boolean
  showValues?: boolean
}) {
  const gridColor = isDark ? 'hsl(217 32.6% 25%)' : '#e5e7eb'
  const tickColor = isDark ? 'hsl(215 20.2% 65.1%)' : '#9ca3af'
  const tooltipBg = isDark ? 'hsl(222.2 84% 4.9%)' : 'white'
  const tooltipBorder = isDark ? 'hsl(217 32.6% 17.5%)' : '#e5e7eb'

  const fontSize = size >= 300 ? 13 : size >= 200 ? 11 : 10
  const radiusFontSize = size >= 300 ? 11 : size >= 200 ? 10 : 9

  return (
    <ResponsiveContainer width={size} height={size}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis
          dataKey="axis"
          tick={showValues ? ({
            x, y, payload,
          }: any) => {
            const item = data.find(d => d.axis === payload.value)
            return (
              <g>
                <text x={x} y={y} textAnchor="middle" fill={tickColor} fontSize={fontSize}>
                  {payload.value}
                </text>
                <text x={x} y={y + fontSize + 2} textAnchor="middle" fill={isDark ? '#e2e8f0' : '#374151'} fontSize={fontSize} fontWeight="bold">
                  {Math.round(item?.score ?? 0)}
                </text>
              </g>
            )
          } : { fontSize, fill: tickColor }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: radiusFontSize, fill: tickColor }}
          tickCount={size >= 200 ? 5 : 3}
        />
        {showTooltip && (
          <Tooltip
            formatter={((value: number) => [`${Math.round(value)} / 100`, 'Score']) as any}
            contentStyle={{
              borderRadius: '8px',
              border: `1px solid ${tooltipBorder}`,
              backgroundColor: tooltipBg,
              fontSize: '12px',
            }}
          />
        )}
        <Radar
          name="Score"
          dataKey="score"
          stroke="#0ea5e9"
          fill="#0ea5e9"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// Score interpretation
function getScoreLabel(score: number): { text: string; color: string } {
  if (score >= 70) return { text: 'Strong', color: 'text-emerald-400' }
  if (score >= 50) return { text: 'Moderate', color: 'text-sky-400' }
  if (score >= 30) return { text: 'Weak', color: 'text-amber-400' }
  return { text: 'Very Weak', color: 'text-red-400' }
}

const SIGNAL_DESCRIPTIONS: Record<string, string> = {
  Technical: 'Analyzes price momentum (RSI) and trend direction (SMA crossovers) to determine if the stock is overbought, oversold, or trending.',
  Fundamental: 'Evaluates company financials — P/E ratio, EPS growth, beta, and dividend yield — to assess whether the stock is fairly valued.',
  Sentiment: 'Uses NLP on recent news articles to gauge whether media coverage is bullish, bearish, or neutral for this stock.',
}

export default function SignalScoreRadar({ signals, size = 180, symbol, expandable = false }: SignalScoreRadarProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [open, setOpen] = useState(false)

  const data = buildData(signals)
  const hasData = data.some(d => d.score > 0)

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-xs"
        style={{ width: size, height: size }}
      >
        No signals
      </div>
    )
  }

  const radarInline = (
    <RadarChartInner data={data} size={size} isDark={isDark} showTooltip={false} showValues={false} />
  )

  if (!expandable) return radarInline

  return (
    <>
      {/* Clickable inline radar */}
      <button
        onClick={() => setOpen(true)}
        className="relative group cursor-pointer rounded-lg hover:bg-muted/30 transition-colors"
        aria-label="Click to enlarge signal radar chart"
      >
        {radarInline}
        <span className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-70 transition-opacity text-muted-foreground">
          <Maximize2 size={14} />
        </span>
      </button>

      {/* Enlarged modal */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-xl border bg-card shadow-lg w-[90vw] max-w-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            <DialogPrimitive.Title className="text-lg font-semibold text-foreground mb-1">
              Signal Analysis{symbol ? ` — ${symbol}` : ''}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground mb-4">
              Each axis represents a signal score (0–100). A larger, balanced triangle means strong signals across all dimensions.
            </DialogPrimitive.Description>

            {/* Large radar */}
            <div className="flex justify-center mb-4">
              <RadarChartInner data={data} size={340} isDark={isDark} showTooltip={true} showValues={true} />
            </div>

            {/* Score breakdown */}
            <div className="space-y-3">
              {data.map(d => {
                const grade = getScoreLabel(d.score)
                return (
                  <div key={d.axis} className="flex items-start gap-3">
                    <div className="w-20 shrink-0">
                      <p className="text-sm font-medium text-foreground">{d.axis}</p>
                      <p className={`text-xs font-semibold ${grade.color}`}>{Math.round(d.score)} — {grade.text}</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(0, Math.min(100, d.score))}%`,
                            backgroundColor: '#0ea5e9',
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{SIGNAL_DESCRIPTIONS[d.axis]}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Interpretation hint */}
            <div className="mt-4 rounded-lg bg-muted/30 border border-border/50 p-3">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">How to read this:</strong> A large, evenly-shaped triangle means the stock scores well across all signal types.
                A lopsided triangle (e.g., high technical but low fundamental) means the signals disagree — the bot's combined weighting determines the final action.
              </p>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
