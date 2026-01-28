/**
 * Metrics bar chart using Recharts.
 * Shows win/loss trade distribution.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { ClosedTrade } from '@/engine/types'

interface MetricsBarChartProps {
  trades: ClosedTrade[]
  height?: number
}

export default function MetricsBarChart({ trades, height = 250 }: MetricsBarChartProps) {
  if (trades.length === 0) {
    return <div className="text-gray-400 text-center py-8">No trades to display</div>
  }

  const chartData = trades.map((trade, i) => ({
    name: `${trade.symbol} #${i + 1}`,
    pnl: Number(trade.pnlPercent.toFixed(2)),
    symbol: trade.symbol,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          formatter={((value: number) => [`${Number(value).toFixed(2)}%`, 'P&L']) as any}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
        />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
