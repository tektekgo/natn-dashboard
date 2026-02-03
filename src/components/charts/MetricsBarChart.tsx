/**
 * Metrics bar chart using Recharts.
 * Shows win/loss trade distribution with theme support.
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
import { useTheme } from '@/contexts/ThemeContext'
import type { ClosedTrade } from '@/engine/types'

interface MetricsBarChartProps {
  trades: ClosedTrade[]
  height?: number
}

export default function MetricsBarChart({ trades, height = 250 }: MetricsBarChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (trades.length === 0) {
    return <div className="text-muted-foreground text-center py-8">No trades to display</div>
  }

  const chartData = trades.map((trade, i) => ({
    name: `${trade.symbol} #${i + 1}`,
    pnl: Number(trade.pnlPercent.toFixed(2)),
    symbol: trade.symbol,
  }))

  const gridColor = isDark ? 'hsl(217 32.6% 17.5%)' : '#f3f4f6'
  const tickColor = isDark ? 'hsl(215 20.2% 65.1%)' : '#9ca3af'
  const tooltipBg = isDark ? 'hsl(222.2 84% 4.9%)' : 'white'
  const tooltipBorder = isDark ? 'hsl(217 32.6% 17.5%)' : '#e5e7eb'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: tickColor }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fontSize: 11, fill: tickColor }}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          formatter={((value: number) => [`${Number(value).toFixed(2)}%`, 'P&L']) as any}
          contentStyle={{
            borderRadius: '8px',
            border: `1px solid ${tooltipBorder}`,
            backgroundColor: tooltipBg,
          }}
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
