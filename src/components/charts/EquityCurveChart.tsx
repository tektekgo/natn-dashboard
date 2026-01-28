/**
 * Equity curve chart using Recharts.
 * Shows portfolio value over time.
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
import type { PortfolioSnapshot } from '@/engine/types'

interface EquityCurveChartProps {
  data: PortfolioSnapshot[]
  height?: number
}

export default function EquityCurveChart({ data, height = 300 }: EquityCurveChartProps) {
  if (data.length === 0) {
    return <div className="text-gray-400 text-center py-8">No data available</div>
  }

  const chartData = data.map(s => ({
    date: s.date,
    equity: Number(s.equity.toFixed(2)),
    cash: Number(s.cash.toFixed(2)),
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
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
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={((value: number) => [`$${value.toLocaleString()}`, 'Equity']) as any}
          labelFormatter={((label: string) => `Date: ${label}`) as any}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
        />
        <Area
          type="monotone"
          dataKey="equity"
          stroke="#0ea5e9"
          strokeWidth={2}
          fill="url(#equityGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
