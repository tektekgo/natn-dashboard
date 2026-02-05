/**
 * Equity curve chart with optional S&P 500 benchmark overlay.
 * Strategy = solid blue Area, SPY = dashed gray Line.
 */

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'
import { Skeleton } from '@/components/ui/skeleton'
import type { PortfolioSnapshot } from '@/engine/types'
import type { BenchmarkEquityPoint } from '@/hooks/useBenchmark'

interface EquityCurveWithBenchmarkProps {
  data: PortfolioSnapshot[]
  benchmarkData?: BenchmarkEquityPoint[]
  benchmarkLoading?: boolean
  height?: number
}

interface MergedPoint {
  date: string
  equity: number
  spyEquity?: number
}

export default function EquityCurveWithBenchmark({
  data,
  benchmarkData,
  benchmarkLoading,
  height = 300,
}: EquityCurveWithBenchmarkProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (data.length === 0) {
    return <div className="text-muted-foreground text-center py-8">No data available</div>
  }

  // Build a date→spyEquity lookup from benchmark data
  const spyByDate = new Map<string, number>()
  if (benchmarkData) {
    for (const pt of benchmarkData) {
      spyByDate.set(pt.date, pt.equity)
    }
  }

  // Merge: strategy data is the base, spy data joined by date
  const chartData: MergedPoint[] = data.map(s => ({
    date: s.date,
    equity: Number(s.equity.toFixed(2)),
    spyEquity: spyByDate.get(s.date),
  }))

  const hasBenchmark = chartData.some(d => d.spyEquity !== undefined)

  const gridColor = isDark ? 'hsl(217 32.6% 17.5%)' : '#f3f4f6'
  const tickColor = isDark ? 'hsl(215 20.2% 65.1%)' : '#9ca3af'
  const tooltipBg = isDark ? 'hsl(222.2 84% 4.9%)' : 'white'
  const tooltipBorder = isDark ? 'hsl(217 32.6% 17.5%)' : '#e5e7eb'

  return (
    <div>
      {benchmarkLoading && (
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <span className="text-xs text-muted-foreground">Loading S&P 500 benchmark...</span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="equityGradientBenchmark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: tickColor }}
            tickFormatter={(d: string) => d.substring(5)}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: tickColor }}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={((value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name === 'equity' ? 'Your Strategy' : 'S&P 500',
            ]) as any}
            labelFormatter={((label: string) => `Date: ${label}`) as any}
            contentStyle={{
              borderRadius: '8px',
              border: `1px solid ${tooltipBorder}`,
              backgroundColor: tooltipBg,
              fontSize: '12px',
            }}
          />
          {hasBenchmark && (
            <Legend
              formatter={(value: string) =>
                value === 'equity' ? 'Your Strategy' : 'S&P 500'
              }
              wrapperStyle={{ fontSize: '12px' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="equity"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="url(#equityGradientBenchmark)"
            name="equity"
          />
          {hasBenchmark && (
            <Line
              type="monotone"
              dataKey="spyEquity"
              stroke={isDark ? '#6b7280' : '#9ca3af'}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              name="spyEquity"
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
