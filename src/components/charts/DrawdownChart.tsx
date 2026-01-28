/**
 * Drawdown chart using Recharts.
 * Shows drawdown percentage over time as a filled area (below zero).
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
import { calculateDrawdownSeries } from '@/engine/metrics/equity-curve'
import type { PortfolioSnapshot } from '@/engine/types'

interface DrawdownChartProps {
  equityCurve: PortfolioSnapshot[]
  height?: number
}

export default function DrawdownChart({ equityCurve, height = 200 }: DrawdownChartProps) {
  if (equityCurve.length === 0) {
    return <div className="text-gray-400 text-center py-8">No data available</div>
  }

  const drawdownData = calculateDrawdownSeries(equityCurve)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={drawdownData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickFormatter={(d: string) => d.substring(5)}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickFormatter={(v: number) => `${v.toFixed(1)}%`}
          domain={['dataMin', 0]}
        />
        <Tooltip
          formatter={((value: number) => [`${Number(value).toFixed(2)}%`, 'Drawdown']) as any}
          labelFormatter={((label: string) => `Date: ${label}`) as any}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
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
