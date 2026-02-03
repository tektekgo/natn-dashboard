/**
 * Comparison chart for overlaid equity curves (Phase 4B).
 * Uses Recharts to show multiple strategy equity curves on the same chart with theme support.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'
import { normalizeEquityCurves } from '@/engine/metrics/equity-curve'
import type { ComparisonResult } from '@/engine/types'

interface ComparisonChartProps {
  results: ComparisonResult[]
  height?: number
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1']

export default function ComparisonChart({ results, height = 400 }: ComparisonChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (results.length === 0) {
    return <div className="text-muted-foreground text-center py-8">No comparison data</div>
  }

  const normalized = normalizeEquityCurves(
    results.map(r => ({
      label: r.label,
      snapshots: r.output.equityCurve,
    }))
  )

  const dateSet = new Set<string>()
  for (const curve of normalized) {
    for (const point of curve.data) {
      dateSet.add(point.date)
    }
  }

  const allDates = Array.from(dateSet).sort()
  const chartData = allDates.map(date => {
    const row: Record<string, string | number> = { date }
    for (const curve of normalized) {
      const point = curve.data.find(p => p.date === date)
      row[curve.label] = point ? Number(point.returnPercent.toFixed(2)) : 0
    }
    return row
  })

  const gridColor = isDark ? 'hsl(217 32.6% 17.5%)' : '#f3f4f6'
  const tickColor = isDark ? 'hsl(215 20.2% 65.1%)' : '#9ca3af'
  const tooltipBg = isDark ? 'hsl(222.2 84% 4.9%)' : 'white'
  const tooltipBorder = isDark ? 'hsl(217 32.6% 17.5%)' : '#e5e7eb'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: tickColor }}
          tickFormatter={(d: string) => d.substring(5)}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: tickColor }}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          formatter={((value: number, name: string) => [`${Number(value).toFixed(2)}%`, name]) as any}
          labelFormatter={((label: string) => `Date: ${label}`) as any}
          contentStyle={{
            borderRadius: '8px',
            border: `1px solid ${tooltipBorder}`,
            backgroundColor: tooltipBg,
          }}
        />
        <Legend />
        {normalized.map((curve, i) => (
          <Line
            key={curve.label}
            type="monotone"
            dataKey={curve.label}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
