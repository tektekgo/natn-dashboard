/**
 * Drawdown chart using Recharts.
 * Shows drawdown percentage over time as a filled area (below zero) with theme support.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'
import { calculateDrawdownSeries } from '@/engine/metrics/equity-curve'
import type { PortfolioSnapshot } from '@/engine/types'

interface DrawdownChartProps {
  equityCurve: PortfolioSnapshot[]
  height?: number
}

export default function DrawdownChart({ equityCurve, height = 200 }: DrawdownChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (equityCurve.length === 0) {
    return <div className="text-muted-foreground text-center py-8">No data available</div>
  }

  const drawdownData = calculateDrawdownSeries(equityCurve)

  const gridColor = isDark ? 'hsl(217 32.6% 17.5%)' : '#f3f4f6'
  const tickColor = isDark ? 'hsl(215 20.2% 65.1%)' : '#9ca3af'
  const tooltipBg = isDark ? 'hsl(222.2 84% 4.9%)' : 'white'
  const tooltipBorder = isDark ? 'hsl(217 32.6% 17.5%)' : '#e5e7eb'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={drawdownData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
          tickFormatter={(v: number) => `${v.toFixed(1)}%`}
          domain={['dataMin', 0]}
        />
        <Tooltip
          formatter={((value: number) => [`${Number(value).toFixed(2)}%`, 'Drawdown']) as any}
          labelFormatter={((label: string) => `Date: ${label}`) as any}
          contentStyle={{
            borderRadius: '8px',
            border: `1px solid ${tooltipBorder}`,
            backgroundColor: tooltipBg,
          }}
        />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="#ef4444"
          strokeWidth={1.5}
          fill="url(#drawdownGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
